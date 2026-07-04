// Max concurrent active AI jobs (Groq inferences)
const MAX_CONCURRENT = 3;
// Max items allowed waiting in queue
const MAX_QUEUE_SIZE = 50;
// Max time (ms) a job is allowed to wait in queue before timing out
const MAX_WAIT_TIME = 30000;

class AsyncQueue {
  constructor(concurrency) {
    this.concurrency = concurrency;
    this.active = 0;
    this.queue = [];
  }
  
  async add(fn) {
    if (this.active >= this.concurrency) {
      await new Promise(resolve => this.queue.push(resolve));
    }
    this.active++;
    try {
      return await fn();
    } finally {
      this.active--;
      if (this.queue.length > 0) {
        const next = this.queue.shift();
        next();
      }
    }
  }
}

const limit = new AsyncQueue(MAX_CONCURRENT);
let currentQueueSize = 0;

/**
 * Enqueues an AI task with strict concurrency and timeout controls.
 * Designed to be easily swappable with BullMQ/Redis later.
 * 
 * @param {string} type Name of the AI task (e.g., 'resume-analyze')
 * @param {Function} handler Async function to execute
 * @returns {Promise<any>}
 */
const enqueueAIJob = async (type, handler) => {
  if (currentQueueSize >= MAX_QUEUE_SIZE) {
    const err = new Error('AI system busy. Please retry shortly.');
    err.isQueueRejection = true;
    throw err;
  }

  currentQueueSize++;
  const enqueueTime = Date.now();

  try {
    return await limit.add(async () => {
      currentQueueSize--;
      
      const waitTime = Date.now() - enqueueTime;
      if (waitTime > MAX_WAIT_TIME) {
        const err = new Error('AI system busy. Please retry shortly.');
        err.isQueueRejection = true;
        err.queueWaitTime = waitTime;
        throw err;
      }
      
      // Circuit Breaker: Hard execution timeout (45s) to prevent LLM hang from permanently starving the queue slot
      const EXECUTION_TIMEOUT_MS = 45000;
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          const timeoutErr = new Error('LLM Circuit Breaker Tripped: Execution exceeded 45s');
          timeoutErr.isCircuitBreaker = true;
          reject(timeoutErr);
        }, EXECUTION_TIMEOUT_MS);
      });

      return await Promise.race([
        handler(waitTime),
        timeoutPromise
      ]);
    });
  } catch (err) {
    if (err.isQueueRejection === undefined && currentQueueSize > 0) {
      // It errored but never executed limit decrement if limit rejected it entirely.
    }
    throw err;
  }
};

const getQueueMetrics = () => {
  return {
    active: limit.active,
    pending: limit.queue.length,
    queueSize: currentQueueSize
  };
};

module.exports = { enqueueAIJob, getQueueMetrics };

/**
 * questionBank.js — Phase P17 Interview Question Bank
 * =====================================================
 * Each question has:
 *   - expectedConcepts: what a passing answer must mention
 *   - criticalConcepts: what a strong answer must demonstrate
 *   - penaltyTriggers: phrases/concepts that indicate fundamental misunderstanding
 *
 * Used by interviewScoringEngine.js for deterministic scoring.
 */

const questionBank = {

  // ══════════════════════════════════════════════════════
  // FRONTEND ENGINEER
  // ══════════════════════════════════════════════════════
  Frontend: {
    Fresher: [
      {
        id: 'fe-f-1',
        type: 'Technical',
        question: 'Explain the difference between useMemo and useCallback in React.',
        expectedConcepts: ['memo', 'cache', 'function', 'value', 'dependency array', 'render'],
        criticalConcepts: ['referential equality', 'child component', 'rerender', 'performance'],
        penaltyTriggers: ['same thing', 'no difference', 'useState', 'unrelated'],
      },
      {
        id: 'fe-f-2',
        type: 'Technical',
        question: 'What is the virtual DOM and why does React use it?',
        expectedConcepts: ['virtual', 'real dom', 'diffing', 'reconciliation', 'performance'],
        criticalConcepts: ['O(n) diff algorithm', 'batch updates', 'minimal re-renders'],
        penaltyTriggers: ['faster computer', 'stores data', 'replaces dom'],
      },
      {
        id: 'fe-f-3',
        type: 'Technical',
        question: 'How does the JavaScript event loop work?',
        expectedConcepts: ['call stack', 'event loop', 'callback queue', 'asynchronous', 'non-blocking'],
        criticalConcepts: ['microtask queue', 'macrotask', 'promise resolution order'],
        penaltyTriggers: ['multiple threads', 'parallel', 'synchronous only'],
      },
      {
        id: 'fe-f-4',
        type: 'Scenario',
        question: 'Your React app renders a large list of 10,000 items causing lag. How do you fix it?',
        expectedConcepts: ['virtualization', 'pagination', 'lazy loading', 'windowing'],
        criticalConcepts: ['react-window', 'react-virtual', 'intersection observer'],
        penaltyTriggers: ['faster computer', 'remove items', 'use class components'],
      },
      {
        id: 'fe-f-5',
        type: 'HR',
        question: 'Describe a challenging project you built and what you learned from it.',
        expectedConcepts: ['project', 'challenge', 'solution', 'outcome', 'learning'],
        criticalConcepts: ['specific technical detail', 'measurable outcome', 'growth'],
        penaltyTriggers: [],
      },
    ],
    Junior: [
      {
        id: 'fe-j-1',
        type: 'System Design',
        question: 'Design a scalable component library for a large enterprise frontend team.',
        expectedConcepts: ['design tokens', 'storybook', 'monorepo', 'versioning', 'documentation'],
        criticalConcepts: ['accessibility (a11y)', 'theming', 'tree shaking', 'publishing strategy'],
        penaltyTriggers: ['just use tailwind', 'single css file', 'no versioning needed'],
      },
      {
        id: 'fe-j-2',
        type: 'Technical',
        question: 'Explain React\'s reconciliation algorithm and fiber architecture.',
        expectedConcepts: ['fiber', 'reconciliation', 'priority', 'concurrent mode'],
        criticalConcepts: ['work loop', 'interruptible rendering', 'lanes'],
        penaltyTriggers: ['same as virtual dom', 'class components only'],
      },
      {
        id: 'fe-j-3',
        type: 'Technical',
        question: 'How would you implement authentication in a React SPA without a backend?',
        expectedConcepts: ['jwt', 'local storage', 'httpOnly cookie', 'token expiry', 'refresh token'],
        criticalConcepts: ['XSS vulnerability', 'CSRF', 'secure cookie flags'],
        penaltyTriggers: ['local storage is safe', 'no security concerns', 'no refresh needed'],
      },
    ],
    Senior: [
      {
        id: 'fe-s-1',
        type: 'System Design',
        question: 'Design a real-time collaborative editor (like Google Docs) on the frontend.',
        expectedConcepts: ['operational transform', 'CRDT', 'websockets', 'conflict resolution'],
        criticalConcepts: ['causal consistency', 'CRDT libraries (Yjs)', 'offline support'],
        penaltyTriggers: ['polling', 'no conflict handling', 'lock the document'],
      },
    ],
  },

  // ══════════════════════════════════════════════════════
  // BACKEND ENGINEER
  // ══════════════════════════════════════════════════════
  Backend: {
    Fresher: [
      {
        id: 'be-f-1',
        type: 'Technical',
        question: 'What is the difference between SQL and NoSQL databases? When would you choose each?',
        expectedConcepts: ['relational', 'schema', 'acid', 'horizontal scaling', 'document', 'flexible'],
        criticalConcepts: ['normalization', 'cap theorem', 'eventual consistency', 'use case specific'],
        penaltyTriggers: ['nosql is always better', 'sql is old', 'no difference'],
      },
      {
        id: 'be-f-2',
        type: 'Technical',
        question: 'Explain RESTful API design principles.',
        expectedConcepts: ['stateless', 'resource', 'http verbs', 'status codes', 'uri design'],
        criticalConcepts: ['idempotency', 'versioning', 'HATEOAS', 'proper status code usage'],
        penaltyTriggers: ['POST for everything', 'no status codes needed', 'sessions required'],
      },
      {
        id: 'be-f-3',
        type: 'Scenario',
        question: 'How would you design a notification system that needs to send 1 million emails per day?',
        expectedConcepts: ['queue', 'async', 'batch processing', 'retry logic'],
        criticalConcepts: ['message queue (Kafka/SQS)', 'rate limiting', 'dead letter queue', 'horizontal scaling'],
        penaltyTriggers: ['cron job polling', 'single server loop', 'synchronous sending'],
      },
      {
        id: 'be-f-4',
        type: 'Technical',
        question: 'What is indexing in databases and when should you use it?',
        expectedConcepts: ['index', 'query performance', 'B-tree', 'read speed'],
        criticalConcepts: ['write overhead', 'cardinality', 'composite index', 'covering index'],
        penaltyTriggers: ['index everything', 'no downsides', 'always faster'],
      },
      {
        id: 'be-f-5',
        type: 'HR',
        question: 'Tell me about a time you debugged a difficult production issue.',
        expectedConcepts: ['investigation', 'logs', 'reproduction', 'fix', 'prevention'],
        criticalConcepts: ['systematic approach', 'root cause analysis', 'monitoring improvement'],
        penaltyTriggers: [],
      },
    ],
    Junior: [
      {
        id: 'be-j-1',
        type: 'System Design',
        question: 'Design a URL shortening service like bit.ly.',
        expectedConcepts: ['hash', 'collision', 'database', 'redirect', 'caching'],
        criticalConcepts: ['base62 encoding', 'Redis cache for hot URLs', 'analytics tracking', 'rate limiting'],
        penaltyTriggers: ['sequential IDs only', 'no caching needed', 'single server'],
      },
      {
        id: 'be-j-2',
        type: 'Technical',
        question: 'Explain the differences between process, thread, and coroutine.',
        expectedConcepts: ['process isolation', 'shared memory', 'concurrency', 'async/await'],
        criticalConcepts: ['GIL in Python', 'context switching cost', 'event loop', 'green threads'],
        penaltyTriggers: ['same thing', 'no difference in practice'],
      },
    ],
    Senior: [
      {
        id: 'be-s-1',
        type: 'System Design',
        question: 'Design a distributed rate limiter that works across multiple server instances.',
        expectedConcepts: ['redis', 'token bucket', 'sliding window', 'distributed state'],
        criticalConcepts: ['lua scripts for atomicity', 'redis cluster', 'race condition prevention'],
        penaltyTriggers: ['in-memory only', 'single server assumption', 'no race condition consideration'],
      },
    ],
  },

  // ══════════════════════════════════════════════════════
  // FULLSTACK ENGINEER
  // ══════════════════════════════════════════════════════
  Fullstack: [
    {
      id: 'fs-f-1',
      type: 'Technical',
      question: 'How does server-side rendering (SSR) differ from client-side rendering (CSR)? When do you use each?',
      expectedConcepts: ['seo', 'first contentful paint', 'hydration', 'ttfb'],
      criticalConcepts: ['SEO benefits', 'streaming SSR', 'selective hydration', 'core web vitals'],
      penaltyTriggers: ['ssr is always better', 'csr is dead', 'no performance difference'],
    },
    {
      id: 'fs-f-2',
      type: 'Scenario',
      question: 'You need to design a file upload system for a portfolio site supporting up to 100MB files.',
      expectedConcepts: ['multipart', 'presigned url', 'progress', 'validation', 'storage'],
      criticalConcepts: ['S3 presigned URL', 'chunked upload', 'MIME type validation', 'virus scanning'],
      penaltyTriggers: ['base64 encode', 'store in database', 'no validation needed'],
    },
    {
      id: 'fs-f-3',
      type: 'Technical',
      question: 'Explain how you would implement role-based access control (RBAC) in a full-stack app.',
      expectedConcepts: ['roles', 'permissions', 'middleware', 'jwt claims', 'frontend guards'],
      criticalConcepts: ['server-side enforcement', 'principle of least privilege', 'route guards AND API guards'],
      penaltyTriggers: ['frontend only check', 'hide UI elements only', 'trust client'],
    },
    {
      id: 'fs-f-4',
      type: 'System Design',
      question: 'Design the backend for a real-time collaborative document editor.',
      expectedConcepts: ['websockets', 'conflict resolution', 'persistence', 'users'],
      criticalConcepts: ['operational transforms or CRDTs', 'connection management', 'reconnection strategy'],
      penaltyTriggers: ['http polling', 'no conflict resolution', 'single writer'],
    },
    {
      id: 'fs-f-5',
      type: 'HR',
      question: 'Describe a project where you owned both frontend and backend. What was the hardest architectural decision?',
      expectedConcepts: ['project scope', 'architecture decision', 'tradeoffs', 'outcome'],
      criticalConcepts: ['specific technical tradeoff', 'why vs. alternative', 'measurable result'],
      penaltyTriggers: [],
    },
  ],

  // ══════════════════════════════════════════════════════
  // AIML ENGINEER
  // ══════════════════════════════════════════════════════
  AIML: {
    Fresher: [
      {
        id: 'ml-f-1',
        type: 'Technical',
        question: 'Explain the bias-variance tradeoff in machine learning.',
        expectedConcepts: ['bias', 'variance', 'underfitting', 'overfitting', 'tradeoff'],
        criticalConcepts: ['regularization as solution', 'cross-validation', 'model complexity curve'],
        penaltyTriggers: ['bias is always bad', 'no tradeoff', 'more data always fixes it'],
      },
      {
        id: 'ml-f-2',
        type: 'Technical',
        question: 'How would you handle class imbalance in a binary classification problem?',
        expectedConcepts: ['imbalance', 'oversampling', 'undersampling', 'class weights'],
        criticalConcepts: ['SMOTE', 'precision-recall vs accuracy', 'F1 score', 'threshold adjustment'],
        penaltyTriggers: ['just use accuracy', 'ignore minority class', 'oversample randomly'],
      },
      {
        id: 'ml-f-3',
        type: 'Scenario',
        question: 'You trained a model with 99% accuracy but it performs poorly in production. Why?',
        expectedConcepts: ['data leakage', 'distribution shift', 'overfitting', 'imbalanced data'],
        criticalConcepts: ['train-test contamination', 'concept drift', 'evaluation metric mismatch'],
        penaltyTriggers: ['model is wrong', 'retrain with more data', 'change algorithm only'],
      },
    ],
    Junior: [
      {
        id: 'ml-j-1',
        type: 'System Design',
        question: 'Design an ML pipeline for a recommendation system at scale.',
        expectedConcepts: ['data ingestion', 'feature store', 'model training', 'serving', 'monitoring'],
        criticalConcepts: ['offline vs online features', 'A/B testing', 'model drift detection', 'cold start problem'],
        penaltyTriggers: ['train once deploy forget', 'no monitoring', 'single model for all users'],
      },
    ],
  },

  // ══════════════════════════════════════════════════════
  // DATA ENGINEERING
  // ══════════════════════════════════════════════════════
  'Data Engineering': {
    Fresher: [
      {
        id: 'de-f-1',
        type: 'Technical',
        question: 'Explain the difference between ETL and ELT and when you would use each.',
        expectedConcepts: ['extract', 'transform', 'load', 'data warehouse', 'cloud'],
        criticalConcepts: ['ELT enables raw data lake', 'cloud compute for transformation', 'Redshift vs Snowflake'],
        penaltyTriggers: ['same thing', 'etl is always better', 'no difference in cloud'],
      },
      {
        id: 'de-f-2',
        type: 'Scenario',
        question: 'Your data pipeline fails silently — how do you detect and prevent this?',
        expectedConcepts: ['monitoring', 'alerting', 'data quality checks', 'logging'],
        criticalConcepts: ['Great Expectations / dbt tests', 'dead letter queues', 'SLA monitoring', 'data freshness checks'],
        penaltyTriggers: ['check manually', 'no monitoring needed', 'trust the pipeline'],
      },
    ],
  },
};

// ── GET QUESTIONS FOR SESSION ─────────────────────────────────────────────────
/**
 * Retrieve questions for a given role + experience combination.
 * Falls back to Fresher questions if level not found.
 */
function getQuestionsForSession(role, experience, count = 5) {
  const normalizedRole = normalizeRole(role);
  const roleBank = questionBank[normalizedRole];

  if (!roleBank) {
    return getGenericQuestions(count);
  }

  // Role bank can be object {Fresher, Junior, Senior} or flat array
  let pool = [];
  if (Array.isArray(roleBank)) {
    pool = roleBank;
  } else {
    pool = roleBank[experience] || roleBank['Fresher'] || [];
    // Also mix in some cross-level questions for senior/junior
    if (experience !== 'Fresher' && roleBank['Fresher']) {
      pool = [...pool, ...roleBank['Fresher']].slice(0, count + 2);
    }
  }

  // Shuffle and return requested count
  const shuffled = pool.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

function normalizeRole(role) {
  const map = {
    'frontend': 'Frontend',
    'frontend engineer': 'Frontend',
    'react developer': 'Frontend',
    'backend': 'Backend',
    'backend engineer': 'Backend',
    'fullstack': 'Fullstack',
    'full stack': 'Fullstack',
    'full stack engineer': 'Fullstack',
    'aiml': 'AIML',
    'machine learning': 'AIML',
    'ml engineer': 'AIML',
    'data engineering': 'Data Engineering',
    'data engineer': 'Data Engineering',
  };
  return map[role.toLowerCase()] || 'Fullstack';
}

function getGenericQuestions(count = 5) {
  return [
    {
      id: 'gen-1', type: 'Technical',
      question: 'Explain a complex technical problem you solved recently.',
      expectedConcepts: ['problem', 'solution', 'approach', 'outcome'],
      criticalConcepts: ['systematic thinking', 'tradeoffs considered', 'measurable result'],
      penaltyTriggers: [],
    },
    {
      id: 'gen-2', type: 'System Design',
      question: 'How would you design a scalable API for a social media platform?',
      expectedConcepts: ['database', 'api design', 'caching', 'scaling'],
      criticalConcepts: ['CDN', 'database sharding', 'rate limiting', 'authentication'],
      penaltyTriggers: ['single server', 'no caching', 'no rate limiting'],
    },
    {
      id: 'gen-3', type: 'Technical',
      question: 'Explain the CAP theorem.',
      expectedConcepts: ['consistency', 'availability', 'partition tolerance'],
      criticalConcepts: ['you can only have 2 of 3', 'CP vs AP systems', 'real-world examples'],
      penaltyTriggers: ['can have all three', 'not relevant', 'only databases'],
    },
    {
      id: 'gen-4', type: 'Scenario',
      question: 'Your API response time increased from 200ms to 2s after a deployment. How do you debug it?',
      expectedConcepts: ['logs', 'profiling', 'database queries', 'monitoring'],
      criticalConcepts: ['APM tool', 'slow query log', 'N+1 problem', 'rollback strategy'],
      penaltyTriggers: ['restart server', 'blame network', 'wait and see'],
    },
    {
      id: 'gen-5', type: 'HR',
      question: 'Describe your most impactful technical achievement.',
      expectedConcepts: ['project', 'impact', 'technical skill', 'outcome'],
      criticalConcepts: ['quantified impact', 'specific technical decisions', 'stakeholder value'],
      penaltyTriggers: [],
    },
  ].slice(0, count);
}

module.exports = { questionBank, getQuestionsForSession, normalizeRole };

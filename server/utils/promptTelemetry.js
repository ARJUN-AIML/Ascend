/**
 * Utility for tracking AI prompt sizes, tokens, and latencies.
 */
const { performance } = require('perf_hooks');

const mongoose = require('mongoose');

// Define Telemetry Schema dynamically to avoid polluting models/ if not needed
const telemetrySchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now, expires: '30d' }, // Auto-delete after 30 days
  route: String,
  model: String,
  promptChars: Number,
  estimatedTokens: Number,
  queueWaitTimeMs: Number,
  groqLatencyMs: Number,
  totalLatencyMs: Number,
  success: Boolean,
  fallbackUsed: Boolean,
  errorMsg: String
});
const Telemetry = mongoose.models.Telemetry || mongoose.model('Telemetry', telemetrySchema);

class PromptTelemetry {
  static async logRequest(params) {
    const { route, model, promptChars, queueWaitTime, groqLatency, totalLatency, success, fallbackUsed, errorMsg } = params;
    const estimatedTokens = Math.ceil(promptChars / 4);

    const logEntry = {
      route,
      model,
      promptChars,
      estimatedTokens,
      queueWaitTimeMs: queueWaitTime ? Math.round(queueWaitTime) : 0,
      groqLatencyMs: groqLatency ? Math.round(groqLatency) : 0,
      totalLatencyMs: totalLatency ? Math.round(totalLatency) : 0,
      success,
      fallbackUsed: !!fallbackUsed,
      errorMsg: errorMsg || null
    };

    // Fire and forget DB write to avoid blocking response
    Telemetry.create(logEntry).catch(err => {
      console.error('[AI_TELEMETRY_DB_ERROR]', err.message);
    });

    console.log('[AI_TELEMETRY]', JSON.stringify(logEntry));
  }

  static enforceBudget(prompt, maxChars) {
    if (prompt.length <= maxChars) return prompt;
    
    // Smart Truncation: Walk back to the nearest newline or period to avoid chopping JSON/words
    let cutIndex = maxChars;
    const searchArea = prompt.substring(maxChars - 500, maxChars);
    const lastNewline = searchArea.lastIndexOf('\n');
    const lastPeriod = searchArea.lastIndexOf('. ');
    
    if (lastNewline > 0) cutIndex = (maxChars - 500) + lastNewline;
    else if (lastPeriod > 0) cutIndex = (maxChars - 500) + lastPeriod + 1;
    
    console.warn(`[PROMPT_BUDGET] Smart truncating prompt from ${prompt.length} to ${cutIndex} chars.`);
    
    const notice = "\n\n...[CONTENT TRUNCATED BY AI BUDGET CONTROLLER]...";
    return prompt.substring(0, cutIndex) + notice;
  }
}

module.exports = PromptTelemetry;

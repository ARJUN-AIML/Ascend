/**
 * memoryEngine.js — Phase P19 Memory & Strategic Coaching Layer
 * ==============================================================
 * Retrieves past evaluations to detect recurring patterns such as
 * repeated weaknesses, chronic penalties, and consistent low-score dimensions.
 */

const EvaluationHistory = require('../models/EvaluationHistory');

/**
 * Scan a user's history to detect recurring issues.
 * @param {string} userId - User's MongoDB ID
 * @param {string} type - 'resume', 'interview', or 'jdmatch' (optional, if omitted searches all)
 * @returns {object} - Memory analysis payload
 */
async function analyzeMemory(userId, type = null) {
  const query = { user: userId };
  if (type) query.type = type;

  // Fetch chronological history (oldest to newest for proper delta tracking)
  // Actually, we usually sort by createdAt -1 (newest first) to get the most recent N, 
  // then reverse to chronological.
  const records = await EvaluationHistory.find(query).sort({ createdAt: -1 }).limit(10).lean();
  
  if (records.length === 0) {
    return {
      hasData: false,
      message: 'No historical evaluations found.',
      recurringWeaknesses: [],
      repeatedPenalties: [],
      lowScoreDimensions: []
    };
  }

  // Reverse to chronological order
  records.reverse();

  // Frequencies maps
  const weaknessFreq = {};
  const penaltyFreq = {};
  const dimensionScoreSums = {};
  const dimensionCounts = {};

  records.forEach(record => {
    // Weaknesses
    (record.weaknesses || []).forEach(w => {
      weaknessFreq[w] = (weaknessFreq[w] || 0) + 1;
    });

    // Penalties
    (record.penalties || []).forEach(p => {
      // p could be string or object depending on what the scorer stored. Assuming string ID/message.
      const pId = typeof p === 'string' ? p : (p.message || p.id);
      if (pId) {
        penaltyFreq[pId] = (penaltyFreq[pId] || 0) + 1;
      }
    });

    // Breakdown dimensions
    if (record.breakdown) {
      Object.keys(record.breakdown).forEach(dim => {
        dimensionScoreSums[dim] = (dimensionScoreSums[dim] || 0) + record.breakdown[dim];
        dimensionCounts[dim] = (dimensionCounts[dim] || 0) + 1;
      });
    }
  });

  // Thresholds: recurring means appeared in more than 40% of evaluations (min 2)
  const threshold = Math.max(2, Math.floor(records.length * 0.4));

  const recurringWeaknesses = Object.entries(weaknessFreq)
    .filter(([, count]) => count >= threshold)
    .map(([w, count]) => ({ weakness: w, count }));

  const repeatedPenalties = Object.entries(penaltyFreq)
    .filter(([, count]) => count >= threshold)
    .map(([p, count]) => ({ penalty: p, count }));

  // Low score dimensions (average score below certain threshold, e.g. < 50% max)
  // We don't necessarily know max score per dimension here, but assuming normalized 100 or using a generic flag.
  // Wait, breakdown is raw points (e.g. out of 20, 25, etc).
  // Without max scores, we just sort them to find the lowest raw score, or we rely on percentage. 
  // We'll calculate average raw score for tracking trends.
  const lowScoreDimensions = Object.keys(dimensionScoreSums).map(dim => {
    return { dimension: dim, avgRawScore: (dimensionScoreSums[dim] / dimensionCounts[dim]) };
  }).sort((a, b) => a.avgRawScore - b.avgRawScore).slice(0, 2);

  return {
    hasData: true,
    evaluationCount: records.length,
    history: records, // chronological
    recurringWeaknesses,
    repeatedPenalties,
    lowScoreDimensions
  };
}

module.exports = {
  analyzeMemory
};

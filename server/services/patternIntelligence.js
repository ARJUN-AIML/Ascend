/**
 * patternIntelligence.js — Phase P19 Memory & Strategic Coaching Layer
 * ======================================================================
 * Detects improving, stagnant, and declining areas across evaluations.
 * Requires a minimum of 3 evaluations to confidently detect patterns.
 */

function detectPatterns(memoryData) {
  if (!memoryData.hasData || memoryData.evaluationCount < 3) {
    return {
      hasSufficientData: false,
      message: 'Requires minimum 3 evaluations for pattern detection.',
      improving: [],
      stagnant: [],
      declining: []
    };
  }

  const { history } = memoryData; // Assumed chronological (oldest to newest)
  
  const improving = [];
  const stagnant = [];
  const declining = [];

  // Track overall score trend
  let scoreTrend = 0;
  if (typeof history[history.length - 1].score === 'number' && typeof history[0].score === 'number') {
    scoreTrend = history[history.length - 1].score - history[0].score;
    if (scoreTrend > 10) improving.push({ area: 'Overall Score', delta: scoreTrend });
    else if (scoreTrend < -5) declining.push({ area: 'Overall Score', delta: scoreTrend });
    else stagnant.push({ area: 'Overall Score', delta: scoreTrend });
  }

  // Track dimension trends
  // Get all unique dimensions present in the history
  const dimensionKeys = new Set();
  history.forEach(h => {
    if (h.breakdown) {
      Object.keys(h.breakdown).forEach(k => dimensionKeys.add(k));
    }
  });

  dimensionKeys.forEach(dim => {
    // Extract scores for this dimension across history
    const dimScores = history
      .filter(h => h.breakdown && typeof h.breakdown[dim] === 'number')
      .map(h => h.breakdown[dim]);

    if (dimScores.length >= 3) {
      const firstScore = dimScores[0];
      const lastScore = dimScores[dimScores.length - 1];
      const delta = lastScore - firstScore;

      // Calculate a simple trend. (Assuming max points vary, but a delta of > 1 or 2 is usually improving)
      if (delta > 2) {
        improving.push({ area: dim, delta });
      } else if (delta < -2) {
        declining.push({ area: dim, delta });
      } else {
        stagnant.push({ area: dim, delta });
      }
    }
  });

  return {
    hasSufficientData: true,
    improving,
    stagnant,
    declining
  };
}

module.exports = {
  detectPatterns
};

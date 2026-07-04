/**
 * growthVelocityEngine.js — Phase P19 Memory & Strategic Coaching Layer
 * ======================================================================
 * Measures score delta, improvement speed, and consistency over time.
 * Requires a minimum of 4 evaluations.
 */

function calculateGrowthVelocity(memoryData) {
  if (!memoryData.hasData || memoryData.evaluationCount < 4) {
    return {
      hasSufficientData: false,
      message: 'Requires minimum 4 evaluations for velocity tracking.',
      velocityLabel: 'Unknown',
      metrics: null
    };
  }

  const { history } = memoryData; // Assumed chronological
  
  // Total score delta from first to last
  const firstScore = history[0].score;
  const lastScore = history[history.length - 1].score;
  const scoreDelta = lastScore - firstScore;

  // Improvement speed (points per session)
  const sessionCount = history.length;
  const improvementSpeed = (scoreDelta / (sessionCount - 1)).toFixed(1);

  // Consistency (variance from average score, or variance of deltas)
  let consistencyScore = 0;
  let totalDeltaVariance = 0;
  const deltas = [];
  
  for (let i = 1; i < history.length; i++) {
    deltas.push(history[i].score - history[i - 1].score);
  }
  
  const avgDelta = scoreDelta / deltas.length;
  deltas.forEach(d => {
    totalDeltaVariance += Math.pow(d - avgDelta, 2);
  });
  
  const variance = totalDeltaVariance / deltas.length;
  // If variance is low, consistency is high
  const consistencyLabel = variance < 25 ? 'High' : variance < 100 ? 'Medium' : 'Low';

  // Determine overall growth velocity
  let velocityLabel = 'Medium';
  if (scoreDelta > 15 && improvementSpeed > 3 && consistencyLabel !== 'Low') {
    velocityLabel = 'High';
  } else if (scoreDelta < 0 || improvementSpeed < 0.5) {
    velocityLabel = 'Low';
  }

  return {
    hasSufficientData: true,
    velocityLabel,
    metrics: {
      scoreDelta,
      improvementSpeed: parseFloat(improvementSpeed),
      consistency: consistencyLabel,
      variance: variance.toFixed(2)
    }
  };
}

module.exports = {
  calculateGrowthVelocity
};

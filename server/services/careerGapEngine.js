/**
 * careerGapEngine.js — Phase P18 Trust & Market Intelligence
 * ==========================================================
 * Compares user skills vs target role benchmarks to output
 * a gap score, critical missing skills, and estimated time to close the gap.
 */

const { getRoleProfile } = require('../intelligence/roleProfiles');

/**
 * Calculate the career gap for a user against a target role.
 * @param {Array<string>} userSkills
 * @param {string} targetRole
 * @returns {object} - Gap analysis payload
 */
function analyzeCareerGap(userSkills = [], targetRole = 'Frontend') {
  const profile = getRoleProfile(targetRole);
  
  const normalizedUserSkills = userSkills.map(s => s.toLowerCase());
  const criticalRequired = profile.criticalTopics.map(s => s.toLowerCase());
  const bonusRequired = profile.bonusSkills.map(s => s.toLowerCase());

  // Determine what they have vs what they miss
  const matchedCritical = criticalRequired.filter(s => normalizedUserSkills.includes(s));
  const missingCritical = criticalRequired.filter(s => !normalizedUserSkills.includes(s));

  // Determine gap score (0-100, where 100 is fully ready, 0 is max gap)
  const criticalCoverage = criticalRequired.length ? (matchedCritical.length / criticalRequired.length) : 1;
  const gapScore = Math.round(criticalCoverage * 100);

  // Estimate time to close the gap
  let estimatedWeeks = 0;
  if (missingCritical.length > 0) {
    // Roughly 2 weeks per critical missing skill
    estimatedWeeks = missingCritical.length * 2;
  }
  
  let timeToClose = 'Ready now';
  if (estimatedWeeks > 0) {
    timeToClose = estimatedWeeks > 4 ? `${Math.round(estimatedWeeks/4)} months` : `${estimatedWeeks} weeks`;
  }

  return {
    targetRole,
    gapScore,
    isReady: gapScore >= 75,
    criticalMissingSkills: missingCritical,
    timeToClose,
  };
}

module.exports = {
  analyzeCareerGap,
};

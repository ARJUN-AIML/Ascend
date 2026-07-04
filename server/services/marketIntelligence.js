/**
 * marketIntelligence.js — Phase P18 Trust & Market Intelligence
 * =============================================================
 * Tracks realistic hardcoded market trends, high demand skills,
 * and rising technologies. Applies optional market relevance penalties.
 */

const MARKET_TRENDS = {
  highDemand: [
    'react', 'node.js', 'python', 'aws', 'docker', 'kubernetes', 'typescript',
    'sql', 'postgresql', 'machine learning', 'ci/cd', 'git'
  ],
  rising: [
    'rust', 'go', 'llms', 'rag', 'langchain', 'graphql', 'next.js', 'terraform'
  ],
  declining: [
    'jquery', 'angularjs', 'php', 'ruby on rails'
  ]
};

/**
 * Compare a user's skills against the market trends.
 * @param {Array<string>} userSkills
 * @returns {object} - Market analysis payload
 */
function analyzeMarketRelevance(userSkills = []) {
  const normalizedUserSkills = userSkills.map(s => s.toLowerCase());

  const matchedHighDemand = MARKET_TRENDS.highDemand.filter(s => normalizedUserSkills.includes(s));
  const matchedRising = MARKET_TRENDS.rising.filter(s => normalizedUserSkills.includes(s));
  
  // High demand skills missing from the user's stack (limit to top 5 for UI clarity)
  const missingModernSkills = MARKET_TRENDS.highDemand
    .filter(s => !normalizedUserSkills.includes(s))
    .slice(0, 5);

  let marketPenalty = 0;
  let warning = null;

  // Apply market penalty if missing more than 60% of high demand core skills
  // (Assuming every dev should ideally have at least 2-3 modern core skills)
  if (matchedHighDemand.length < 2 && userSkills.length > 0) {
    marketPenalty = 5;
    warning = 'Your profile is missing several high-demand modern stack technologies (e.g., Docker, AWS, TypeScript).';
  }

  return {
    matchedHighDemand,
    matchedRising,
    missingModernSkills,
    marketPenalty,
    warning,
    marketPulse: {
      highDemand: MARKET_TRENDS.highDemand.slice(0, 8).map(skill => ({ skill, demand: 'High' })),
      rising: MARKET_TRENDS.rising.slice(0, 5).map(skill => ({ skill, demand: 'Rising' })),
    }
  };
}

module.exports = {
  MARKET_TRENDS,
  analyzeMarketRelevance,
};

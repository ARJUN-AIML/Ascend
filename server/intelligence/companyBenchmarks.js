/**
 * companyBenchmarks.js — Phase P18 Trust & Market Intelligence
 * ============================================================
 * Defines hiring thresholds across company tiers based on real-world standards.
 * Thresholds adjust slightly depending on the role (e.g. FAANG expects higher accuracy for backend).
 */

const { getRoleProfile } = require('./roleProfiles');

const COMPANY_TIERS = ['Service', 'Product', 'Tier-1 Product', 'FAANG'];

/**
 * Base score requirements for different verdicts across company tiers.
 * Format: { TierName: { StrongHire, Hire, Borderline, Reject } }
 */
const BASE_THRESHOLDS = {
  Service: {
    StrongHire: 75,
    Hire: 60,
    Borderline: 50,
    Reject: 0,
  },
  Product: {
    StrongHire: 80,
    Hire: 70,
    Borderline: 60,
    Reject: 0,
  },
  'Tier-1 Product': {
    StrongHire: 85,
    Hire: 78,
    Borderline: 70,
    Reject: 0,
  },
  FAANG: {
    StrongHire: 92,
    Hire: 85,
    Borderline: 75,
    Reject: 0,
  },
};

/**
 * Generate multi-tier verdicts for a given score and role.
 * @param {number} finalScore - The normalized final score (0-100)
 * @param {string} roleName - The target role (e.g., 'Frontend', 'Backend')
 * @returns {Array} - Array of verdict objects per tier
 */
function getCompanyBenchmarks(finalScore, roleName) {
  const profile = getRoleProfile(roleName);
  
  // Calculate a slight role-based adjustment (for MVP, we use static base thresholds, 
  // but future iterations could adjust based on the specific weights of the profile).
  const adjustment = 0; 
  
  const results = [];

  for (const tier of COMPANY_TIERS) {
    const thresholds = BASE_THRESHOLDS[tier];
    let verdict = 'Reject';
    let verdictClass = 'critical';

    if (finalScore >= thresholds.StrongHire + adjustment) {
      verdict = 'Strong Hire';
      verdictClass = 'excellent';
    } else if (finalScore >= thresholds.Hire + adjustment) {
      verdict = 'Hire';
      verdictClass = 'good';
    } else if (finalScore >= thresholds.Borderline + adjustment) {
      verdict = 'Borderline';
      verdictClass = 'fair';
    }

    results.push({
      tier,
      scoreRequired: thresholds.Hire + adjustment,
      verdict,
      verdictClass,
    });
  }

  return results;
}

module.exports = {
  getCompanyBenchmarks,
  COMPANY_TIERS,
};

/**
 * roleProfiles.js — Phase P18 Trust & Market Intelligence
 * =======================================================
 * Defines role-specific scoring weights and critical criteria.
 * These profiles dictate how the intelligence engines weigh different skills and competencies.
 */

const ROLE_PROFILES = {
  Frontend: {
    weights: {
      technicalAccuracy: 35, // High weight on accuracy for UI/UX details
      depth: 20,
      communication: 25, // Communication is key for FE (explaining UI state, etc.)
      problemSolving: 15,
      confidence: 5,
    },
    criticalTopics: ['react lifecycle', 'performance', 'accessibility', 'state management', 'css architecture'],
    bonusSkills: ['webgl', 'three.js', 'webassembly', 'graphql'],
  },
  Backend: {
    weights: {
      technicalAccuracy: 30,
      depth: 30, // Deep knowledge of DBs and distributed systems is crucial
      communication: 15,
      problemSolving: 20,
      confidence: 5,
    },
    criticalTopics: ['scalability', 'distributed systems', 'databases', 'caching', 'api design'],
    bonusSkills: ['kafka', 'kubernetes', 'gRPC', 'rust', 'go'],
  },
  Fullstack: {
    weights: {
      technicalAccuracy: 25,
      depth: 25,
      communication: 20,
      problemSolving: 25, // Broad problem-solving across the stack is essential
      confidence: 5,
    },
    criticalTopics: ['system design', 'rest api', 'state management', 'authentication', 'ci/cd'],
    bonusSkills: ['terraform', 'websockets', 'serverless', 'micro-frontends'],
  },
  AIML: {
    weights: {
      technicalAccuracy: 40, // Precision in ML concepts is paramount
      depth: 30,
      communication: 10,
      problemSolving: 15,
      confidence: 5,
    },
    criticalTopics: ['ml fundamentals', 'evaluation metrics', 'deployment', 'data preprocessing', 'model optimization'],
    bonusSkills: ['llms', 'rag', 'cuda', 'tensorrt', 'mlops'],
  },
  'Data Engineering': {
    weights: {
      technicalAccuracy: 30,
      depth: 25,
      communication: 15,
      problemSolving: 25,
      confidence: 5,
    },
    criticalTopics: ['data pipelines', 'etl', 'data warehousing', 'stream processing', 'distributed compute'],
    bonusSkills: ['snowflake', 'databricks', 'flink', 'dbt', 'airflow'],
  },
  Default: {
    weights: {
      technicalAccuracy: 30,
      depth: 25,
      communication: 20,
      problemSolving: 15,
      confidence: 10,
    },
    criticalTopics: ['problem solving', 'clean code', 'testing', 'version control', 'debugging'],
    bonusSkills: ['cloud platforms', 'ci/cd', 'docker'],
  },
};

/**
 * Get the profile for a specific role.
 * @param {string} roleName
 * @returns {object} The role profile
 */
function getRoleProfile(roleName) {
  // Normalize role name for lookup (e.g., "Data Engineering" -> "Data Engineering", "AIML" -> "AIML")
  const key = Object.keys(ROLE_PROFILES).find(k => k.toLowerCase() === (roleName || '').toLowerCase());
  return ROLE_PROFILES[key] || ROLE_PROFILES.Default;
}

module.exports = {
  ROLE_PROFILES,
  getRoleProfile,
};

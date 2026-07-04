const { roles } = require('./roleKnowledgeBase');

function getLevenshteinDistance(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix = Array(a.length + 1).fill(null).map(() => Array(b.length + 1).fill(null));
  for (let i = 0; i <= a.length; i += 1) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j += 1) matrix[0][j] = j;
  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i][j - 1] + 1,
        matrix[i - 1][j] + 1,
        matrix[i - 1][j - 1] + indicator
      );
    }
  }
  return matrix[a.length][b.length];
}

const abbreviations = {
  "ml": "machine learning",
  "ai": "machine learning",
  "aiml": "machine learning",
  "swe": "full stack",
  "sde": "full stack",
  "pm": "product manager",
  "ui": "frontend",
  "ux": "frontend",
  "fe": "frontend",
  "be": "backend"
};

const noiseWords = ["engineer", "developer", "dev", "lead", "specialist", "expert", "manager", "architect", "programmer"];

const roleAliases = {
  "product owner": "Product Manager",
  "data analyst": "Data Scientist",
  "data engineer": "Data Scientist",
  "react": "Frontend Engineer",
  "frontend": "Frontend Engineer",
  "front end": "Frontend Engineer",
  "backend": "Backend Engineer",
  "back end": "Backend Engineer",
  "software": "Full Stack Engineer",
  "full stack": "Full Stack Engineer",
  "fullstack": "Full Stack Engineer"
};

function resolveRole(rawRole) {
  if (!rawRole) return { canonicalRole: "Unknown", confidence: 0 };
  
  // Clean special chars like AI/ML -> ai ml
  let normalized = rawRole.toLowerCase().trim();
  normalized = normalized.replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();

  // Step 1: Exact / Alias Match on clean string
  for (const roleKey of Object.keys(roles)) {
    if (roleKey.toLowerCase() === normalized) return { canonicalRole: roleKey, confidence: 100 };
  }
  if (roleAliases[normalized]) {
    return { canonicalRole: roleAliases[normalized], confidence: 95 };
  }

  // Step 2 & 3: Abbreviation Expansion & Token Normalization
  let tokens = normalized.split(' ');
  let coreTokens = [];

  for (let token of tokens) {
    if (abbreviations[token]) {
      coreTokens.push(...abbreviations[token].split(' '));
    } else if (!noiseWords.includes(token)) {
      coreTokens.push(token);
    }
  }

  let processedInput = coreTokens.join(' ').trim();
  if (processedInput.length === 0) processedInput = normalized; // fallback if all were noise

  // Step 4: Fuzzy & Token Overlap Scoring
  let bestMatch = null;
  let highestScore = 0;

  for (const roleKey of Object.keys(roles)) {
    const roleLower = roleKey.toLowerCase();
    let roleCoreTokens = roleLower.split(' ').filter(t => !noiseWords.includes(t));
    let roleCoreStr = roleCoreTokens.join(' ');

    const dist = getLevenshteinDistance(processedInput, roleCoreStr);
    const maxLength = Math.max(processedInput.length, roleCoreStr.length);
    let levScore = Math.round((1 - dist / Math.max(maxLength, 1)) * 100);

    let matchCount = 0;
    for (let t of coreTokens) {
      if (roleCoreTokens.includes(t)) matchCount++;
    }
    let overlapScore = Math.round((matchCount / Math.max(roleCoreTokens.length, 1)) * 100);
    
    if (processedInput === roleCoreStr) {
      levScore = 100;
      overlapScore = 100;
    }

    const finalScore = Math.round((levScore * 0.4) + (overlapScore * 0.6));
    if (finalScore > highestScore) {
      highestScore = finalScore;
      bestMatch = roleKey;
    }
  }

  for (const [alias, canonical] of Object.entries(roleAliases)) {
    let aliasTokensArr = alias.split(' ').filter(t => !noiseWords.includes(t));
    let aliasCoreStr = aliasTokensArr.join(' ');
    
    const dist = getLevenshteinDistance(processedInput, aliasCoreStr);
    const maxLength = Math.max(processedInput.length, aliasCoreStr.length);
    let levScore = Math.round((1 - dist / Math.max(maxLength, 1)) * 100);
    
    let matchCount = 0;
    for (let t of coreTokens) {
      if (aliasTokensArr.includes(t)) matchCount++;
    }
    let overlapScore = Math.round((matchCount / Math.max(aliasTokensArr.length, 1)) * 100);
    
    if (processedInput === aliasCoreStr) {
      levScore = 100;
      overlapScore = 100;
    }

    const finalScore = Math.round((levScore * 0.4) + (overlapScore * 0.6));
    if (finalScore > highestScore) {
      highestScore = finalScore;
      bestMatch = canonical;
    }
  }

  if (highestScore > 50) {
    // If it's a perfect match on core tokens, give it 90+
    const conf = highestScore > 90 ? 94 : highestScore;
    return { canonicalRole: bestMatch, confidence: conf };
  }

  return { canonicalRole: "Unknown", confidence: 0 };
}

module.exports = { resolveRole };

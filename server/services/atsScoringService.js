const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || 'dummy_key' });
const { resolveRole } = require('../intelligence/roleResolver');
const { roles } = require('../intelligence/roleKnowledgeBase');
const { normalizeSkill } = require('../intelligence/skillOntology');
const { getDomainContext } = require('../intelligence/domainContextEngine');
const { getTransferabilityBonus } = require('../intelligence/transferabilityEngine');
const { scoreResume } = require('./resumeScoringEngine');

function safeJsonParse(text) {
  try {
    const jsonStr = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
    return JSON.parse(jsonStr);
  } catch (e) {
    return null;
  }
}

function calculateConfidence(roleConfidence, jdQuality, resumeQuality, rawExtractedCount, normalizedCount) {
  const extractionQuality = Math.max(20, Math.min(100, Math.round((rawExtractedCount / 10) * 100)));
  const ontologyCoverage = rawExtractedCount > 0 ? Math.round((normalizedCount / rawExtractedCount) * 100) : 50;
  
  const breakdown = {
    roleDetection: roleConfidence,
    jdQuality: jdQuality,
    resumeQuality: resumeQuality,
    extractionQuality: extractionQuality,
    ontologyCoverage: ontologyCoverage
  };
  
  const finalConfidence = Math.round(
    (breakdown.roleDetection * 0.3) +
    (breakdown.jdQuality * 0.2) +
    (breakdown.resumeQuality * 0.2) +
    (breakdown.extractionQuality * 0.1) +
    (breakdown.ontologyCoverage * 0.2)
  );

  return { finalConfidence, breakdown };
}

function calculateDeterministicScores(resumeSkills, jdSkills, canonicalRole, domainStr, currentRole) {
  const roleDef = roles[canonicalRole] || { critical: [], important: [], optional: [], roleDefining: [], categoryMapping: {} };
  const domain = getDomainContext(domainStr);

  const missingRoleDefining = [];
  const missingCritical = [];
  const missingImportant = [];
  const matchedCritical = [];
  const matchedImportant = [];
  
  let score = 100;
  const breakdown = [];

  const transferBonus = getTransferabilityBonus(currentRole, canonicalRole);
  if (transferBonus > 0) {
    score += transferBonus;
    breakdown.push(`Role Transferability Bonus (${currentRole} → ${canonicalRole}) (+${transferBonus})`);
  }

  // Blocker 3: Role-defining checks
  let missingDefiningCount = 0;
  for (let req of roleDef.roleDefining) {
    if (!resumeSkills.includes(req)) {
      missingRoleDefining.push(req);
      missingDefiningCount++;
    }
  }

  const criticalPenalties = [12, 10, 8, 6, 4];
  const importantPenalties = [6, 5, 4, 3, 2];

  let critMissCount = 0;
  for (let req of roleDef.critical) {
    if (jdSkills.includes(req) || !jdSkills.length) { 
      if (!resumeSkills.includes(req)) {
        missingCritical.push(req);
        const basePenalty = criticalPenalties[Math.min(critMissCount, criticalPenalties.length - 1)];
        const penalty = basePenalty * domain.weightModifiers.critical;
        score -= penalty;
        breakdown.push(`Missing Critical Skill: ${req} (-${penalty.toFixed(1)})`);
        console.log(`[DEBUG SCORE] Missing Critical: ${req}, Penalty: ${penalty}, New Score: ${score}`);
        critMissCount++;
      } else {
        matchedCritical.push(req);
        breakdown.push(`Matched Critical Skill: ${req} (+0)`);
      }
    }
  }

  let impMissCount = 0;
  for (let req of roleDef.important) {
    if (jdSkills.includes(req) || !jdSkills.length) {
      if (!resumeSkills.includes(req)) {
        missingImportant.push(req);
        const basePenalty = importantPenalties[Math.min(impMissCount, importantPenalties.length - 1)];
        const penalty = basePenalty * domain.weightModifiers.important;
        score -= penalty;
        breakdown.push(`Missing Important Skill: ${req} (-${penalty.toFixed(1)})`);
        impMissCount++;
      } else {
        matchedImportant.push(req);
        breakdown.push(`Matched Important Skill: ${req} (+0)`);
      }
    }
  }

  for (const [category, weight] of Object.entries(roleDef.categoryMapping)) {
    breakdown.push(`Applied Role Formula Weight: ${category} (${weight * 100}%)`);
  }

  if (score > 100) score = 100;

  // Blocker 3: Role-Defining Hard Caps
  let capApplied = null;
  if (missingDefiningCount >= 4) { capApplied = 30; }
  else if (missingDefiningCount === 3) { capApplied = 45; }
  else if (missingDefiningCount === 2) { capApplied = 60; }

  if (capApplied !== null && score > capApplied) {
    breakdown.push(`Hard Cap Applied: Missing ${missingDefiningCount} role-defining skills (Score capped at ${capApplied})`);
    score = capApplied;
  }

  if (score < 10) score = 10;

  return {
    matchScore: Math.round(score),
    missingCritical,
    missingImportant,
    matchedCritical,
    matchedImportant,
    missingRoleDefining,
    scoringBreakdown: breakdown,
    transferBonus
  };
}

function generateStrictDeterministicInsights(matchedCritical, matchedImportant, missingCritical, missingImportant, canonicalRole, skillEvidenceMap = {}) {
  const strengths = [];
  const weaknesses = [];
  const recommendations = [];

  // Blocker 2: Strength Evidence Tiers
  if (matchedCritical.length > 0) {
    const skill = matchedCritical[0];
    const evidenceTier = skillEvidenceMap[skill] || 1; // Default to 1 if no map
    
    if (evidenceTier === 3) {
      strengths.push(`Strong ${canonicalRole} project execution capability demonstrated. Evidence: Quantified impact using ${skill}.`);
    } else if (evidenceTier === 2) {
      strengths.push(`Practical ${skill} project experience detected. Evidence: Applied usage.`);
    } else {
      strengths.push(`Baseline ${skill} familiarity detected. Evidence: Mentioned.`);
    }
  }

  if (matchedImportant.length > 0) {
    const skill = matchedImportant[0];
    const evidenceTier = skillEvidenceMap[skill] || 1;
    
    if (evidenceTier >= 2) {
      strengths.push(`Proven practical experience with domain ecosystem tools. Evidence: Applied ${skill}.`);
    } else {
      strengths.push(`Familiarity with standard domain frameworks. Evidence: ${skill} mentioned.`);
    }
  }

  if (missingCritical.length > 0) {
    weaknesses.push(`Missing critical ${canonicalRole} requirements (evidence: ${missingCritical.slice(0, 2).join(', ')} missing)`);
  }
  if (missingImportant.length > 0) {
    weaknesses.push(`Lacking standard ecosystem frameworks (evidence: ${missingImportant.slice(0, 2).join(', ')} missing)`);
  }
  
  // Blocker 1: Recommendation Engine Upgrade
  if (missingCritical.length > 0) {
    recommendations.push({
      skill: missingCritical[0],
      priority: "critical",
      action: `Build 1 end-to-end project utilizing ${missingCritical[0]} as a primary architecture component`,
      estimatedTime: "2-3 weeks",
      resourceType: ["project", "tutorial"]
    });
  }
  
  if (missingImportant.length > 0) {
    recommendations.push({
      skill: missingImportant[0],
      priority: "important",
      action: `Integrate ${missingImportant[0]} into an existing repository or workflow`,
      estimatedTime: "1-2 weeks",
      resourceType: ["practice", "documentation"]
    });
  }
  
  if (missingCritical.length > 1) {
    recommendations.push({
      skill: missingCritical[1],
      priority: "critical",
      action: `Complete an intensive foundational course focusing entirely on ${missingCritical[1]}`,
      estimatedTime: "3-4 weeks",
      resourceType: ["course", "practice"]
    });
  }

  return { strengths, weaknesses, recommendations };
}

const performHybridAnalysis = async (resumeText, roleTitle, jobDescription, domainStr = "SaaS", currentRole = "Data Analyst") => {
  console.log('[atsScoringService] Starting Phase 2.6 Precision Engine');
  
  const roleResolution = resolveRole(roleTitle);
  const canonicalRole = roleResolution.canonicalRole;
  
  const extractPrompt = `You are a strict ATS parser. Extract technical skills from the resume and JD.
Return EXACTLY this JSON structure. Do NOT wrap in markdown.
{
  "resumeSkills": ["skill1", "skill2"],
  "jdSkills": ["skill1"],
  "skillEvidenceMap": { "skill1": 1, "skill2": 2 }, // 1=mention, 2=project, 3=quantified impact
  "resumeQualityScore": 75,
  "jdQualityScore": 80
}
Resume: ${resumeText.substring(0, 3000)}
Job Description: ${jobDescription.substring(0, 2000)}`;

  let extractionData;
  let aiFallback = false;
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: extractPrompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.1,
    });
    extractionData = safeJsonParse(chatCompletion.choices[0]?.message?.content);
  } catch (err) {
    console.error("[atsScoringService] Extraction failed", err.message);
  }

  if (!extractionData) {
    aiFallback = true;
    console.warn("[atsScoringService] AI Extraction failed. Using Regex Fallback.");
    const fallbackResumeSkills = [];
    const fallbackJdSkills = [];
    
    const allExpected = [
      ...(roles[canonicalRole]?.roleDefining || []), 
      ...(roles[canonicalRole]?.critical || []), 
      ...(roles[canonicalRole]?.important || [])
    ];
    
    const lowerResume = (resumeText || '').toLowerCase();
    const lowerJd = (jobDescription || '').toLowerCase();
    
    for (const skill of allExpected) {
      if (lowerResume.includes(skill.toLowerCase())) fallbackResumeSkills.push(skill);
      if (lowerJd.includes(skill.toLowerCase())) fallbackJdSkills.push(skill);
    }
    
    extractionData = { resumeSkills: fallbackResumeSkills, jdSkills: fallbackJdSkills, skillEvidenceMap: {}, resumeQualityScore: 50, jdQualityScore: 50 };
  }

  const rawExtractedCount = extractionData.resumeSkills.length + extractionData.jdSkills.length;
  const normResumeSkills = [...new Set(extractionData.resumeSkills.map(s => normalizeSkill(s)).filter(Boolean))];
  const normJdSkills = [...new Set(extractionData.jdSkills.map(s => normalizeSkill(s)).filter(Boolean))];
  const normalizedCount = normResumeSkills.length + normJdSkills.length;

  console.log('[DEBUG] extractionData:', extractionData);
  console.log('[DEBUG] normJdSkills:', normJdSkills);

  // We map normalized skills to their evidence tier
  const evidenceMap = {};
  for (let s of extractionData.resumeSkills) {
    const norm = normalizeSkill(s);
    if (norm) {
      evidenceMap[norm] = Math.max(evidenceMap[norm] || 1, extractionData.skillEvidenceMap[s] || 1);
    }
  }

  const mathResults = calculateDeterministicScores(normResumeSkills, normJdSkills, canonicalRole, domainStr, currentRole);

  const intelligenceData = generateStrictDeterministicInsights(
    mathResults.matchedCritical, 
    mathResults.matchedImportant, 
    mathResults.missingCritical, 
    mathResults.missingImportant, 
    canonicalRole,
    evidenceMap
  );

  const confidenceObj = calculateConfidence(roleResolution.confidence, extractionData.jdQualityScore, extractionData.resumeQualityScore, rawExtractedCount, normalizedCount);

  let atsVerdict = 'Borderline';
  if (mathResults.matchScore > 80) atsVerdict = 'Pass';
  if (mathResults.matchScore < 60) atsVerdict = 'Reject';
  let recruiterVerdict = mathResults.matchScore > 75 ? 'Strong' : 'Weak';

  // Fix: use mathResults.scoringBreakdown (the correct variable)
  const parsedBreakdown = (mathResults.scoringBreakdown || []).map(item => {
    const isPos = item.includes('(+');
    const impactMatch = item.match(/([-+]\d+\.?\d*)\)/);
    const impact = impactMatch ? impactMatch[1] : (isPos ? '+0' : '-0');
    const label = item.replace(/\s*\([-+]\d+\.?\d*\)$/, '').trim();
    return { label, impact, positive: isPos };
  });

  // ── P17: Run the new 6-dimension resume scoring engine ────────────────────
  let resumeScore6D = null;
  try {
    resumeScore6D = scoreResume(resumeText, jobDescription);
  } catch (err) {
    console.warn('[atsScoringService] resumeScoringEngine failed:', err.message);
  }

  const categories = {
    keywordMatch:    Math.min(100, Math.round((normResumeSkills.length / Math.max(1, normJdSkills.length)) * 100)),
    experienceMatch: Math.min(100, mathResults.matchScore + 5),
    semanticMatch:   Math.min(100, mathResults.matchScore + 12),
    projectRelevance: Math.min(100, Math.round(confidenceObj.finalConfidence * 0.9)),
  };

  const hasCriticalMiss = mathResults.missingCritical.length > 0;
  const simulation = {
    atsScanner: {
      verdict: mathResults.matchScore > 75 ? 'Pass' : (mathResults.matchScore > 60 ? 'Borderline' : 'Reject'),
      confidence: confidenceObj.finalConfidence + '%',
      reasons: `Core keywords present at ${categories.keywordMatch}% density. ${hasCriticalMiss ? 'Critical role-defining terms are missing — ATS may filter this resume.' : 'Passed minimum ATS thresholds.'}`,
    },
    recruiterLens: {
      verdict: recruiterVerdict,
      confidence: (confidenceObj.finalConfidence - 5) + '%',
      reasons: intelligenceData.strengths.length > 0 ? intelligenceData.strengths[0] : 'Foundation exists, but lacks distinct markers of seniority or impact.',
    },
    hiringManagerLens: {
      verdict: hasCriticalMiss ? 'Reject (Currently)' : 'Proceed to Tech Screen',
      confidence: (confidenceObj.finalConfidence - 2) + '%',
      reasons: hasCriticalMiss
        ? `Missing role-critical requirements: ${mathResults.missingCritical.join(', ')}. Candidate would require extensive onboarding.`
        : 'Candidate demonstrates sufficient baseline knowledge of the required tech stack.',
    },
  };

  return {
    matchScore:            mathResults.matchScore,
    confidenceScore:       confidenceObj.finalConfidence,
    confidenceBreakdown:   confidenceObj.breakdown,
    missingCriticalSkills: mathResults.missingCritical,
    missingImportantSkills: mathResults.missingImportant,
    strengths:             intelligenceData.strengths || [],
    weaknesses:            intelligenceData.weaknesses || [],
    recommendations:       intelligenceData.recommendations || [],
    recruiterVerdict,
    atsVerdict,
    scoringBreakdown: {
      base:      100,
      modifiers: parsedBreakdown,
      final:     mathResults.matchScore,
    },
    categories,
    simulation,
    // P17: 6-dimension resume score (bonus data for Copilot UI)
    resumeScore6D: resumeScore6D ? {
      totalScore:        resumeScore6D.totalScore,
      breakdown:         resumeScore6D.breakdown,
      sectionWeaknesses: resumeScore6D.sectionWeaknesses,
      exactImprovements: resumeScore6D.exactImprovements,
      appliedPenalties:  resumeScore6D.appliedPenalties,
      benchmark:         resumeScore6D.benchmark,
    } : null,
    aiFallback
  };
};

module.exports = { performHybridAnalysis, calculateDeterministicScores, generateStrictDeterministicInsights };

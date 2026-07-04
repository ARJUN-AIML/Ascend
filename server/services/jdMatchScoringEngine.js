/**
 * jdMatchScoringEngine.js — Phase P17 Deterministic JD Match Scorer
 * ==================================================================
 * Pipeline: featureExtractor → 5-dimension math → penaltyEngine → ruleFeedback
 *
 * 5 Dimensions (100pts total):
 *   Skill Match      (40) — Ontology-mapped skill intersection
 *   Experience Match (25) — Years vs. JD-required experience
 *   Education Match  (10) — Degree keywords
 *   Tool Match       (15) — Exact tool/tech intersection
 *   Bonus Skills     (10) — Differentiating secondary skills
 */

const { extractPair }           = require('../intelligence/featureExtractor');
const { applyJDMatchPenalties } = require('./penaltyEngine');
const { generateJDMatchFeedback } = require('./ruleFeedbackEngine');
const { getRejectionRisk, getBenchmarkReport } = require('../intelligence/scoringBenchmarks');
const { roles }                 = require('../intelligence/roleKnowledgeBase');
const { resolveRole }           = require('../intelligence/roleResolver');
// P18 Additions
const { explainDocumentScore }          = require('./explainabilityEngine');
const { getCompanyBenchmarks }          = require('../intelligence/companyBenchmarks');
const { analyzeMarketRelevance }        = require('./marketIntelligence');
const { analyzeCareerGap }              = require('./careerGapEngine');

// ── Experience requirements extractor from JD text ───────────────────────────
function extractJDExperienceRequirement(jdText) {
  // "3+ years", "minimum 2 years", "5 years of experience"
  const patterns = [
    /(\d+)\+?\s*years?\s*(of\s*)?(experience|exp)/i,
    /minimum\s+(\d+)\s*years?/i,
    /at\s+least\s+(\d+)\s*years?/i,
  ];
  for (const re of patterns) {
    const m = jdText.match(re);
    if (m) return parseInt(m[1]);
  }
  return 0; // no explicit requirement found
}

// ── DIMENSION: Skill Match (max 40) ──────────────────────────────────────────
function scoreSkillMatch(intersection, canonicalRole) {
  let score = 0;
  const reasons = [];

  const { sharedSkills, missingSkills, skillCoverage } = intersection;

  // Base: coverage ratio (0–28 pts)
  const coveragePts = Math.round((skillCoverage / 100) * 28);
  score += coveragePts;
  reasons.push(`Skill coverage ${skillCoverage}% → ${coveragePts}/28 pts`);

  // Role-defining bonus (0–12 pts)
  const roleDef = roles[canonicalRole];
  if (roleDef) {
    const matchedDefining = roleDef.roleDefining.filter(s => sharedSkills.includes(s));
    const definingPts = Math.round((matchedDefining.length / Math.max(1, roleDef.roleDefining.length)) * 12);
    score += definingPts;
    reasons.push(
      `Role-defining skill match: ${matchedDefining.length}/${roleDef.roleDefining.length} → ${definingPts}/12 pts`
    );
  } else {
    // Generic: treat sharedSkills count as proxy
    const genericPts = Math.min(12, sharedSkills.length * 2);
    score += genericPts;
    reasons.push(`Generic skill match bonus: +${genericPts}/12`);
  }

  return { score: Math.min(score, 40), reasons, sharedSkills, missingSkills };
}

// ── DIMENSION: Experience Match (max 25) ────────────────────────────────────
function scoreExperienceMatch(resumeYears, jdRequiredYears) {
  let score = 0;
  const reasons = [];

  if (jdRequiredYears === 0) {
    // No requirement stated — give partial credit based on resume experience
    score = Math.min(20, resumeYears * 4);
    reasons.push(`No explicit JD requirement. Resume shows ${resumeYears} years → ${score}/25 pts`);
  } else {
    const ratio = resumeYears / jdRequiredYears;

    if (ratio >= 1.0) {
      // Meets or exceeds requirement
      score = Math.min(25, Math.round(ratio >= 1.5 ? 25 : 25 * ratio));
      reasons.push(`Meets experience requirement (${resumeYears}yr vs. ${jdRequiredYears}yr required) → ${score}/25 pts`);
    } else if (ratio >= 0.7) {
      // Close — 70–99%
      score = Math.round(25 * ratio * 0.85);
      reasons.push(`Slightly underqualified (${resumeYears}yr vs. ${jdRequiredYears}yr required) → ${score}/25 pts`);
    } else {
      // Significant gap
      score = Math.max(0, Math.round(25 * ratio * 0.5));
      reasons.push(`Underqualified gap (${resumeYears}yr vs. ${jdRequiredYears}yr required) → ${score}/25 pts`);
    }
  }

  return { score: Math.min(score, 25), reasons };
}

// ── DIMENSION: Education Match (max 10) ─────────────────────────────────────
function scoreEducationMatch(resumeFeatures, jdText) {
  let score = 0;
  const reasons = [];

  const jdRequiresDegree = /\b(bachelor|degree|b\.tech|b\.e|b\.s|master|phd|mba)\b/i.test(jdText);
  const hasCS = /\b(computer science|cs|information technology|it|software engineering|ece)\b/i.test(jdText);

  if (!jdRequiresDegree) {
    // No degree requirement — give half credit if they have one
    if (resumeFeatures.education.hasDegree) { score += 5; reasons.push('Has degree (no requirement, +5)'); }
    else { score += 3; reasons.push('No degree requirement in JD (+3)'); }
  } else {
    if (resumeFeatures.education.hasDegree) {
      score += 7; reasons.push('Degree requirement met (+7)');
    } else {
      reasons.push('Degree required but none detected (0)');
    }

    if (resumeFeatures.education.isTier1) {
      score += 3; reasons.push('Tier 1 institution bonus (+3)');
    }
  }

  return { score: Math.min(score, 10), reasons };
}

// ── DIMENSION: Tool Match (max 15) ──────────────────────────────────────────
function scoreToolMatch(intersection) {
  let score = 0;
  const reasons = [];

  const { sharedTools, missingTools, toolCoverage } = intersection;

  const toolPts = Math.round((toolCoverage / 100) * 15);
  score = toolPts;
  reasons.push(
    `Tool coverage ${toolCoverage}% (${sharedTools.length} matched, ${missingTools.length} missing) → ${toolPts}/15 pts`
  );

  return { score: Math.min(score, 15), reasons, sharedTools, missingTools };
}

// ── DIMENSION: Bonus Skills (max 10) ─────────────────────────────────────────
function scoreBonusSkills(intersection, canonicalRole) {
  let score = 0;
  const reasons = [];

  const { bonusSkills } = intersection;
  const roleDef = roles[canonicalRole];

  // Bonus skills from optional role skills
  const optionalMatched = roleDef
    ? bonusSkills.filter(s => roleDef.optional.includes(s))
    : [];

  const bonusPts = Math.min(10, optionalMatched.length * 3 + (bonusSkills.length > 0 ? 1 : 0));
  score = bonusPts;

  if (optionalMatched.length > 0) {
    reasons.push(`Optional role skills matched: ${optionalMatched.slice(0, 3).join(', ')} (+${bonusPts} pts)`);
  } else if (bonusSkills.length > 0) {
    reasons.push(`${bonusSkills.length} bonus skills found but not role-specific (+1 pt)`);
  } else {
    reasons.push('No bonus skills detected (0)');
  }

  return { score: Math.min(score, 10), reasons, bonusSkills };
}

// ── MAIN FUNCTION ─────────────────────────────────────────────────────────────
/**
 * Score resume-to-JD match using 5-dimension deterministic math.
 */
function scoreJDMatch(resumeText, jdText) {
  // Step 1: Extract features
  const pair          = extractPair(resumeText, jdText);
  const resumeFeatures = pair.resume;
  const jdFeatures    = pair.jd;
  const intersection  = pair.intersection;

  // Step 2: Resolve canonical role from JD
  const roleHint     = jdText.substring(0, 500); // use first 500 chars for role detection
  const roleResult   = resolveRole(roleHint);
  const canonicalRole = roleResult.canonicalRole;
  const roleDef      = roles[canonicalRole] || { roleDefining: [], critical: [], optional: [] };

  const jdRequiredYears = extractJDExperienceRequirement(jdText);
  const resumeYears     = resumeFeatures.experienceYears;

  // Step 3: Score all dimensions
  const skillResult  = scoreSkillMatch(intersection, canonicalRole);
  const expResult    = scoreExperienceMatch(resumeYears, jdRequiredYears);
  const eduResult    = scoreEducationMatch(resumeFeatures, jdText);
  const toolResult   = scoreToolMatch(intersection);
  const bonusResult  = scoreBonusSkills(intersection, canonicalRole);

  const breakdown = {
    skillMatch: skillResult.score,
    expMatch:   expResult.score,
    eduMatch:   eduResult.score,
    toolMatch:  toolResult.score,
    bonus:      bonusResult.score,
  };

  const rawTotal = Object.values(breakdown).reduce((a, b) => a + b, 0);

  // Step 4: Apply penalties
  const { totalDeduction, appliedPenalties } = applyJDMatchPenalties(
    intersection,
    roleDef.roleDefining,
    resumeYears,
    jdRequiredYears
  );

  const finalScore = Math.max(0, Math.min(100, rawTotal - totalDeduction));

  // Step 5: Rule-based feedback
  const ruleFeedback = generateJDMatchFeedback(breakdown, intersection, appliedPenalties);

  // Step 6: Rejection risk
  const rejectionRisk = getRejectionRisk(finalScore);

  // Step 7: Benchmark
  const benchmark = getBenchmarkReport(finalScore, 'resume');

  const scoringBreakdown = [
    { dimension: 'Skill Match',       maxPts: 40, earned: breakdown.skillMatch, reasons: skillResult.reasons },
    { dimension: 'Experience Match',  maxPts: 25, earned: breakdown.expMatch,   reasons: expResult.reasons  },
    { dimension: 'Education Match',   maxPts: 10, earned: breakdown.eduMatch,   reasons: eduResult.reasons  },
    { dimension: 'Tool Match',        maxPts: 15, earned: breakdown.toolMatch,  reasons: toolResult.reasons },
    { dimension: 'Bonus Skills',      maxPts: 10, earned: breakdown.bonus,      reasons: bonusResult.reasons },
  ];

  const result = {
    matchScore:      finalScore,
    rawScore:        rawTotal,
    penaltyDeduction: totalDeduction,
    breakdown,
    scoringBreakdown,
    appliedPenalties,
    rejectionRisk:   rejectionRisk.risk,
    rejectionRiskClass: rejectionRisk.riskClass,
    rejectionLabel:  rejectionRisk.label,
    rejectionReasons: ruleFeedback.rejectionReasons,
    strengths:       ruleFeedback.strengths,
    gaps:            ruleFeedback.gaps,
    sharedSkills:    intersection.sharedSkills,
    missingSkills:   intersection.missingSkills,
    missingTools:    intersection.missingTools,
    bonusSkills:     bonusResult.bonusSkills,
    benchmark,
    canonicalRole,
  };

  // P18: Trust & Market Intelligence
  result.explainability = explainDocumentScore(result);
  result.companyBenchmarks = getCompanyBenchmarks(finalScore, canonicalRole);
  
  const allUserSkills = [...(resumeFeatures.skills?.hard || []), ...(resumeFeatures.skills?.tools || [])];
  
  result.marketIntelligence = analyzeMarketRelevance(allUserSkills);
  result.careerGap = analyzeCareerGap(allUserSkills, canonicalRole);

  // If market penalty applies, deduct it
  if (result.marketIntelligence.marketPenalty > 0) {
    result.matchScore = Math.max(0, result.matchScore - result.marketIntelligence.marketPenalty);
    result.appliedPenalties.push({
      id: 'MARKET_PENALTY',
      message: result.marketIntelligence.warning,
      deduction: result.marketIntelligence.marketPenalty
    });
    // Re-generate explainability
    result.explainability = explainDocumentScore(result);
  }

  return result;
}

module.exports = { scoreJDMatch };

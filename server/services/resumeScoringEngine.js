/**
 * resumeScoringEngine.js — Phase P17 Deterministic Resume Scorer
 * ================================================================
 * Pipeline: featureExtractor → 6-dimension math → penaltyEngine → ruleFeedback → score
 *
 * 6 Dimensions (100pts total):
 *   ATS Compatibility  (20) — Structure, sections, formatting signals
 *   Keyword Match      (25) — Skill/keyword overlap with JD via ontology
 *   Project Strength   (20) — Project count + quality signals
 *   Experience Strength(15) — Years extracted + role progression signals
 *   Impact Strength    (10) — Quantified metrics density
 *   Structure Quality  (10) — Formatting, length, links
 */

const { extractPair, extractFeatures } = require('../intelligence/featureExtractor');
const { applyResumePenalties }          = require('./penaltyEngine');
const { generateResumeFeedback }        = require('./ruleFeedbackEngine');
const { getBenchmarkReport }            = require('../intelligence/scoringBenchmarks');
const { scoreProjects: scoreProjectQuality } = require('./projectQualityEngine');
// P18 Additions
const { explainDocumentScore }          = require('./explainabilityEngine');
const { getCompanyBenchmarks }          = require('../intelligence/companyBenchmarks');
const { analyzeMarketRelevance }        = require('./marketIntelligence');
const { analyzeCareerGap }              = require('./careerGapEngine');

// ── DIMENSION: ATS Compatibility (max 20) ────────────────────────────────────
function scoreATS(features) {
  let score = 0;
  const reasons = [];

  const { hasSections } = features.formatting;

  if (hasSections.experience) { score += 4; reasons.push('Has experience section (+4)'); }
  if (hasSections.education)  { score += 3; reasons.push('Has education section (+3)'); }
  if (hasSections.skills)     { score += 5; reasons.push('Has skills section (+5)'); }
  if (hasSections.projects)   { score += 4; reasons.push('Has projects section (+4)'); }
  if (hasSections.summary)    { score += 2; reasons.push('Has summary/objective (+2)'); }

  // Formatting signals
  if (features.formatting.hasBullets) { score += 2; reasons.push('Uses bullet points (+2)'); }

  return { score: Math.min(score, 20), reasons };
}

// ── DIMENSION: Keyword Match (max 25) ────────────────────────────────────────
function scoreKeywordMatch(resumeFeatures, jdFeatures, intersection) {
  let score = 0;
  const reasons = [];

  const skillCoverage = intersection.skillCoverage;     // % of JD skills found in resume
  const toolCoverage  = intersection.toolCoverage;      // % of JD tools found in resume

  // Skill overlap (0–15 pts)
  const skillPts = Math.round((skillCoverage / 100) * 15);
  score += skillPts;
  reasons.push(`Skill coverage ${skillCoverage}% → ${skillPts}/15 pts`);

  // Tool overlap (0–10 pts)
  const toolPts = Math.round((toolCoverage / 100) * 10);
  score += toolPts;
  reasons.push(`Tool coverage ${toolCoverage}% → ${toolPts}/10 pts`);

  return { score: Math.min(score, 25), reasons };
}

// ── DIMENSION: Project Strength (max 20) — P17.1: QUALITY-WEIGHTED ──────────
function scoreProjects(features, resumeText) {
  let score = 0;
  const reasons = [];

  const { projectCount, metricCount, formatting } = features;

  // P17.1: Run projectQualityEngine if we have the raw text
  let qualityResult = null;
  let qualityBonus = 0;
  if (resumeText) {
    try {
      qualityResult = scoreProjectQuality(resumeText);
      // Map portfolio tier to bonus points (0–4 pts)
      const tierBonus = { strong: 4, moderate: 2, weak: 0, minimal: 0, none: 0 };
      qualityBonus = tierBonus[qualityResult.overallTier] || 0;
      if (qualityBonus > 0) {
        reasons.push(`Portfolio quality tier: ${qualityResult.overallTier} (+${qualityBonus} quality bonus)`);
      }
    } catch (err) {
      // Graceful fallback
    }
  }

  // Project count (0–8 pts) — reduced from 12 since quality now contributes
  if (projectCount === 0) {
    reasons.push('No projects detected (0/8 pts)');
  } else if (projectCount === 1) {
    score += 3; reasons.push('1 project detected (3/8 pts)');
  } else if (projectCount === 2) {
    score += 5; reasons.push('2 projects detected (5/8 pts)');
  } else if (projectCount >= 3) {
    score += 8; reasons.push(`${projectCount} projects detected (8/8 pts)`);
  }

  // Quality bonus (0–4 pts)
  score += qualityBonus;

  // GitHub presence (4 pts)
  if (formatting.hasGitHub) { score += 4; reasons.push('GitHub/portfolio link found (+4)'); }

  // Metric usage in projects context (0–4 pts)
  if (metricCount >= 5) {
    score += 4; reasons.push('Strong metric usage in projects (5+ metrics, +4)');
  } else if (metricCount >= 2) {
    score += 2; reasons.push('Some metrics in projects (+2)');
  }

  return { score: Math.min(score, 20), reasons };
}

// ── DIMENSION: Experience Strength (max 15) ───────────────────────────────────
function scoreExperience(features) {
  let score = 0;
  const reasons = [];

  const { experienceYears, education, actionVerbs } = features;

  // Years of experience (0–8 pts)
  if (experienceYears >= 5) {
    score += 8; reasons.push(`${experienceYears}+ years experience (8/8 pts)`);
  } else if (experienceYears >= 3) {
    score += 6; reasons.push(`${experienceYears} years experience (6/8 pts)`);
  } else if (experienceYears >= 1) {
    score += 4; reasons.push(`${experienceYears} year(s) experience (4/8 pts)`);
  } else {
    score += 2; reasons.push('Fresher / entry-level (2/8 pts)');
  }

  // Education signals (0–4 pts)
  if (education.hasDegree) {
    score += 2; reasons.push('Degree detected (+2)');
  }
  if (education.isTier1) {
    score += 2; reasons.push('Tier 1 institution detected (+2)');
  }

  // Action verb quality (0–3 pts)
  if (actionVerbs.quality === 'strong') {
    score += 3; reasons.push('Strong action verb quality (+3)');
  } else if (actionVerbs.quality === 'moderate') {
    score += 1; reasons.push('Moderate action verb quality (+1)');
  }

  return { score: Math.min(score, 15), reasons };
}

// ── DIMENSION: Impact Strength (max 10) ───────────────────────────────────────
function scoreImpact(features) {
  let score = 0;
  const reasons = [];

  const { metricCount, actionVerbs } = features;

  // Quantified metrics (0–7 pts)
  if (metricCount >= 8) {
    score += 7; reasons.push(`${metricCount} quantified metrics (7/7 pts)`);
  } else if (metricCount >= 5) {
    score += 5; reasons.push(`${metricCount} quantified metrics (5/7 pts)`);
  } else if (metricCount >= 2) {
    score += 3; reasons.push(`${metricCount} quantified metrics (3/7 pts)`);
  } else if (metricCount === 1) {
    score += 1; reasons.push('Only 1 quantified metric (1/7 pts)');
  } else {
    reasons.push('No quantified metrics (0/7 pts)');
  }

  // Tier-1 action verbs (0–3 pts)
  if (actionVerbs.tier1 >= 5) {
    score += 3; reasons.push(`${actionVerbs.tier1} strong action verbs (+3)`);
  } else if (actionVerbs.tier1 >= 2) {
    score += 1; reasons.push(`${actionVerbs.tier1} strong action verbs (+1)`);
  }

  return { score: Math.min(score, 10), reasons };
}

// ── DIMENSION: Structure Quality (max 10) ─────────────────────────────────────
function scoreStructure(features) {
  let score = 0;
  const reasons = [];

  const f = features.formatting;

  if (f.hasEmail)    { score += 2; reasons.push('Email present (+2)'); }
  if (f.hasPhone)    { score += 1; reasons.push('Phone present (+1)'); }
  if (f.hasLinkedIn) { score += 2; reasons.push('LinkedIn present (+2)'); }
  if (f.hasGitHub)   { score += 2; reasons.push('GitHub present (+2)'); }

  // Length check (2 pts for optimal length)
  const pages = features.estimatedPages;
  if (pages >= 1 && pages <= 2) {
    score += 3; reasons.push(`Optimal length (~${pages} page(s)) (+3)`);
  } else if (pages > 2) {
    reasons.push(`Resume too long (~${pages} pages) (0)`);
  } else {
    reasons.push('Resume too short (0)');
  }

  return { score: Math.min(score, 10), reasons };
}

// ── MAIN SCORING FUNCTION ─────────────────────────────────────────────────────
/**
 * Score a resume against a job description using 6-dimension math.
 * @param {string} resumeText
 * @param {string} jobDescription
 * @param {string} targetRole
 * @returns {ResumeScoreResult}
 */
function scoreResume(resumeText, jobDescription = '', targetRole = 'Default') {
  // Step 1: Extract features
  const pair = jobDescription
    ? extractPair(resumeText, jobDescription)
    : { resume: extractFeatures(resumeText, 'resume'), jd: extractFeatures('', 'jd'), intersection: { sharedSkills: [], missingSkills: [], sharedTools: [], missingTools: [], bonusSkills: [], skillCoverage: 0, toolCoverage: 0 } };

  const resumeFeatures = pair.resume;
  const jdFeatures     = pair.jd;
  const intersection   = pair.intersection;

  // Step 2: Score all 6 dimensions
  const atsResult    = scoreATS(resumeFeatures);
  const kwResult     = scoreKeywordMatch(resumeFeatures, jdFeatures, intersection);
  const projResult   = scoreProjects(resumeFeatures, resumeText); // P17.1: pass raw text for quality analysis
  const expResult    = scoreExperience(resumeFeatures);
  const impResult    = scoreImpact(resumeFeatures);
  const strResult    = scoreStructure(resumeFeatures);

  const breakdown = {
    ats:        atsResult.score,
    keywords:   kwResult.score,
    projects:   projResult.score,
    experience: expResult.score,
    impact:     impResult.score,
    structure:  strResult.score,
  };

  const rawTotal = Object.values(breakdown).reduce((a, b) => a + b, 0);

  // Step 3: Apply penalties
  const { totalDeduction, appliedPenalties } = applyResumePenalties(resumeFeatures);
  const finalScore = Math.max(0, Math.min(100, rawTotal - totalDeduction));

  // Step 4: Rule-based feedback
  const ruleFeedback = generateResumeFeedback(breakdown, resumeFeatures, appliedPenalties);

  // Step 5: Benchmark
  const benchmark = getBenchmarkReport(finalScore, 'resume');

  // Step 6: Project quality analysis (P17.1)
  let projectQuality = null;
  try {
    projectQuality = require('./projectQualityEngine').scoreProjects(resumeText);
  } catch (err) { /* graceful skip */ }

  // Step 7: Assemble scoring breakdown for transparency
  const scoringBreakdown = [
    { dimension: 'ATS Compatibility',   maxPts: 20, earned: breakdown.ats,        reasons: atsResult.reasons  },
    { dimension: 'Keyword Match',       maxPts: 25, earned: breakdown.keywords,   reasons: kwResult.reasons   },
    { dimension: 'Project Strength',    maxPts: 20, earned: breakdown.projects,   reasons: projResult.reasons },
    { dimension: 'Experience Strength', maxPts: 15, earned: breakdown.experience, reasons: expResult.reasons  },
    { dimension: 'Impact Strength',     maxPts: 10, earned: breakdown.impact,     reasons: impResult.reasons  },
    { dimension: 'Structure Quality',   maxPts: 10, earned: breakdown.structure,  reasons: strResult.reasons  },
  ];

  const result = {
    totalScore:        finalScore,
    rawScore:          rawTotal,
    penaltyDeduction:  totalDeduction,
    breakdown,
    scoringBreakdown,
    appliedPenalties,
    sectionWeaknesses: ruleFeedback.sectionWeaknesses,
    exactImprovements: ruleFeedback.exactImprovements,
    strengths:         ruleFeedback.strengths,
    benchmark,
    missingSkills:     intersection.missingSkills,
    sharedSkills:      intersection.sharedSkills,
    missingTools:      intersection.missingTools,
    // P17.1: Project quality analysis
    projectQuality,
    resumeFeatures: {
      skillCount:        resumeFeatures.skillCount,
      projectCount:      resumeFeatures.projectCount,
      metricCount:       resumeFeatures.metricCount,
      experienceYears:   resumeFeatures.experienceYears,
      estimatedPages:    resumeFeatures.estimatedPages,
      actionVerbQuality: resumeFeatures.actionVerbs.quality,
    },
  };

  // P18: Trust & Market Intelligence
  result.explainability = explainDocumentScore(result);
  result.companyBenchmarks = getCompanyBenchmarks(finalScore, targetRole);
  
  // Collect all skills found in the resume
  const allUserSkills = [...(resumeFeatures.skills?.hard || []), ...(resumeFeatures.skills?.tools || [])];
  
  result.marketIntelligence = analyzeMarketRelevance(allUserSkills);
  result.careerGap = analyzeCareerGap(allUserSkills, targetRole);

  // If market penalty applies, deduct it from final score
  if (result.marketIntelligence.marketPenalty > 0) {
    result.totalScore = Math.max(0, result.totalScore - result.marketIntelligence.marketPenalty);
    result.appliedPenalties.push({
      id: 'MARKET_PENALTY',
      message: result.marketIntelligence.warning,
      deduction: result.marketIntelligence.marketPenalty
    });
    // Re-generate explainability to reflect the market penalty
    result.explainability = explainDocumentScore(result);
  }

  return result;
}

module.exports = { scoreResume };

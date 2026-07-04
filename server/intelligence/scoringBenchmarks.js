/**
 * scoringBenchmarks.js — Phase P17 Benchmark Calibration Layer
 * =============================================================
 * Hardcoded anchors to prevent score inflation.
 * Provides percentile lookup and hiring label classification.
 *
 * Philosophy: Scores are ABSOLUTE. A 72 always means the same thing.
 */

// ── INTERVIEW SCORE ANCHORS ────────────────────────────────────────────────────
// Each band defines the minimum requirement to achieve that score range.
const INTERVIEW_ANCHORS = {
  90: 'Knows concept deeply AND demonstrates production-level tradeoffs AND gives quantified examples',
  80: 'Knows concept AND gives specific technical examples with correct terminology',
  70: 'Knows concept broadly AND gives relevant but surface-level examples',
  60: 'Partially understands concept, examples are vague or partially incorrect',
  50: 'Shows awareness of concept but cannot explain correctly',
  30: 'Answer misses the core concept entirely — fundamental gap',
   0: 'No meaningful attempt or completely wrong answer',
};

// ── RESUME SCORE ANCHORS ───────────────────────────────────────────────────────
const RESUME_ANCHORS = {
  90: 'ATS-optimized, keyword-dense, all quantified metrics, clean hierarchy, 1-2 pages',
  80: 'Good keyword density, mostly quantified, minor formatting issues',
  70: 'Decent structure, some quantified metrics, missing some critical keywords',
  60: 'Basic structure, few metrics, keyword gaps but generally readable',
  50: 'Passes basic ATS but weak keyword match and no quantification',
  40: 'Significant structural problems, major keyword gaps, poor impact signals',
   0: 'Missing critical sections, completely unoptimized, no metrics',
};

// ── JD MATCH SCORE ANCHORS ────────────────────────────────────────────────────
const JD_MATCH_ANCHORS = {
  90: 'Matches all role-defining skills, tools, and experience level',
  80: 'Matches most critical skills with minor gaps in secondary tools',
  70: 'Solid skill overlap but missing 1-2 critical tools or experience depth',
  60: 'Matches 60-70% of requirements — needs upskilling before applying',
  50: 'Core skill overlap exists but significant gaps in role-defining requirements',
  30: 'Fundamental mismatch — missing multiple role-defining skills',
   0: 'No meaningful overlap',
};

// ── PERCENTILE TABLE (Interview) ──────────────────────────────────────────────
// Based on simulated distribution of 10,000 candidate answers
// (calibrated to be harsh — real engineering bars are high)
const INTERVIEW_PERCENTILE = [
  { min: 90, max: 100, percentile: 95, label: 'Top 5%'  },
  { min: 80, max: 89,  percentile: 85, label: 'Top 15%' },
  { min: 70, max: 79,  percentile: 72, label: 'Top 28%' },
  { min: 60, max: 69,  percentile: 55, label: 'Top 45%' },
  { min: 50, max: 59,  percentile: 35, label: 'Top 65%' },
  { min: 40, max: 49,  percentile: 20, label: 'Bottom 80%' },
  { min:  0, max: 39,  percentile:  5, label: 'Bottom 95%' },
];

// ── PERCENTILE TABLE (Resume) ─────────────────────────────────────────────────
const RESUME_PERCENTILE = [
  { min: 85, max: 100, percentile: 92, label: 'Top 8%'  },
  { min: 75, max: 84,  percentile: 80, label: 'Top 20%' },
  { min: 65, max: 74,  percentile: 65, label: 'Top 35%' },
  { min: 55, max: 64,  percentile: 48, label: 'Top 52%' },
  { min: 45, max: 54,  percentile: 30, label: 'Bottom 70%' },
  { min:  0, max: 44,  percentile: 10, label: 'Bottom 90%' },
];

// ── HIRING LABELS (Interview) ──────────────────────────────────────────────────
const INTERVIEW_HIRING_LABEL = [
  { min: 85, max: 100, verdict: 'Strong Hire',  verdictClass: 'strong-hire',
    label: 'Exceptional candidate. Demonstrated depth exceeds role requirements.',
    benchmarkComparison: 'Performs at Senior / Staff Engineer level thinking.' },
  { min: 70, max: 84,  verdict: 'Hire',         verdictClass: 'hire',
    label: 'Solid candidate. Meets role requirements with minimal gaps.',
    benchmarkComparison: 'Performs at SDE-1 / SDE-2 baseline.' },
  { min: 55, max: 69,  verdict: 'Borderline',   verdictClass: 'borderline',
    label: 'Borderline candidate. Passes surface screening but will likely fail deep technical interviews.',
    benchmarkComparison: 'Performs below average SDE-1. Needs 2-4 months of targeted preparation.' },
  { min:  0, max: 54,  verdict: 'No Hire',      verdictClass: 'no-hire',
    label: 'Significant gaps in fundamental knowledge. Would require extensive mentoring.',
    benchmarkComparison: 'Performs below fresher benchmark. Critical rework needed.' },
];

// ── RESUME HIRING LABELS ───────────────────────────────────────────────────────
const RESUME_HIRING_LABEL = [
  { min: 85, max: 100, verdict: 'ATS Passes + Recruiter Friendly',
    label: 'Resume will clear ATS filters and interest a human recruiter.' },
  { min: 70, max: 84,  verdict: 'ATS Passes',
    label: 'Resume clears ATS but may get low recruiter engagement.' },
  { min: 55, max: 69,  verdict: 'Borderline ATS',
    label: 'Risk of ATS rejection. Needs keyword and structure improvements.' },
  { min:  0, max: 54,  verdict: 'Likely ATS Rejected',
    label: 'Resume will likely be filtered out before human review.' },
];

// ── JD MATCH REJECTION RISK ───────────────────────────────────────────────────
const JD_REJECTION_RISK = [
  { min: 80, max: 100, risk: 'Low',    riskClass: 'low',
    label: 'Strong match. High callback probability.' },
  { min: 65, max: 79,  risk: 'Medium', riskClass: 'medium',
    label: 'Moderate match. Address 1-2 gaps before applying.' },
  { min: 50, max: 64,  risk: 'High',   riskClass: 'high',
    label: 'Significant gaps. Application likely to be screened out.' },
  { min:  0, max: 49,  risk: 'Critical', riskClass: 'critical',
    label: 'Critical mismatch. Do not apply without major upskilling.' },
];

// ── LOOKUP FUNCTIONS ──────────────────────────────────────────────────────────
function getPercentile(score, table) {
  return table.find(t => score >= t.min && score <= t.max)
    || table[table.length - 1];
}

function getHiringVerdict(score, type = 'interview') {
  const table = type === 'interview' ? INTERVIEW_HIRING_LABEL : RESUME_HIRING_LABEL;
  return table.find(t => score >= t.min && score <= t.max)
    || table[table.length - 1];
}

function getRejectionRisk(matchScore) {
  return JD_REJECTION_RISK.find(r => matchScore >= r.min && matchScore <= r.max)
    || JD_REJECTION_RISK[JD_REJECTION_RISK.length - 1];
}

function getBenchmarkReport(score, type = 'interview') {
  const percentileTable = type === 'interview' ? INTERVIEW_PERCENTILE : RESUME_PERCENTILE;
  const anchors         = type === 'interview' ? INTERVIEW_ANCHORS : RESUME_ANCHORS;

  const percentileData  = getPercentile(score, percentileTable);
  const hiringVerdict   = getHiringVerdict(score, type);

  // Find the anchor band
  const anchorScore = Object.keys(anchors)
    .map(Number)
    .filter(k => score >= k)
    .sort((a, b) => b - a)[0] ?? 0;

  return {
    score,
    percentile:         percentileData.percentile,
    percentileLabel:    percentileData.label,
    verdict:            hiringVerdict.verdict,
    verdictClass:       hiringVerdict.verdictClass,
    verdictLabel:       hiringVerdict.label,
    benchmarkComparison: hiringVerdict.benchmarkComparison || null,
    anchor:             anchors[anchorScore],
  };
}

module.exports = {
  getPercentile,
  getHiringVerdict,
  getRejectionRisk,
  getBenchmarkReport,
  INTERVIEW_HIRING_LABEL,
  RESUME_HIRING_LABEL,
  JD_REJECTION_RISK,
};

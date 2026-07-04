/**
 * interviewScoringEngine.js — Phase P17.1 Upgraded
 * =================================================
 * Upgrades:
 *   - Semantic concept matching (event-driven ≈ pub-sub)
 *   - Reasoning engine integration (tradeoff, why, architecture)
 *   - Severity layer (Critical / Major / Minor) on all weaknesses
 *   - Confidence calibration per answer and per session
 */

const { applyInterviewPenalties }   = require('./penaltyEngine');
const { generateInterviewFeedback } = require('./ruleFeedbackEngine');
const { getBenchmarkReport }        = require('../intelligence/scoringBenchmarks');
const { scoreReasoning }            = require('./reasoningEngine');
const { textContainsConcept }       = require('../intelligence/featureExtractor');
// P18 Additions
const { explainInterviewAnswer }    = require('./explainabilityEngine');
const { getCompanyBenchmarks }      = require('../intelligence/companyBenchmarks');


// ── HEDGING PHRASES (confidence killers) ─────────────────────────────────────
const HEDGING_PHRASES = [
  'i think', 'i guess', 'maybe', 'probably', 'might be',
  'not sure', 'i believe', 'sort of', 'kind of', "i'm not sure",
  "i don't know", "i'm not certain", 'i am not certain',
];

// ── STRUCTURE SIGNALS ─────────────────────────────────────────────────────────
const STRUCTURE_SIGNALS = {
  numbered:  /\b(first|second|third|1\.|2\.|3\.|firstly|secondly|thirdly)\b/i,
  star:      /\b(situation|task|action|result|in this case|the outcome|as a result)\b/i,
  contrast:  /\b(however|on the other hand|alternatively|whereas|but|in contrast)\b/i,
  example:   /\b(for example|for instance|such as|like when|e\.g\.)\b/i,
  structure: /\b(approach|solution|first|then|finally|in summary|to conclude)\b/i,
};

// ── DIMENSION: Technical Accuracy (max 30) — P17.1: SEMANTIC MATCHING ────────
function scoreTechnicalAccuracy(answerText, question) {
  const lower   = answerText.toLowerCase();
  const reasons = [];

  const expected = question.expectedConcepts || [];
  const critical = question.criticalConcepts || [];

  // P17.1: Use semantic matching — textContainsConcept handles synonyms
  // e.g. expected concept "reconciliation" also matches "diffing algorithm"
  const matchedExpected = expected.filter(c => textContainsConcept(answerText, c));
  const semanticBonus   = expected.filter(c =>
    !lower.includes(c.toLowerCase()) && textContainsConcept(answerText, c)
  );
  if (semanticBonus.length > 0) {
    reasons.push(`Semantic match bonus: "${semanticBonus.join(', ')}" matched via synonyms`);
  }

  const expectedPct = expected.length > 0 ? matchedExpected.length / expected.length : 0.5;
  const expectedPts = Math.round(expectedPct * 18);
  reasons.push(`Expected concepts: ${matchedExpected.length}/${expected.length} matched (semantic) → ${expectedPts}/18`);

  // Critical concepts — semantic matching too
  const matchedCritical = critical.filter(c => textContainsConcept(answerText, c));
  const criticalPct = critical.length > 0 ? matchedCritical.length / critical.length : 0.5;
  const criticalPts = Math.round(criticalPct * 12);
  reasons.push(`Critical concepts: ${matchedCritical.length}/${critical.length} matched → ${criticalPts}/12`);

  const score = Math.min(expectedPts + criticalPts, 30);

  return {
    score,
    reasons,
    matchedExpected,
    missingExpected:  expected.filter(c => !textContainsConcept(answerText, c)),
    matchedCritical,
    missingCritical:  critical.filter(c => !textContainsConcept(answerText, c)),
    semanticBonus,
  };
}

// ── DIMENSION: Depth (max 25) ─────────────────────────────────────────────────
function scoreDepth(answerText, question) {
  const words   = answerText.trim().split(/\s+/);
  const wordCount = words.length;
  const reasons = [];

  // Length score (0–12 pts)
  let lengthPts;
  if (wordCount >= 150)       { lengthPts = 12; reasons.push(`${wordCount} words (excellent length, +12)`); }
  else if (wordCount >= 80)   { lengthPts = 9;  reasons.push(`${wordCount} words (good length, +9)`); }
  else if (wordCount >= 40)   { lengthPts = 5;  reasons.push(`${wordCount} words (thin, +5)`); }
  else if (wordCount >= 20)   { lengthPts = 2;  reasons.push(`${wordCount} words (very thin, +2)`); }
  else                        { lengthPts = 0;  reasons.push(`${wordCount} words (insufficient, +0)`); }

  // Technical density: count unique technical terms from ontology (0–13 pts)
  const lower = answerText.toLowerCase();
  const { ontology } = require('../intelligence/skillOntology');
  let techTermCount = 0;
  for (const [canonical, data] of Object.entries(ontology)) {
    const toCheck = [canonical, ...(data.aliases || [])].slice(0, 3);
    for (const term of toCheck) {
      if (lower.includes(term.toLowerCase())) { techTermCount++; break; }
    }
  }

  let techPts;
  if (techTermCount >= 8)      { techPts = 13; reasons.push(`${techTermCount} technical terms (excellent density, +13)`); }
  else if (techTermCount >= 5) { techPts = 9;  reasons.push(`${techTermCount} technical terms (good, +9)`); }
  else if (techTermCount >= 3) { techPts = 5;  reasons.push(`${techTermCount} technical terms (moderate, +5)`); }
  else if (techTermCount >= 1) { techPts = 2;  reasons.push(`${techTermCount} technical terms (low, +2)`); }
  else                         { techPts = 0;  reasons.push('No technical terms detected (0)'); }

  return { score: Math.min(lengthPts + techPts, 25), reasons };
}

// ── DIMENSION: Communication (max 20) ────────────────────────────────────────
function scoreCommunication(answerText) {
  const lower   = answerText.toLowerCase();
  const reasons = [];
  let score     = 0;

  // Check structure signals (0–14 pts)
  const signalMatches = Object.entries(STRUCTURE_SIGNALS).filter(([, re]) => re.test(lower));
  const structurePts  = Math.min(14, signalMatches.length * 3 + 2);
  score += structurePts;

  if (signalMatches.length === 0) {
    reasons.push('No structural signals detected — answer is an unorganized wall of text (0/14)');
  } else {
    reasons.push(`${signalMatches.length} structure signals detected (${signalMatches.map(([k]) => k).join(', ')}) → ${structurePts}/14`);
  }

  // Clarity: no run-on sentences (0–6 pts)
  const sentences = answerText.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const avgSentLen = sentences.length > 0
    ? sentences.reduce((a, s) => a + s.split(/\s+/).length, 0) / sentences.length
    : 100;

  const clarityPts = avgSentLen <= 25 ? 6 : avgSentLen <= 40 ? 3 : 0;
  score += clarityPts;
  reasons.push(`Average sentence length: ${Math.round(avgSentLen)} words → clarity ${clarityPts}/6`);

  return { score: Math.min(score, 20), reasons };
}

// ── DIMENSION: Problem Solving (max 15) ──────────────────────────────────────
function scoreProblemSolving(answerText, question) {
  const lower   = answerText.toLowerCase();
  const reasons = [];
  let score     = 0;

  // Edge case awareness (0–6 pts)
  const edgeCaseSignals = [
    'edge case', 'corner case', 'what if', 'failure', 'error handling',
    'exception', 'retry', 'fallback', 'failure mode', 'race condition',
    'concurrency', 'at scale', 'high load', 'bottleneck',
  ];
  const edgeMatches = edgeCaseSignals.filter(s => lower.includes(s));
  const edgePts = Math.min(6, edgeMatches.length * 2);
  score += edgePts;
  reasons.push(`Edge case signals: ${edgeMatches.length} detected → ${edgePts}/6`);

  // Trade-off awareness (0–9 pts)
  const tradeoffSignals = [
    'tradeoff', 'trade-off', 'disadvantage', 'downside', 'drawback',
    'however', 'limitation', 'cost of', 'alternative', 'instead of',
    'pros and cons', 'benefit vs', 'sacrifice',
  ];
  const tradeoffMatches = tradeoffSignals.filter(s => lower.includes(s));
  const tradeoffPts = Math.min(9, tradeoffMatches.length * 3);
  score += tradeoffPts;
  reasons.push(`Tradeoff signals: ${tradeoffMatches.length} detected → ${tradeoffPts}/9`);

  return { score: Math.min(score, 15), reasons };
}

// ── DIMENSION: Confidence (max 10) ────────────────────────────────────────────
function scoreConfidence(answerText) {
  const lower   = answerText.toLowerCase();
  const reasons = [];

  const hedgeCount = HEDGING_PHRASES.filter(h => lower.includes(h)).length;

  let score;
  if (hedgeCount === 0)      { score = 10; reasons.push('No hedging language detected (excellent, 10/10)'); }
  else if (hedgeCount === 1) { score = 8;  reasons.push('1 hedging phrase (good, 8/10)'); }
  else if (hedgeCount === 2) { score = 5;  reasons.push('2 hedging phrases (moderate concern, 5/10)'); }
  else if (hedgeCount <= 4)  { score = 2;  reasons.push(`${hedgeCount} hedging phrases (poor confidence, 2/10)`); }
  else                       { score = 0;  reasons.push(`${hedgeCount} hedging phrases (destroys credibility, 0/10)`); }

  return { score, reasons, hedgeCount };
}

// ── CONFIDENCE CALIBRATION (P17.1) ────────────────────────────────────
/**
 * Calibrate how confident we are in this specific evaluation.
 * Low confidence = insufficient answer to score reliably.
 *
 * Factors that reduce evaluation confidence:
 *   - Answer too short (<40 words)
 *   - No technical terms found
 *   - Answer appears to be gibberish or random
 *   - Question has no scoring metadata (no expectedConcepts)
 *
 * Returns: 0–100 confidence score
 */
function calibrateEvaluationConfidence(answerText, question, finalScore) {
  let confidence = 100;
  const signals = [];

  const wordCount = answerText.trim().split(/\s+/).length;
  const hasMetadata = (question.expectedConcepts || []).length > 0;

  // Insufficient answer length — hard to score reliably
  if (wordCount < 20) {
    confidence -= 40;
    signals.push('Answer too short to score reliably (-40)');
  } else if (wordCount < 40) {
    confidence -= 20;
    signals.push('Answer is thin — limited signal to score (-20)');
  }

  // No question metadata — scoring is approximated
  if (!hasMetadata) {
    confidence -= 15;
    signals.push('Question has no scoring metadata — using heuristics only (-15)');
  }

  // Extreme score with low word count suggests unreliable signal
  if (wordCount < 50 && (finalScore > 85 || finalScore < 20)) {
    confidence -= 10;
    signals.push('Extreme score with minimal answer content (-10)');
  }

  // Repetitive answer (keyword stuffing) reduces signal quality
  const words = answerText.toLowerCase().split(/\s+/);
  const uniqueWords = new Set(words).size;
  const uniqueRatio = words.length > 0 ? uniqueWords / words.length : 1;
  if (uniqueRatio < 0.5 && wordCount > 30) {
    confidence -= 15;
    signals.push('High word repetition detected — answer quality is unreliable (-15)');
  }

  return {
    score: Math.max(20, Math.min(100, Math.round(confidence))),
    signals,
    label: confidence >= 80 ? 'High' : confidence >= 60 ? 'Medium' : 'Low',
  };
}

// ── SEVERITY TAGGER (P17.1) ─────────────────────────────────────────────
/**
 * Tag feedback items with severity levels.
 * Critical: score < 40% of max dimension, or penalty triggered
 * Major:    score 40–60% of max dimension
 * Minor:    score 60–75% of max dimension
 */
function tagSeverity(breakdown, appliedPenalties, reasoningPenalties) {
  const severityMap = [];

  const dims = [
    { key: 'technicalAccuracy', max: 30, label: 'Technical Accuracy' },
    { key: 'depth',             max: 25, label: 'Depth' },
    { key: 'communication',     max: 20, label: 'Communication' },
    { key: 'problemSolving',    max: 15, label: 'Problem Solving' },
    { key: 'confidence',        max: 10, label: 'Confidence' },
  ];

  for (const dim of dims) {
    const raw   = breakdown[dim.key];
    const pct   = raw / dim.max;
    let severity, severityClass, message;

    if (pct < 0.40) {
      severity      = 'Critical';
      severityClass = 'critical';
      message       = `${dim.label} is critically weak (${raw}/${dim.max}). This response would likely fail most product-company interviews.`;
    } else if (pct < 0.60) {
      severity      = 'Major';
      severityClass = 'major';
      message       = `${dim.label} is below acceptable threshold (${raw}/${dim.max}). A hiring manager would flag this as a concern.`;
    } else if (pct < 0.75) {
      severity      = 'Minor';
      severityClass = 'minor';
      message       = `${dim.label} could be stronger (${raw}/${dim.max}). Addressable with focused practice.`;
    } else {
      continue; // No severity tag needed for good scores
    }

    severityMap.push({ dimension: dim.label, severity, severityClass, message, score: raw, max: dim.max });
  }

  // Add penalty-derived critical issues
  for (const p of (appliedPenalties || [])) {
    severityMap.push({
      dimension: 'Penalty',
      severity: 'Critical',
      severityClass: 'critical',
      message: p.message,
      penaltyId: p.id,
    });
  }

  // Add reasoning penalties
  for (const p of (reasoningPenalties || [])) {
    severityMap.push({
      dimension: 'Reasoning Quality',
      severity: p.severity || 'Major',
      severityClass: (p.severity || 'major').toLowerCase(),
      message: p.message,
    });
  }

  return severityMap;
}

// ── SCORE A SINGLE ANSWER (P17.1 Upgraded) ─────────────────────────────
function scoreAnswer(answerText, question) {
  const techResult  = scoreTechnicalAccuracy(answerText, question);
  const depthResult = scoreDepth(answerText, question);
  const commResult  = scoreCommunication(answerText);
  const psResult    = scoreProblemSolving(answerText, question);
  const confResult  = scoreConfidence(answerText);

  // P17.1: Integrate reasoning engine
  const reasoningResult = scoreReasoning(answerText, question);

  const rawScore = techResult.score + depthResult.score + commResult.score + psResult.score + confResult.score;

  // Apply per-answer penalties
  const { deduction, appliedPenalties } = applyInterviewPenalties(answerText, question);

  // Also apply reasoning penalties (keyword stuffing, shallow gloss)
  const reasoningDeduction = reasoningResult.penaltyDeduction || 0;

  const finalScore = Math.max(0, Math.min(100, rawScore - deduction - Math.round(reasoningDeduction * 0.4)));
  // Note: reasoning penalty is weighted at 40% to avoid double-penalizing,
  // since problem solving already partially captures tradeoff awareness.

  // P17.1: Severity tagging
  const breakdown = {
    technicalAccuracy: techResult.score,
    depth:             depthResult.score,
    communication:     commResult.score,
    problemSolving:    psResult.score,
    confidence:        confResult.score,
  };
  const severityTags = tagSeverity(breakdown, appliedPenalties, reasoningResult.penalties);

  // P17.1: Confidence calibration
  const evalConfidence = calibrateEvaluationConfidence(answerText, question, finalScore);

  const result = {
    questionId:   question.id,
    question:     question.question,
    questionType: question.type,
    rawScore,
    penaltyDeduction: deduction + Math.round(reasoningDeduction * 0.4),
    finalScore,
    breakdown,
    reasons: {
      technicalAccuracy: techResult.reasons,
      depth:             depthResult.reasons,
      communication:     commResult.reasons,
      problemSolving:    psResult.reasons,
      confidence:        confResult.reasons,
    },
    matchedConcepts:  techResult.matchedExpected,
    missingConcepts:  techResult.missingExpected,
    matchedCritical:  techResult.matchedCritical,
    missingCritical:  techResult.missingCritical,
    semanticBonus:    techResult.semanticBonus || [],
    appliedPenalties: [...appliedPenalties, ...(reasoningResult.penalties || [])],
    // P17.1 additions
    reasoning:            reasoningResult,
    severityTags,
    evaluationConfidence: evalConfidence,
    isMistake: finalScore < 75,
  };

  // P18 Add explainability
  result.explainability = explainInterviewAnswer(result);
  return result;
}

// ── SCORE FULL SESSION ────────────────────────────────────────────────────────
/**
 * Score an entire interview session.
 * @param {Array<{question: object, answer: string}>} sessionData
 * @param {string} targetRole
 * @returns {InterviewEvaluation}
 */
function scoreInterviewSession(sessionData, targetRole = 'Default') {
  if (!sessionData || sessionData.length === 0) {
    throw new Error('No session data provided');
  }

  const answerResults = sessionData.map(item => scoreAnswer(item.answer, item.question));

  // Aggregate scores across all answers
  const avgScore = Math.round(
    answerResults.reduce((sum, r) => sum + r.finalScore, 0) / answerResults.length
  );

  // Dimension averages (for UI score breakdown)
  const avgBreakdown = {
    technicalAccuracy: Math.round(answerResults.reduce((s, r) => s + r.breakdown.technicalAccuracy, 0) / answerResults.length),
    depth:             Math.round(answerResults.reduce((s, r) => s + r.breakdown.depth, 0) / answerResults.length),
    communication:     Math.round(answerResults.reduce((s, r) => s + r.breakdown.communication, 0) / answerResults.length),
    problemSolving:    Math.round(answerResults.reduce((s, r) => s + r.breakdown.problemSolving, 0) / answerResults.length),
    confidence:        Math.round(answerResults.reduce((s, r) => s + r.breakdown.confidence, 0) / answerResults.length),
  };

  // Normalize to 0–100 scale per dimension (divide by max)
  const scorecardRaw = {
    technicalAccuracy: Math.round((avgBreakdown.technicalAccuracy / 30) * 100),
    depth:             Math.round((avgBreakdown.depth / 25) * 100),
    communication:     Math.round((avgBreakdown.communication / 20) * 100),
    problemSolving:    Math.round((avgBreakdown.problemSolving / 15) * 100),
    confidence:        Math.round((avgBreakdown.confidence / 10) * 100),
  };

  // All penalties collected
  const allPenalties = answerResults.flatMap(r => r.appliedPenalties);

  // Rule feedback
  const ruleFeedback = generateInterviewFeedback(scorecardRaw, allPenalties);

  // Mistake replays (score < 75)
  const mistakes = answerResults.filter(r => r.isMistake);

  // Benchmark
  const benchmark = getBenchmarkReport(avgScore, 'interview');

  // P18: Multi-tier company benchmarks
  const companyBenchmarks = getCompanyBenchmarks(avgScore, targetRole);

  // P17.1: Session-level confidence (average of per-answer confidence scores)
  const sessionConfidence = {
    score: Math.round(
      answerResults.reduce((s, r) => s + (r.evaluationConfidence?.score || 80), 0) / answerResults.length
    ),
    label: '',
    explanation: '',
  };
  sessionConfidence.label = sessionConfidence.score >= 80 ? 'High' : sessionConfidence.score >= 60 ? 'Medium' : 'Low';
  sessionConfidence.explanation = sessionConfidence.score >= 80
    ? 'All answers provided sufficient detail for reliable scoring.'
    : sessionConfidence.score >= 60
    ? 'Some answers were brief — scores for those questions may be approximate.'
    : 'Multiple answers were too short or lacked technical depth. Evaluation confidence is reduced — these scores should be treated as directional only.';

  // P17.1: Aggregate Critical severity tags across all answers
  const criticalIssues = answerResults
    .flatMap(r => (r.severityTags || []).filter(t => t.severity === 'Critical'))
    .slice(0, 5); // top 5 critical issues

  // P17.1: Reasoning summary across session
  const avgReasoningScore = Math.round(
    answerResults.reduce((s, r) => s + (r.reasoning?.score || 50), 0) / answerResults.length
  );
  const reasoningLabel = avgReasoningScore >= 70
    ? 'Deep Reasoner'
    : avgReasoningScore >= 50
    ? 'Surface Thinker'
    : 'Declarative Only';

  return {
    overallScore:  avgScore,
    verdict:       benchmark.verdict,
    verdictClass:  benchmark.verdictClass,
    verdictLabel:  benchmark.verdictLabel,
    benchmark,
    // P18: Company Multi-Tier Benchmarks
    companyBenchmarks,
    // P17.1: Evaluation confidence
    evaluationConfidence: sessionConfidence,
    // P17.1: Reasoning summary
    reasoningScore: avgReasoningScore,
    reasoningLabel,
    // P17.1: Top critical issues across session
    criticalIssues,
    // Scorecard (0–100 per dimension)
    scores: [
      {
        label:       'Technical Depth',
        score:       scorecardRaw.technicalAccuracy,
        rawScore:    avgBreakdown.technicalAccuracy,
        maxRaw:      30,
        status:      getScoreStatus(scorecardRaw.technicalAccuracy),
        statusClass: getStatusClass(scorecardRaw.technicalAccuracy),
        insight:     getInsight('technicalAccuracy', scorecardRaw.technicalAccuracy),
      },
      {
        label:       'Communication',
        score:       scorecardRaw.communication,
        rawScore:    avgBreakdown.communication,
        maxRaw:      20,
        status:      getScoreStatus(scorecardRaw.communication),
        statusClass: getStatusClass(scorecardRaw.communication),
        insight:     getInsight('communication', scorecardRaw.communication),
      },
      {
        label:       'Confidence',
        score:       scorecardRaw.confidence,
        rawScore:    avgBreakdown.confidence,
        maxRaw:      10,
        status:      getScoreStatus(scorecardRaw.confidence),
        statusClass: getStatusClass(scorecardRaw.confidence),
        insight:     getInsight('confidence', scorecardRaw.confidence),
      },
      {
        label:       'Problem Solving',
        score:       scorecardRaw.problemSolving,
        rawScore:    avgBreakdown.problemSolving,
        maxRaw:      15,
        status:      getScoreStatus(scorecardRaw.problemSolving),
        statusClass: getStatusClass(scorecardRaw.problemSolving),
        insight:     getInsight('problemSolving', scorecardRaw.problemSolving),
      },
    ],
    // Mistake replays with 4 brutal fields + P17.1 severity
    replays: mistakes.map(r => ({
      score:       r.finalScore,
      question:    r.question,
      questionType: r.questionType,
      userAnswer:  sessionData.find(s => s.question.id === r.questionId)?.answer || '',
      problem:     buildProblemStatement(r),
      missingConcepts: r.missingConcepts,
      missingCritical: r.missingCritical,
      semanticBonus:   r.semanticBonus,
      appliedPenalties: r.appliedPenalties,
      severityTags:    r.severityTags,
      evaluationConfidence: r.evaluationConfidence,
      // 4 brutal fields
      criticalIssue:         buildCriticalIssue(r),
      interviewerImpression: buildInterviewerImpression(r),
      hiringRisk:            buildHiringRisk(r),
      // P18 Explainability
      explainability:        r.explainability,
      // P17.1: reasoning quality summary for this replay
      reasoningQuality: r.reasoning?.qualityLabel || null,
      keywordStuffingDetected: (r.reasoning?.stuffedTerms || []).length > 0,
      // optimalAnswer will be filled by LLM explanation layer
      optimalAnswer: null,
    })),
    // Coaching plan from rule feedback
    coachingPlan: ruleFeedback.coachingDirectives,
    // Strengths / weaknesses (severity-tagged)
    strengths:    ruleFeedback.strengths,
    weaknesses:   ruleFeedback.weaknesses,
    // Simulation data
    simulation: {
      currentProb: Math.max(5, Math.round(avgScore * 0.6)),
      futureProb:  Math.min(95, Math.round(avgScore * 0.6 + ruleFeedback.coachingDirectives.length * 8)),
      confidenceGain: `+${Math.min(35, ruleFeedback.coachingDirectives.length * 8)}%`,
      timeframe: ruleFeedback.coachingDirectives.length >= 3 ? '3-5 weeks' : '1-2 weeks',
    },
    // Raw answer-level details
    answerResults,
  };
}

// ── HELPERS ───────────────────────────────────────────────────────────────────
function getScoreStatus(score) {
  if (score >= 80) return 'Excellent';
  if (score >= 65) return 'Good';
  if (score >= 50) return 'Fair';
  return 'Poor';
}

function getStatusClass(score) {
  if (score >= 80) return 'excellent';
  if (score >= 65) return 'good';
  if (score >= 50) return 'fair';
  return 'poor';
}

function getInsight(dimension, score) {
  const insights = {
    technicalAccuracy: {
      excellent: 'Demonstrates production-level technical understanding with correct terminology.',
      good:      'Solid technical knowledge with minor gaps in depth.',
      fair:      'Concepts understood at surface level — lacks production-level detail.',
      poor:      'Critical technical gaps detected. Core concepts are misunderstood.',
    },
    communication: {
      excellent: 'Clear, structured responses with logical progression.',
      good:      'Generally coherent — minor structural improvements needed.',
      fair:      'Answers lack organization. Hard to follow the reasoning chain.',
      poor:      'Severely unstructured. Interviewers cannot follow the candidate\'s thinking.',
    },
    confidence: {
      excellent: 'Speaks with authority. No hesitation or excessive hedging.',
      good:      'Mostly confident with occasional hedging.',
      fair:      'Frequent hedging reduces perceived competence significantly.',
      poor:      'Excessive hedging destroys credibility regardless of technical content.',
    },
    problemSolving: {
      excellent: 'Demonstrates systematic thinking with edge-case and tradeoff awareness.',
      good:      'Good structured thinking — misses some advanced tradeoff considerations.',
      fair:      'Problem-solving is reactive rather than systematic.',
      poor:      'No evidence of structured problem-solving approach.',
    },
  };
  const tier = getScoreStatus(score).toLowerCase();
  return insights[dimension]?.[tier] || '';
}

function buildProblemStatement(result) {
  const problems = [];
  if (result.missingConcepts.length > 0) {
    problems.push(`Missed key concepts: ${result.missingConcepts.slice(0, 3).join(', ')}.`);
  }
  if (result.missingCritical.length > 0) {
    problems.push(`Critical gaps: ${result.missingCritical.slice(0, 2).join(', ')} not mentioned.`);
  }
  if (result.appliedPenalties.length > 0) {
    problems.push(result.appliedPenalties[0].message);
  }
  return problems.join(' ') || 'Answer lacked sufficient technical depth and concept coverage.';
}

function buildCriticalIssue(result) {
  if (result.appliedPenalties.length > 0) return result.appliedPenalties[0].message;
  if (result.missingCritical.length > 0) {
    return `Failed to demonstrate knowledge of: ${result.missingCritical.slice(0, 2).join(', ')}. These are interview dealbreakers for senior engineers.`;
  }
  if (result.missingConcepts.length > 0) {
    return `Core concepts not covered: ${result.missingConcepts.slice(0, 3).join(', ')}.`;
  }
  return 'Answer was too vague to pass a technical screen at this level.';
}

function buildInterviewerImpression(result) {
  const score = result.finalScore;
  if (score < 30) return 'Candidate does not have the fundamentals for this role. Would not proceed past first screen.';
  if (score < 50) return 'Candidate shows surface-level familiarity but lacks depth. Would require significant mentoring for independent contribution.';
  if (score < 65) return 'Candidate has potential but demonstrated knowledge gaps that would concern a hiring manager. Borderline proceed.';
  return 'Candidate shows adequate knowledge but missed critical nuances. Would proceed with reservations.';
}

function buildHiringRisk(result) {
  const score = result.finalScore;
  if (score < 30) return 'Critical — immediate reject on this question. Pattern of such answers signals fundamental gap.';
  if (score < 50) return 'High — this answer alone would not eliminate the candidate, but combined with other weak answers, flags a hiring risk.';
  if (score < 65) return 'Medium — addressable with mentoring, but represents a gap that will show up in production within 3-6 months.';
  return 'Low — minor gap that can be closed during onboarding.';
}

module.exports = { scoreInterviewSession, scoreAnswer };

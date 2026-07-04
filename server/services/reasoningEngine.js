/**
 * reasoningEngine.js — Phase P17.1 Interview Reasoning Evaluator
 * ================================================================
 * Evaluates the QUALITY of reasoning in interview answers — not just
 * keyword presence. Detects whether a candidate actually understands
 * WHY, not just WHAT.
 *
 * Scores:
 *   Tradeoff Awareness  (0–35): Does the candidate acknowledge downsides?
 *   Why-Based Reasoning (0–35): Does the candidate explain causality?
 *   Architecture Thinking (0–30): Does the candidate think in systems?
 *
 * Penalties:
 *   Keyword Stuffing  (-15): Same term repeated 3+ times without context
 *   Shallow Gloss     (-10): Concept named but not explained at all
 */

// ── TRADEOFF VOCABULARY ───────────────────────────────────────────────────────
const TRADEOFF_PHRASES = [
  // Direct tradeoff language
  'trade-off', 'tradeoff', 'downside', 'disadvantage', 'limitation',
  'drawback', 'cost of', 'overhead', 'sacrifice', 'at the expense of',
  'pros and cons', 'benefit vs', 'however,', 'on the other hand',
  'alternatively,', 'in contrast,', 'whereas', 'but this comes with',
  'the downside is', 'the problem with', 'not ideal when',
  // Architecture-specific tradeoffs
  'consistency vs', 'latency vs', 'throughput vs', 'availability vs',
  'strong consistency', 'eventual consistency', 'cap theorem',
  'horizontal vs vertical', 'sql vs nosql', 'monolith vs microservices',
  'stateful vs stateless',
];

// ── WHY-BASED REASONING VOCABULARY ───────────────────────────────────────────
const WHY_PHRASES = [
  // Causal language
  'because', 'reason is', 'reason being', 'this is due to', 'this is why',
  'this ensures', 'this prevents', 'this allows', 'this enables',
  'the purpose of', 'the benefit of', 'why this works', 'so that',
  'which means', 'which results in', 'leading to', 'thus', 'therefore',
  'as a result', 'consequently', 'this solves', 'this avoids',
  'this reduces', 'this improves', 'this guarantees',
];

// ── ARCHITECTURE THINKING VOCABULARY ─────────────────────────────────────────
const ARCHITECTURE_PHRASES = [
  // System-level concepts
  'at scale', 'under load', 'high traffic', 'distributed', 'fault tolerant',
  'single point of failure', 'spof', 'horizontal scaling', 'vertical scaling',
  'bottleneck', 'latency', 'throughput', 'availability', 'durability',
  'idempotent', 'retry logic', 'circuit breaker', 'bulkhead',
  'service mesh', 'api gateway', 'load balancing', 'sharding', 'partitioning',
  'replication', 'cache invalidation', 'eventual consistency', 'write-ahead log',
  'queue depth', 'backpressure', 'rate limiting', 'timeouts',
  // Design patterns
  'observer pattern', 'singleton', 'factory', 'strategy pattern',
  'cqrs', 'event sourcing', 'saga pattern', 'two-phase commit',
];

// ── KEYWORD STUFFING DETECTOR ─────────────────────────────────────────────────
/**
 * Detects when a candidate repeats a technical term multiple times
 * without contextual elaboration — signals surface-level name-dropping.
 */
function detectKeywordStuffing(answerText) {
  const words = answerText.toLowerCase().split(/\s+/);
  const wordFreq = {};
  for (const w of words) {
    if (w.length > 4) wordFreq[w] = (wordFreq[w] || 0) + 1;
  }

  const stuffedTerms = Object.entries(wordFreq)
    .filter(([word, count]) => {
      // Only flag technical terms (not filler words)
      const isTechnical = /[a-z]{4,}/.test(word) &&
        !['this', 'that', 'with', 'from', 'have', 'they', 'what', 'when', 'will',
          'then', 'also', 'some', 'more', 'your', 'their', 'would', 'could',
          'should', 'which', 'these', 'those', 'both', 'each', 'very'].includes(word);
      return isTechnical && count >= 4;
    })
    .map(([term]) => term);

  return stuffedTerms;
}

// ── SHALLOW GLOSS DETECTOR ────────────────────────────────────────────────────
/**
 * Detects when a candidate mentions a concept but provides zero explanation.
 * Signal: technical term appears but no WHY/HOW language follows.
 */
function detectShallowGloss(answerText, expectedConcepts) {
  if (!expectedConcepts || expectedConcepts.length === 0) return [];

  const lower = answerText.toLowerCase();
  const whyHowSignals = [...WHY_PHRASES, ...TRADEOFF_PHRASES].map(p => p.toLowerCase());
  const hasReasoning = whyHowSignals.some(p => lower.includes(p));

  // If the answer contains expected concepts but ZERO reasoning language, it's shallow
  const mentionedConcepts = expectedConcepts.filter(c => lower.includes(c.toLowerCase()));

  if (mentionedConcepts.length > 0 && !hasReasoning) {
    return mentionedConcepts;
  }
  return [];
}

// ── MAIN REASONING SCORER ─────────────────────────────────────────────────────
/**
 * Score the reasoning quality of a single interview answer.
 * @param {string} answerText
 * @param {object} question  — with expectedConcepts, criticalConcepts
 * @returns {ReasoningResult}
 */
function scoreReasoning(answerText, question) {
  const lower   = answerText.toLowerCase();
  const reasons = [];
  let totalScore = 0;

  // ── Tradeoff Awareness (0–35) ───────────────────────────────────
  const tradeoffMatches = TRADEOFF_PHRASES.filter(p => lower.includes(p.toLowerCase()));
  let tradeoffPts;
  if (tradeoffMatches.length >= 4)      { tradeoffPts = 35; reasons.push(`Deep tradeoff reasoning: ${tradeoffMatches.slice(0,3).join(', ')} (+35)`); }
  else if (tradeoffMatches.length >= 2) { tradeoffPts = 22; reasons.push(`Tradeoff awareness present: ${tradeoffMatches.slice(0,2).join(', ')} (+22)`); }
  else if (tradeoffMatches.length === 1) { tradeoffPts = 10; reasons.push(`Surface tradeoff mention: ${tradeoffMatches[0]} (+10)`); }
  else                                   { tradeoffPts = 0;  reasons.push('No tradeoff awareness detected (0/35)'); }
  totalScore += tradeoffPts;

  // ── Why-Based Reasoning (0–35) ──────────────────────────────────
  const whyMatches = WHY_PHRASES.filter(p => lower.includes(p.toLowerCase()));
  let whyPts;
  if (whyMatches.length >= 4)      { whyPts = 35; reasons.push(`Strong causal reasoning: "${whyMatches.slice(0,2).join('", "')}" (+35)`); }
  else if (whyMatches.length >= 2) { whyPts = 22; reasons.push(`Some causal reasoning: "${whyMatches[0]}" (+22)`); }
  else if (whyMatches.length === 1) { whyPts = 10; reasons.push(`Minimal causal language (+10)`); }
  else                              { whyPts = 0;  reasons.push('No "why" reasoning detected — answer is declarative only (0/35)'); }
  totalScore += whyPts;

  // ── Architecture Thinking (0–30) ────────────────────────────────
  const archMatches = ARCHITECTURE_PHRASES.filter(p => lower.includes(p.toLowerCase()));
  let archPts;
  if (archMatches.length >= 3)      { archPts = 30; reasons.push(`Strong system-level thinking: ${archMatches.slice(0,3).join(', ')} (+30)`); }
  else if (archMatches.length >= 2) { archPts = 20; reasons.push(`System thinking present: ${archMatches.slice(0,2).join(', ')} (+20)`); }
  else if (archMatches.length === 1) { archPts = 10; reasons.push(`Some system thinking: ${archMatches[0]} (+10)`); }
  else                               { archPts = 0;  reasons.push('No architecture-level reasoning detected (0/30)'); }
  totalScore += archPts;

  const rawScore = Math.min(100, totalScore);

  // ── Penalties ────────────────────────────────────────────────────
  let penaltyDeduction = 0;
  const penalties = [];

  const stuffedTerms = detectKeywordStuffing(answerText);
  if (stuffedTerms.length > 0) {
    const deduction = 15;
    penaltyDeduction += deduction;
    penalties.push({
      type: 'KEYWORD_STUFFING',
      severity: 'Major',
      terms: stuffedTerms,
      message: `Keyword stuffing detected: "${stuffedTerms.slice(0, 3).join('", "')}" repeated excessively. This signals name-dropping without genuine understanding. Interviewers penalize this heavily.`,
      deduction,
    });
  }

  const shallowConcepts = detectShallowGloss(answerText, question?.expectedConcepts);
  if (shallowConcepts.length > 0) {
    const deduction = 10;
    penaltyDeduction += deduction;
    penalties.push({
      type: 'SHALLOW_GLOSS',
      severity: 'Major',
      concepts: shallowConcepts,
      message: `Concepts mentioned but not explained: "${shallowConcepts.slice(0, 2).join('", "')}". Naming a concept without explaining WHY or HOW it applies is a red flag — interviewers test understanding, not vocabulary.`,
      deduction,
    });
  }

  const finalScore = Math.max(0, rawScore - penaltyDeduction);

  // ── Reasoning Quality Label ───────────────────────────────────────
  let qualityLabel, qualityClass;
  if (finalScore >= 75)      { qualityLabel = 'Deep Reasoner';    qualityClass = 'excellent'; }
  else if (finalScore >= 55) { qualityLabel = 'Surface Thinker';  qualityClass = 'fair'; }
  else if (finalScore >= 35) { qualityLabel = 'Declarative Only'; qualityClass = 'poor'; }
  else                        { qualityLabel = 'No Reasoning';    qualityClass = 'critical'; }

  return {
    score: finalScore,
    rawScore,
    penaltyDeduction,
    breakdown: {
      tradeoffAwareness:   tradeoffPts,
      whyBasedReasoning:   whyPts,
      architectureThinking: archPts,
    },
    penalties,
    qualityLabel,
    qualityClass,
    reasons,
    // Diagnostic signals
    tradeoffSignals:  tradeoffMatches.slice(0, 5),
    whySignals:       whyMatches.slice(0, 5),
    archSignals:      archMatches.slice(0, 5),
    stuffedTerms,
  };
}

module.exports = { scoreReasoning, detectKeywordStuffing, detectShallowGloss };

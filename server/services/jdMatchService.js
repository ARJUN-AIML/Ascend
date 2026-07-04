/**
 * jdMatchService.js — Phase P17 Refactored
 * ==========================================
 * Pipeline:
 *   jdMatchScoringEngine (5-dimension math) → LLM only explains gaps
 */

const Groq = require('groq-sdk');
const PromptTelemetry       = require('../utils/promptTelemetry');
const { scoreJDMatch }      = require('./jdMatchScoringEngine');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || 'dummy_key' });

function parseSafeJSON(text, fallback = {}) {
  try {
    const match = text.match(/[\{\[][[\s\S]*[\}\]]/);
    if (!match) throw new Error('No JSON');
    return JSON.parse(match[0]);
  } catch {
    return fallback;
  }
}

const analyzeJobMatch = async (resumeText, jobDescription) => {
  const safeResume = PromptTelemetry.enforceBudget(resumeText, 15000);
  const safeJD     = PromptTelemetry.enforceBudget(jobDescription, 10000);

  // ── Step 1: Deterministic math scoring ─────────────────────────────────────
  const mathResult = scoreJDMatch(safeResume, safeJD);

  // ── Step 2: LLM Explanation Layer ──────────────────────────────────────────
  // LLM receives the math score and is told to explain gaps — not generate numbers.
  const explanationPrompt = `You are a brutally honest technical recruiter.
A candidate's resume has been mathematically analyzed against a job description.

SCORES (DO NOT CHANGE THESE):
- Overall Match Score: ${mathResult.matchScore}/100
- Rejection Risk: ${mathResult.rejectionRisk}
- Missing Skills: ${(mathResult.missingSkills || []).slice(0, 5).join(', ') || 'none detected'}
- Missing Tools: ${(mathResult.missingTools || []).slice(0, 3).join(', ') || 'none detected'}
- Shared Skills: ${(mathResult.sharedSkills || []).slice(0, 5).join(', ') || 'none'}

Return EXACTLY this JSON format. Do NOT invent any score numbers:
{
  "winProbability": "${mathResult.matchScore >= 70 ? 'High' : mathResult.matchScore >= 50 ? 'Moderate' : 'Low'}",
  "recruiterNote": "1–2 sentences: what a real recruiter would think seeing this application. Be direct and specific. No generic advice.",
  "topGap": "The single most critical skill/experience gap that would get this resume rejected. Be specific.",
  "quickWins": ["Specific action 1 to improve match score", "Specific action 2", "Specific action 3"]
}`;

  const safePrompt = PromptTelemetry.enforceBudget(explanationPrompt, 3000);

  let llmExplanation = {};
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: safePrompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.2,
      response_format: { type: 'json_object' },
    });

    llmExplanation = parseSafeJSON(chatCompletion.choices[0]?.message?.content || '{}', {});

    PromptTelemetry.logRequest({
      route: 'jd-match-explain', model: 'llama-3.3-70b-versatile',
      promptChars: safePrompt.length,
      groqLatency: 0, totalLatency: 0, success: true,
    });
  } catch (err) {
    console.warn('[jdMatchService] LLM explanation failed — math scores unaffected:', err.message);
    llmExplanation = {
      winProbability: mathResult.matchScore >= 70 ? 'High' : mathResult.matchScore >= 50 ? 'Moderate' : 'Low',
      recruiterNote:  'Analysis complete. Review the breakdown for specific gaps.',
      topGap:         (mathResult.missingSkills || [])[0] || 'Review missing skills for details.',
      quickWins:      ['Address missing critical skills', 'Tailor resume keywords', 'Add quantified metrics'],
    };
  }

  // ── Step 3: Merge math + explanation ───────────────────────────────────────
  return {
    // Math-derived scores (source of truth)
    matchScore:       mathResult.matchScore,
    rejectionRisk:    mathResult.rejectionRisk,
    rejectionRiskClass: mathResult.rejectionRiskClass,
    rejectionLabel:   mathResult.rejectionLabel,
    breakdown:        mathResult.breakdown,
    scoringBreakdown: mathResult.scoringBreakdown,
    appliedPenalties: mathResult.appliedPenalties,
    benchmark:        mathResult.benchmark,
    canonicalRole:    mathResult.canonicalRole,

    // Skill signals
    sharedSkills:     mathResult.sharedSkills,
    missingSkills:    mathResult.missingSkills,
    missingTools:     mathResult.missingTools,
    bonusSkills:      mathResult.bonusSkills,

    // Rule-based feedback
    strengths:        mathResult.strengths,
    gaps:             mathResult.gaps,
    rejectionReasons: mathResult.rejectionReasons,

    // LLM-only fields (explanation only — no numbers)
    winProbability:   llmExplanation.winProbability || 'Moderate',
    recruiterNote:    llmExplanation.recruiterNote   || null,
    topGap:           llmExplanation.topGap          || null,
    recommendations:  llmExplanation.quickWins       || [],
  };
};

module.exports = { analyzeJobMatch };

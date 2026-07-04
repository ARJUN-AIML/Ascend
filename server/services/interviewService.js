/**
 * interviewService.js — Phase P17 Refactored
 * ============================================
 * Pipeline:
 *   generateQuestions → questionBank (deterministic) + LLM enrichment
 *   evaluateInterview → interviewScoringEngine (math) → LLM explains optimalAnswers only
 */

const Groq = require('groq-sdk');
const { enqueueAIJob }          = require('./aiQueue');
const PromptTelemetry           = require('../utils/promptTelemetry');
const { getQuestionsForSession } = require('../intelligence/questionBank');
const { scoreInterviewSession } = require('./interviewScoringEngine');

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

// ── GENERATE QUESTIONS ────────────────────────────────────────────────────────
const generateQuestions = async (role, difficulty, experience, traceId = 'unknown') => {
  // Step 1: Pull from deterministic question bank
  const bankQuestions = getQuestionsForSession(role, experience, 5);

  if (bankQuestions && bankQuestions.length >= 5) {
    // Question bank has enough — return directly (no LLM needed)
    return bankQuestions;
  }

  // Step 2: Supplement with LLM if bank coverage is insufficient
  const needed = 5 - (bankQuestions?.length || 0);
  const prompt = `You are a strict technical interviewer.
Generate exactly ${needed} interview questions for a ${experience} level ${role} engineer (Difficulty: ${difficulty}).
Each question must be specific, technically precise, and not generic.
Return a JSON array ONLY. No markdown. Format:
[{ "id": "llm-1", "type": "Technical", "question": "...", "expectedConcepts": ["concept1", "concept2"], "criticalConcepts": ["critical1"], "penaltyTriggers": ["wrong answer phrase"] }]`;

  const safePrompt = PromptTelemetry.enforceBudget(prompt, 2000);

  const llmQuestions = await enqueueAIJob('generate-interview-questions', async (queueWaitTime) => {
    const start = performance.now();
    try {
      const chatCompletion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: safePrompt }],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.6,
        response_format: { type: 'json_object' },
      });
      let parsed = parseSafeJSON(chatCompletion.choices[0]?.message?.content || '[]', []);
      if (parsed.questions) parsed = parsed.questions;
      if (!Array.isArray(parsed)) parsed = [];

      PromptTelemetry.logRequest({
        route: 'generate-interview', model: 'llama-3.3-70b-versatile',
        promptChars: safePrompt.length, queueWaitTime,
        groqLatency: performance.now() - start, totalLatency: performance.now() - start, success: true,
      });

      return parsed.slice(0, needed);
    } catch (err) {
      console.error(`[TRACE ${traceId}] [FALLBACK TRIGGERED] generateQuestions failed:`, err.message);
      PromptTelemetry.logRequest({
        route: 'generate-interview', model: 'llama-3.3-70b-versatile',
        promptChars: safePrompt.length, queueWaitTime,
        groqLatency: performance.now() - start, totalLatency: performance.now() - start,
        success: false, fallbackUsed: true, errorMsg: err.message,
      });
      return [];
    }
  });

  return [...(bankQuestions || []), ...(llmQuestions || [])].slice(0, 5);
};

// ── EVALUATE SESSION ──────────────────────────────────────────────────────────
const evaluateInterview = async (role, difficulty, experience, sessionData, traceId = 'unknown') => {
  // Step 1: Deterministic scoring — NO LLM for scores
  const mathResult = scoreInterviewSession(sessionData);

  // Step 2: LLM Explanation Layer — generates only optimalAnswers for mistake replays
  // LLM receives the already-computed scores and is instructed NOT to generate numbers
  if (mathResult.replays && mathResult.replays.length > 0) {
    const replayContext = mathResult.replays.map((r, i) =>
      `Q${i+1} [Score: ${r.score}/100, Missing: ${(r.missingConcepts || []).slice(0,3).join(', ')}]: ${r.question}`
    ).join('\n');

    const explanationPrompt = `You are a brutal technical hiring manager at a top tech company.
The following interview answers have already been mathematically scored. DO NOT change any scores.
Your ONLY job is to write an "idealAnswer" for each question — what a Strong Hire candidate would have said.

Candidate Profile: ${experience} ${role} (Difficulty: ${difficulty})
Role-specific context.

Questions with score context:
${replayContext}

Return EXACTLY this JSON array (one object per question, same order):
[
  {
    "idealAnswer": "What a strong candidate should have said — specific, technical, production-aware. 3-5 sentences."
  }
]

Rules:
- No generic advice. Be specific to the question.
- Every ideal answer must mention the actual technical solution, not just "you should study X"
- If it is a system design question, include specific technologies and tradeoffs
- If it is a behavioral question, use STAR format with a concrete technical scenario
- Do NOT generate or modify any score numbers`;

    const safePrompt = PromptTelemetry.enforceBudget(explanationPrompt, 6000);

    try {
      const explanationResult = await enqueueAIJob('interview-explain', async (queueWaitTime) => {
        const start = performance.now();
        try {
          const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: safePrompt }],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.3,
            response_format: { type: 'json_object' },
          });
          const raw = chatCompletion.choices[0]?.message?.content || '[]';
          let parsed = parseSafeJSON(raw, []);
          if (!Array.isArray(parsed)) parsed = parsed.answers || parsed.questions || [];

          PromptTelemetry.logRequest({
            route: 'interview-explain', model: 'llama-3.3-70b-versatile',
            promptChars: safePrompt.length, queueWaitTime,
            groqLatency: performance.now() - start, totalLatency: performance.now() - start, success: true,
          });

          return parsed;
        } catch (err) {
          console.error(`[TRACE ${traceId}] [FALLBACK TRIGGERED] interview explanation failed:`, err.message);
          PromptTelemetry.logRequest({
            route: 'interview-explain', model: 'llama-3.3-70b-versatile',
            promptChars: safePrompt.length, queueWaitTime,
            groqLatency: performance.now() - start, totalLatency: performance.now() - start,
            success: false, fallbackUsed: true, errorMsg: err.message,
          });
          return [];
        }
      });

      // Inject ideal answers into replays
      if (Array.isArray(explanationResult)) {
        mathResult.replays = mathResult.replays.map((replay, i) => ({
          ...replay,
          optimalAnswer: explanationResult[i]?.idealAnswer || null,
        }));
      }
    } catch (err) {
      console.warn('[interviewService] LLM explanation failed — scores unaffected:', err.message);
    }
  }

  // Step 3: Generate summary verdict description via LLM (explains the verdict, no numbers)
  const summaryPrompt = `You are a hiring manager. The candidate scored ${mathResult.overallScore}/100 on a ${role} interview.
Verdict: ${mathResult.verdict}

Write exactly ONE sentence (max 25 words) explaining WHY this verdict was given — based on technical performance.
Be direct and brutally honest. No encouragement. No "however". Just the honest assessment.
Return ONLY the sentence string, no JSON.`;

  try {
    const summaryResult = await enqueueAIJob('interview-summary', async (queueWaitTime) => {
      const start = performance.now();
      try {
        const chatCompletion = await groq.chat.completions.create({
          messages: [{ role: 'user', content: summaryPrompt }],
          model: 'llama-3.3-70b-versatile',
          temperature: 0.2,
          max_tokens: 60,
        });
        return chatCompletion.choices[0]?.message?.content?.trim() || null;
      } catch {
        return null;
      }
    });
    mathResult.verdictSummary = summaryResult;
  } catch {
    mathResult.verdictSummary = null;
  }

  return mathResult;
};

module.exports = { generateQuestions, evaluateInterview };

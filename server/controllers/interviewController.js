const interviewService = require('../services/interviewService');
const EvaluationHistory = require('../models/EvaluationHistory');
const { v4: uuidv4 } = require('uuid');

const generateSession = async (req, res, next) => {
  try {
    const traceId = uuidv4();
    console.log(`\n[TRACE ${traceId}] interview/generateSession started for ${req.body.role}`);
    const { role, difficulty, experience } = req.body;
    if (!role || !difficulty || !experience) {
      return res.status(400).json({ error: 'Missing required parameters (role, difficulty, experience)' });
    }
    console.log(`[TRACE ${traceId}] Generating questions for ${difficulty} ${experience}...`);
    const questions = await interviewService.generateQuestions(role, difficulty, experience, traceId);
    res.status(200).json({ questions });
  } catch (err) {
    next(err);
  }
};

const evaluateSession = async (req, res, next) => {
  try {
    const traceId = uuidv4();
    const { role, difficulty, experience, sessionData } = req.body;
    console.log(`\n[TRACE ${traceId}] interview/evaluateSession started for ${role}. Questions: ${sessionData?.length}`);
    
    if (!sessionData || !Array.isArray(sessionData)) {
      return res.status(400).json({ error: 'Missing or invalid sessionData' });
    }
    const evaluation = await interviewService.evaluateInterview(role, difficulty, experience, sessionData, traceId);
    console.log(`[TRACE ${traceId}] Overall Score generated: ${evaluation.overallScore}`);
    
    // P19: Save to EvaluationHistory
    // Aggregate weaknesses/penalties across answers
    const allWeaknesses = [];
    const allPenalties = [];
    (evaluation.answerResults || []).forEach(ans => {
      if (ans.missingConcepts) allWeaknesses.push(...ans.missingConcepts);
      if (ans.missingCritical) allWeaknesses.push(...ans.missingCritical);
      if (ans.appliedPenalties) {
        allPenalties.push(...ans.appliedPenalties.map(p => p.message || p.id || p));
      }
    });

    await EvaluationHistory.create({
      user: req.user.id,
      type: 'interview',
      score: evaluation.overallScore || 50,
      breakdown: {
        technical: evaluation.overallScore, // Simplified for MVP if exact breakdown isn't flattened
      },
      weaknesses: [...new Set(allWeaknesses)], // dedup
      penalties: [...new Set(allPenalties)] // dedup
    });

    console.log(`[TRACE ${traceId}] evaluateSession complete. Overall: ${evaluation.overallScore}, Critical Issues: ${evaluation.criticalIssues?.length}`);
    res.status(200).json(evaluation);
  } catch (err) {
    next(err);
  }
};

module.exports = { generateSession, evaluateSession };

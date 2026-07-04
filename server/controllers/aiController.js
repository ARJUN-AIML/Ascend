const Product = require('../models/Product');
const EvaluationHistory = require('../models/EvaluationHistory');
const Groq = require('groq-sdk');
const fs = require('fs');
const { performance } = require('perf_hooks');
const resumeParserService = require('../services/resumeParserService');
const atsScoringService = require('../services/atsScoringService');
const skillAnalysisService = require('../services/skillAnalysisService');
const { enqueueAIJob } = require('../services/aiQueue');
const PromptTelemetry = require('../utils/promptTelemetry');
const FallbackAIService = require('../services/fallbackAIService');
const jdMatchService = require('../services/jdMatchService');
const resumeTailorService = require('../services/resumeTailorService');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || 'dummy_key' });

const parseSafeJSON = (text, fallback = {}) => {
  try {
    const match = text.match(/[\{\[][\s\S]*[\}\]]/);
    if (!match) throw new Error('No JSON structure found');
    return JSON.parse(match[0]);
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('[parseSafeJSON] Failed to parse:', err.message);
    return fallback;
  }
};

const { v4: uuidv4 } = require('uuid');

const handleQueueError = (err, res, next) => {
  if (err.isQueueRejection) {
    return res.status(429).json({ success: false, error: err.message });
  }
  next(err);
};

const generateInsight = async (req, res, next) => {
  try {
    const products = await Product.find({ user: req.user.id });
    if (products.length === 0) {
      return res.status(400).json({ error: 'No internship data available to analyze.' });
    }
    
    const total = products.length;
    const applied = products.filter(p => p.status === 'Applied').length;
    const interview = products.filter(p => p.status === 'Interview').length;
    const selected = products.filter(p => p.status === 'Selected').length;
    const rejected = products.filter(p => p.status === 'Rejected').length;

    const selectionRate = Math.round((total === 0 ? 0 : selected / total) * 100);
    const rejectionRate = Math.round((total === 0 ? 0 : rejected / total) * 100);
    const interviewConversion = Math.round((total === 0 ? 0 : interview / total) * 100);

    const latestProducts = products.slice(-50);
    const productDetails = latestProducts.map(p => `- ${p.role} at ${p.companyName} (Status: ${p.status})`).join('\n');

    let prompt = `You are an expert AI Career Coach for Ascend. Analyze the following internship application data.
Metrics:
- Total: ${total}
- Applied: ${applied}
- Interviews: ${interview}
- Selected: ${selected}
- Rejected: ${rejected}

Application History:
${productDetails}

Provide exactly this JSON format:
{
  "performanceSummary": "1-2 sentences summarizing their overall performance and trajectory",
  "keyIssues": ["Issue 1", "Issue 2", "Issue 3"],
  "recommendations": ["Highly specific recommendation 1", "Specific recommendation 2"],
  "actionPlan": ["Step 1", "Step 2"]
}`;

    // Prompt Budget Enforcement
    prompt = PromptTelemetry.enforceBudget(prompt, 8000);

    const parsedData = await enqueueAIJob('insights', async (queueWaitTime) => {
      const start = performance.now();
      try {
        const chatCompletion = await groq.chat.completions.create({
          messages: [{ role: "user", content: prompt }],
          model: "llama-3.3-70b-versatile",
          temperature: 0.7,
          response_format: { type: "json_object" }
        });

        const groqLatency = performance.now() - start;
        const parsed = parseSafeJSON(chatCompletion.choices[0]?.message?.content || "{}");
        
        PromptTelemetry.logRequest({
          route: 'insights',
          model: 'llama-3.3-70b-versatile',
          promptChars: prompt.length,
          queueWaitTime,
          groqLatency,
          totalLatency: performance.now() - start,
          success: true
        });

        return parsed;
      } catch (err) {
        PromptTelemetry.logRequest({
          route: 'insights',
          model: 'llama-3.3-70b-versatile',
          promptChars: prompt.length,
          queueWaitTime,
          groqLatency: performance.now() - start,
          totalLatency: performance.now() - start,
          success: false,
          fallbackUsed: true,
          errorMsg: err.message
        });
        return FallbackAIService.getFallbackInsights().data;
      }
    });

    res.status(200).json({
      insight: parsedData,
      metrics: { total, applied, interview, selected, rejected, selectionRate, rejectionRate, interviewConversion }
    });

  } catch (err) {
    handleQueueError(err, res, next);
  }
};

const extractResume = async (req, res, next) => {
  try {
    if (!req.file || !req.file.path) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }
    
    const buffer = await fs.promises.readFile(req.file.path);
    const text = await resumeParserService.extractText(buffer, req.file.mimetype);
    await fs.promises.unlink(req.file.path);
    
    res.status(200).json({ text });
  } catch (err) {
    if (req.file && req.file.path) {
      fs.promises.unlink(req.file.path).catch(() => {});
    }
    next(err);
  }
};

const extractSkills = async (req, res, next) => {
  try {
    const { resumeText } = req.body;
    if (!resumeText) return res.status(400).json({ error: 'No resume text provided.' });

    const safeText = PromptTelemetry.enforceBudget(resumeText, 15000);
    const prompt = `Extract exactly the top 15 technical skills, programming languages, and tools from this resume.
    Return ONLY a JSON object with a "skills" array of strings. Example: {"skills": ["React", "Python", "Docker"]}
    
    Resume:
    ${safeText}`;

    const parsedData = await enqueueAIJob('extract-skills', async (queueWaitTime) => {
      const start = performance.now();
      try {
        const chatCompletion = await groq.chat.completions.create({
          messages: [{ role: "user", content: prompt }],
          model: "llama-3.3-70b-versatile",
          temperature: 0.1,
          response_format: { type: "json_object" }
        });
        
        const parsed = parseSafeJSON(chatCompletion.choices[0]?.message?.content || "{}");
        PromptTelemetry.logRequest({
          route: 'extract-skills',
          model: 'llama-3.3-70b-versatile',
          promptChars: safeText.length,
          queueWaitTime,
          groqLatency: performance.now() - start,
          totalLatency: performance.now() - start,
          success: true
        });
        return parsed;
      } catch (err) {
        PromptTelemetry.logRequest({
          route: 'extract-skills',
          model: 'llama-3.3-70b-versatile',
          promptChars: safeText.length,
          queueWaitTime,
          groqLatency: performance.now() - start,
          totalLatency: performance.now() - start,
          success: false,
          fallbackUsed: true,
          errorMsg: err.message
        });
        return { skills: ["JavaScript", "Python", "React", "Node.js"] }; // Fallback
      }
    });

    res.status(200).json({ skills: parsedData.skills || [] });
  } catch(err) {
    handleQueueError(err, res, next);
  }
};

const analyzeResume = async (req, res, next) => {
  try {
    const { resumeText, roleTitle, jobDescription } = req.body;
    const traceId = uuidv4();
    console.log(`\n[TRACE ${traceId}] analyzeResume started for role: ${roleTitle}`);
    
    if (!resumeText || !roleTitle || !jobDescription) {
      return res.status(400).json({ error: 'Please provide resume text, role title, and job description.' });
    }

    const safeResumeText = PromptTelemetry.enforceBudget(resumeText, 20000);
    const safeJobDesc = PromptTelemetry.enforceBudget(jobDescription, 5000);

    const analysis = await enqueueAIJob('resume-analyze', async (queueWaitTime) => {
      const start = performance.now();
      try {
        const result = await atsScoringService.performHybridAnalysis(safeResumeText, roleTitle, safeJobDesc);
        
        PromptTelemetry.logRequest({
          route: 'resume-analyze',
          model: 'llama-3.3-70b-versatile',
          promptChars: safeResumeText.length + safeJobDesc.length + 1000,
          queueWaitTime,
          groqLatency: performance.now() - start,
          totalLatency: performance.now() - start,
          success: true
        });
        return result;
      } catch (err) {
        console.error(`[TRACE ${traceId}] [FALLBACK TRIGGERED] analyzeResume failed:`, err.message);
        PromptTelemetry.logRequest({
          route: 'resume-analyze',
          model: 'llama-3.3-70b-versatile',
          promptChars: safeResumeText.length + safeJobDesc.length + 1000,
          queueWaitTime,
          groqLatency: performance.now() - start,
          totalLatency: performance.now() - start,
          success: false,
          fallbackUsed: true,
          errorMsg: err.message
        });
        return FallbackAIService.getFallbackResume(safeResumeText, roleTitle).data;
      }
    });

    // --- P5: ACTION ENGINE TASK GENERATION ---
    const Task = require('../models/Task');
    const ScoreHistory = require('../models/ScoreHistory');

    // Dual Score Renaming
    const resumeScore = analysis.matchScore || analysis.resumeQualityScore || 50;
    const careerScore = analysis.confidenceScore || 50; // Mocking readiness as career score if not explicitly separated yet

    analysis.resumeScore = resumeScore;
    analysis.careerScore = careerScore;
    console.log(`[TRACE ${traceId}] Deterministic Scores -> Resume: ${resumeScore}, Career: ${careerScore}`);

    // Save Proof-of-Improvement Snapshot
    await ScoreHistory.create({
      user: req.user.id,
      resumeScore,
      careerScore
    });

    // P19: Save to EvaluationHistory
    await EvaluationHistory.create({
      user: req.user.id,
      type: 'resume',
      score: analysis.totalScore || resumeScore,
      breakdown: analysis.breakdown || {},
      weaknesses: analysis.sectionWeaknesses || analysis.weaknesses || [],
      penalties: analysis.appliedPenalties?.map(p => p.message || p.id) || []
    });

    // Delete old auto-generated tasks to prevent bloat when user re-scans
    await Task.deleteMany({ user: req.user.id, sourceType: 'AI_GENERATED', status: 'TODO' });

    const newTasks = [];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Generate Skill Build tasks for missing critical skills
    if (analysis.missingCriticalSkills && analysis.missingCriticalSkills.length > 0) {
      analysis.missingCriticalSkills.slice(0, 3).forEach((skill) => {
        newTasks.push({
          user: req.user.id,
          title: `Master critical missing skill: ${skill}`,
          description: `The AI identified ${skill} as a critical requirement for ${roleTitle} that is missing from your profile.`,
          type: 'SKILL_BUILD',
          priority: 'HIGH',
          impactScore: 20,
          estimatedMinutes: 60,
          difficulty: 'Hard',
          dueDate: tomorrow
        });
      });
    }

    // Generate Resume Fix tasks for weaknesses
    if (analysis.weaknesses && analysis.weaknesses.length > 0) {
      analysis.weaknesses.slice(0, 2).forEach((weakness) => {
        newTasks.push({
          user: req.user.id,
          title: 'Improve Resume Impact',
          description: weakness,
          type: 'RESUME_FIX',
          priority: 'MEDIUM',
          impactScore: 10,
          estimatedMinutes: 15,
          difficulty: 'Medium',
          dueDate: tomorrow
        });
      });
    }

    // Isolate generic recommendations from actionable tasks
    const genericRecommendations = analysis.recommendations || [];
    analysis.recommendations = undefined; // Strip it out, replaced by concrete tasks
    analysis.genericAdvice = genericRecommendations; 

    if (newTasks.length > 0) {
      await Task.insertMany(newTasks);
    }
    console.log(`[TRACE ${traceId}] analyzeResume complete. Payload size: ${JSON.stringify(analysis).length} bytes`);
    res.status(200).json({ analysis });
  } catch (err) {
    handleQueueError(err, res, next);
  }
};

const analyzeSkillGap = async (req, res, next) => {
  try {
    const { currentSkills, targetRole } = req.body;
    const traceId = uuidv4();
    console.log(`\n[TRACE ${traceId}] analyzeSkillGap started for role: ${targetRole}`);

    if (!currentSkills || !targetRole) {
      return res.status(400).json({ error: 'Please provide current skills and target role.' });
    }

    const safeSkills = PromptTelemetry.enforceBudget(currentSkills, 15000);

    const analysis = await enqueueAIJob('skill-gap', async (queueWaitTime) => {
      const start = performance.now();
      try {
        const { analyzeUniversalSkillGap: runSkillGapEngine } = require('../services/universalSkillRadarEngine');
        const result = runSkillGapEngine(safeSkills, targetRole);
        
        PromptTelemetry.logRequest({
          route: 'skill-gap',
          model: 'universal-market-engine',
          promptChars: safeSkills.length + 1000,
          queueWaitTime,
          groqLatency: performance.now() - start,
          totalLatency: performance.now() - start,
          success: true
        });
        return result;
      } catch (err) {
        console.error(`[TRACE ${traceId}] [FALLBACK TRIGGERED] analyzeSkillGap failed:`, err.message);
        PromptTelemetry.logRequest({
          route: 'skill-gap',
          model: 'universal-market-engine',
          promptChars: safeSkills.length + 1000,
          queueWaitTime,
          groqLatency: performance.now() - start,
          totalLatency: performance.now() - start,
          success: false,
          fallbackUsed: true,
          errorMsg: err.message
        });
        return FallbackAIService.getFallbackSkillGap(safeSkills, targetRole).data;
      }
    });
    console.log(`[TRACE ${traceId}] analyzeSkillGap complete. Overall Readiness: ${analysis.overallReadiness}%`);
    res.status(200).json({ radar: analysis });
  } catch (err) {
    handleQueueError(err, res, next);
  }
};

const analyzeJDMatch = async (req, res, next) => {
  try {
    const { resumeText, jobDescription } = req.body;
    if (!resumeText || !jobDescription) {
      return res.status(400).json({ error: 'Please provide resume text and job description.' });
    }

    const analysis = await enqueueAIJob('jd-match', async (queueWaitTime) => {
      const start = performance.now();
      try {
        const result = await jdMatchService.analyzeJobMatch(resumeText, jobDescription);
        PromptTelemetry.logRequest({
          route: 'jd-match',
          model: 'llama-3.3-70b-versatile',
          promptChars: resumeText.length + jobDescription.length,
          queueWaitTime,
          groqLatency: performance.now() - start,
          totalLatency: performance.now() - start,
          success: true
        });
        return result;
      } catch (err) {
        PromptTelemetry.logRequest({
          route: 'jd-match',
          model: 'llama-3.3-70b-versatile',
          promptChars: resumeText.length + jobDescription.length,
          queueWaitTime,
          groqLatency: performance.now() - start,
          totalLatency: performance.now() - start,
          success: false,
          fallbackUsed: true,
          errorMsg: err.message
        });
        return {
          matchScore: 50, winProbability: "Moderate", strengths: [], missingSkills: [], recommendations: []
        };
      }
    });

    // P19: Save JD Match Evaluation History
    await EvaluationHistory.create({
      user: req.user.id,
      type: 'jdmatch',
      score: analysis.matchScore || 50,
      breakdown: analysis.breakdown || {},
      weaknesses: analysis.gaps || [],
      penalties: analysis.appliedPenalties?.map(p => p.message || p.id) || []
    });

    res.status(200).json(analysis);
  } catch (err) {
    handleQueueError(err, res, next);
  }
};

const tailorResume = async (req, res, next) => {
  try {
    const { resumeText, jobDescription } = req.body;
    if (!resumeText || !jobDescription) {
      return res.status(400).json({ error: 'Please provide resume text and job description.' });
    }

    const analysis = await enqueueAIJob('resume-tailor', async (queueWaitTime) => {
      const start = performance.now();
      try {
        const result = await resumeTailorService.tailorResume(resumeText, jobDescription);
        PromptTelemetry.logRequest({
          route: 'resume-tailor',
          model: 'llama-3.3-70b-versatile',
          promptChars: resumeText.length + jobDescription.length,
          queueWaitTime,
          groqLatency: performance.now() - start,
          totalLatency: performance.now() - start,
          success: true
        });
        return result;
      } catch (err) {
        PromptTelemetry.logRequest({
          route: 'resume-tailor',
          model: 'llama-3.3-70b-versatile',
          promptChars: resumeText.length + jobDescription.length,
          queueWaitTime,
          groqLatency: performance.now() - start,
          totalLatency: performance.now() - start,
          success: false,
          fallbackUsed: true,
          errorMsg: err.message
        });
        return {
          keywordScore: 50, foundKeywords: [], missingKeywords: [], bulletImprovements: [], recommendations: []
        };
      }
    });

    res.status(200).json(analysis);
  } catch (err) {
    handleQueueError(err, res, next);
  }
};

module.exports = { generateInsight, extractResume, extractSkills, analyzeResume, analyzeSkillGap, analyzeJDMatch, tailorResume, parseSafeJSON };

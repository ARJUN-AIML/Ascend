const Groq = require('groq-sdk');
const { enqueueAIJob } = require('./aiQueue');
const PromptTelemetry = require('../utils/promptTelemetry');
const DailyMission = require('../models/DailyMission');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || 'dummy_key' });

function parseSafeJSON(text, fallback = {}) {
  try {
    const match = text.match(/[\{\[][\s\S]*[\}\]]/);
    if (!match) throw new Error('No JSON structure found');
    return JSON.parse(match[0]);
  } catch (err) {
    return fallback;
  }
}

const generateMissions = async (userId, userContext = {}) => {
  // Check if we already generated missions for today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const existingMissions = await DailyMission.find({
    user: userId,
    createdAt: { $gte: today }
  });

  if (existingMissions.length >= 3) {
    return existingMissions.slice(0, 3);
  }

  // We need to generate up to 3 missions to fill today's quota
  const needed = 3 - existingMissions.length;

  const prompt = `You are the Ascend AI Career Copilot.
Generate exactly ${needed} daily action missions for a software engineering candidate.
The missions should be highly specific, actionable today, and take less than 60 minutes each.
Types allowed: RESUME_IMPROVEMENT, SKILL_BUILDING, JOB_APPLICATION, INTERVIEW_PREP.
Context:
Resume Score: ${userContext.resumeScore || 50}
Career Score: ${userContext.careerScore || 50}

Output strictly as a JSON array of objects:
[
  {
    "title": "Short action title",
    "description": "Specific instruction on what to do.",
    "type": "ONE_OF_ALLOWED_TYPES",
    "impactScore": <number between 1 and 10>,
    "estimatedMinutes": <number between 10 and 60>
  }
]`;

  const safePrompt = PromptTelemetry.enforceBudget(prompt, 2000);

  const newMissionData = await enqueueAIJob('generate-missions', async (queueWaitTime) => {
    const start = performance.now();
    try {
      const chatCompletion = await groq.chat.completions.create({
        messages: [{ role: "user", content: safePrompt }],
        model: "llama-3.3-70b-versatile",
        temperature: 0.7,
        response_format: { type: "json_object" } // Using json_object might require the prompt to ask for an object containing the array
      });
      // Fallback object wrapper if the model returns an array directly despite json_object
      let rawText = chatCompletion.choices[0]?.message?.content || "{}";
      if (!rawText.includes('"missions"')) {
         // Some models fail to return an object if asked for array. Let's fix the prompt or parse carefully
         // To be safe, parseSafeJSON handles both array and object.
      }
      let parsed = parseSafeJSON(rawText, []);
      if (parsed.missions) parsed = parsed.missions; // Unwrap if it wrapped it

      if (!Array.isArray(parsed)) {
        parsed = [parsed];
      }

      PromptTelemetry.logRequest({
        route: 'generate-missions',
        model: 'llama-3.3-70b-versatile',
        promptChars: safePrompt.length,
        queueWaitTime,
        groqLatency: performance.now() - start,
        totalLatency: performance.now() - start,
        success: true
      });
      return parsed.slice(0, needed);
    } catch (err) {
      PromptTelemetry.logRequest({
        route: 'generate-missions',
        model: 'llama-3.3-70b-versatile',
        promptChars: safePrompt.length,
        queueWaitTime,
        groqLatency: performance.now() - start,
        totalLatency: performance.now() - start,
        success: false,
        fallbackUsed: true,
        errorMsg: err.message
      });
      return [
        {
          title: "Add metrics to a recent project",
          description: "Review your latest project bullet points and add quantified results (e.g. improved speed by 20%).",
          type: "RESUME_IMPROVEMENT",
          impactScore: 6,
          estimatedMinutes: 15
        },
        {
          title: "Complete 1 LeetCode Easy",
          description: "Focus on Arrays or HashMaps to keep problem-solving skills sharp.",
          type: "INTERVIEW_PREP",
          impactScore: 4,
          estimatedMinutes: 30
        }
      ].slice(0, needed);
    }
  });

  const missionsToSave = newMissionData.map(m => ({
    user: userId,
    title: m.title || 'Action Task',
    description: m.description || 'Complete this task to improve your profile.',
    type: ['RESUME_IMPROVEMENT', 'SKILL_BUILDING', 'JOB_APPLICATION', 'INTERVIEW_PREP'].includes(m.type) ? m.type : 'GENERIC',
    impactScore: m.impactScore || 5,
    estimatedMinutes: m.estimatedMinutes || 30,
    status: 'TODO'
  }));

  const inserted = await DailyMission.insertMany(missionsToSave);
  return [...existingMissions, ...inserted];
};

module.exports = { generateMissions };

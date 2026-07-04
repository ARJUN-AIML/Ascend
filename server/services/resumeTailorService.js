const Groq = require('groq-sdk');
const PromptTelemetry = require('../utils/promptTelemetry');
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

const tailorResume = async (resumeText, jobDescription) => {
  const safeResume = PromptTelemetry.enforceBudget(resumeText, 15000);
  const safeJD = PromptTelemetry.enforceBudget(jobDescription, 10000);

  const prompt = `You are an expert AI Resume Writer for Ascend. Analyze the provided Resume against the Job Description.

Resume:
${safeResume}

Job Description:
${safeJD}

Output exactly this JSON format:
{
  "keywordScore": 82,
  "foundKeywords": ["React", "Node.js", "API"],
  "missingKeywords": ["Docker", "Kubernetes"],
  "bulletImprovements": [
    {
      "original": "Built a backend system",
      "improved": "Architected a scalable Node.js backend system, improving API response time by 40%"
    }
  ],
  "recommendations": [
    "Move the skills section to the top",
    "Add more metrics to the experience section"
  ]
}

Rules:
- keywordScore is a number from 0 to 100 based on keyword overlap
- foundKeywords: up to 8 critical keywords present in both
- missingKeywords: up to 8 critical keywords in JD but missing in Resume
- bulletImprovements: exactly 3 bullets from the resume rewritten to better match the JD and sound more impactful. Must include "original" and "improved" keys.
- recommendations: exactly 3 structural or content recommendations
`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.2,
      response_format: { type: "json_object" }
    });

    return parseSafeJSON(chatCompletion.choices[0]?.message?.content || "{}", {
      keywordScore: 50,
      foundKeywords: ["General skills"],
      missingKeywords: ["Needs specific analysis"],
      bulletImprovements: [],
      recommendations: ["Review JD carefully", "Tailor resume bullets", "Highlight relevant projects"]
    });
  } catch (err) {
    throw err;
  }
};

module.exports = { tailorResume };

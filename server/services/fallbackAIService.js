/**
 * Fallback engine for graceful AI degradation when LLM is unavailable.
 */

class FallbackAIService {
  
  static getFallbackResume(resumeText, roleTitle) {
    // Purely deterministic ATS engine fallback
    console.log('[FALLBACK_ENGINE] Generating deterministic Resume analysis.');
    
    // Simple deterministic checks
    const wordCount = resumeText.split(/\s+/).length;
    const hasEducation = /bachelor|master|phd|degree|university|college/i.test(resumeText);
    const hasExperience = /experience|work|employment|job/i.test(resumeText);
    const hasContact = /email|phone|linkedin|github/i.test(resumeText);
    
    // Basic score out of 100
    let score = 50;
    if (wordCount > 300 && wordCount < 1000) score += 20;
    if (hasEducation) score += 10;
    if (hasExperience) score += 10;
    if (hasContact) score += 10;
    
    return {
      partial: true,
      source: "fallback-engine",
      message: "LLM unavailable. Returning deterministic analysis.",
      data: {
        resumeQualityScore: score,
        jdQualityScore: 0, // No JD provided or simple match
        resumeSkills: ["Deterministic extraction unavailable"],
        jdSkills: [],
        skillEvidenceMap: {},
        atsOptimization: [
          hasContact ? "Contact info detected." : "Missing contact info.",
          hasEducation ? "Education section detected." : "Missing education section.",
          hasExperience ? "Experience section detected." : "Missing experience section.",
        ],
        marketContext: "Standard tech industry resume baseline applied.",
        impactAnalysis: "Impact analysis unavailable without LLM."
      }
    };
  }

  static getFallbackSkillGap(currentSkills, targetRole) {
    console.log('[FALLBACK_ENGINE] Generating deterministic Skill Gap analysis.');
    
    return {
      partial: true,
      source: "fallback-engine",
      message: "LLM unavailable. Returning deterministic analysis.",
      data: {
        readinessScore: 60, // Safe default
        matchedSkills: currentSkills.split(',').map(s => s.trim()),
        missingSkills: ["Core algorithms", "System Design", "Cloud Infrastructure"],
        strengths: ["Listed current skills"],
        weaknesses: ["Missing deep role-specific tech stack analysis"],
        actionPlan: [
          {
            step: "Master Fundamentals",
            description: `Review fundamental concepts for ${targetRole}`,
            timeframe: "Week 1-2"
          },
          {
            step: "Build Projects",
            description: "Apply your current skills to a realistic project.",
            timeframe: "Week 3-4"
          }
        ]
      }
    };
  }

  static getFallbackInsights() {
    console.log('[FALLBACK_ENGINE] Generating deterministic Insights.');
    
    return {
      partial: true,
      source: "fallback-engine",
      message: "LLM unavailable. Returning deterministic insights.",
      data: {
        insight: "Focus on applying consistently and tailoring your resume to specific job descriptions.",
        nextSteps: ["Update your resume", "Complete one mock interview", "Apply to 5 roles"]
      }
    };
  }
}

module.exports = FallbackAIService;

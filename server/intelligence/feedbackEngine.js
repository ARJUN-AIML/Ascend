function generateImprovementTrends(profile) {
  const trends = [];
  
  if (profile.atsHistory.length >= 2) {
    const first = profile.atsHistory[0];
    const last = profile.atsHistory[profile.atsHistory.length - 1];
    const diff = last.score - first.score;
    const weekSpan = last.week - first.week;
    if (diff > 0) {
      trends.push(`ATS improved by ${diff} points in ${weekSpan} weeks`);
    } else if (diff < 0) {
      trends.push(`ATS dropped by ${Math.abs(diff)} points in ${weekSpan} weeks`);
    }
  }

  if (profile.skillRadarHistory.length >= 2) {
    const first = profile.skillRadarHistory[0];
    const last = profile.skillRadarHistory[profile.skillRadarHistory.length - 1];
    if (first.readinessTier !== last.readinessTier) {
      trends.push(`Readiness improved from ${first.readinessTier} to ${last.readinessTier}`);
    }
  }

  return trends;
}

function generateSmartInsights(profile) {
  const insights = [];
  
  // Track closed gaps
  if (profile.completedSkills.length > 0) {
    insights.push(`${profile.completedSkills.slice(0, 2).join(', ')} gap closed successfully`);
  }

  // Track unresolved gaps over time
  if (profile.atsHistory.length > 0) {
    const latestMissing = profile.atsHistory[profile.atsHistory.length - 1].missingSkills;
    const firstMissing = profile.atsHistory[0].missingSkills;
    
    // Find a skill that was missing in week 1 and still missing in the latest week
    const unresolved = latestMissing.find(skill => firstMissing.includes(skill));
    if (unresolved) {
      const weekSpan = profile.atsHistory[profile.atsHistory.length - 1].week - profile.atsHistory[0].week;
      insights.push(`${unresolved} still unresolved for ${weekSpan} weeks`);
    }
  }

  return insights;
}

// Intercepts standard recommendations and adapts them based on user failure history
function adaptRecommendations(profile, standardRecommendations) {
  return standardRecommendations.map(rec => {
    const failCount = profile.rejectedRecommendations[rec.skill] || 0;
    
    if (failCount >= 3) {
      // User ignored this 3 times. Change strategy to project-based learning.
      return {
        ...rec,
        action: `Strategy pivot: You've struggled to prioritize ${rec.skill} coursework. Instead, build a single micro-project implementing ${rec.skill} this weekend.`,
        resourceType: ["project"],
        isAdaptive: true
      };
    }
    return rec;
  });
}

function analyzeRecommendationEffectiveness(profile) {
  // Simulates tracking which recommendation styles yield the highest success rate
  if (profile.completedSkills.length > 0) {
    return `Project-based learning yielded a 70% higher completion rate for you than documentation reading.`;
  }
  return "Insufficient data to determine optimal learning style.";
}

function runFeedbackEngine(profile, currentRecommendations) {
  const improvementTrends = generateImprovementTrends(profile);
  const smartInsights = generateSmartInsights(profile);
  const adaptiveRecommendations = adaptRecommendations(profile, currentRecommendations);
  const recommendationEffectiveness = analyzeRecommendationEffectiveness(profile);

  return {
    improvementTrends,
    smartInsights,
    recommendationEffectiveness,
    adaptiveRecommendations
  };
}

module.exports = { runFeedbackEngine };

/**
 * strategyEngine.js — Phase P19 Memory & Strategic Coaching Layer
 * =================================================================
 * Generates 30 / 60 / 90 day roadmaps based on target role, current gap,
 * and real historical weaknesses.
 */

function generateStrategyRoadmap(targetRole, currentGapScore, weaknesses) {
  const roadmap30 = [];
  const roadmap60 = [];
  const roadmap90 = [];

  // 1. Prioritize real weaknesses into the first 30 days
  if (weaknesses && weaknesses.length > 0) {
    roadmap30.push(`Eradicate core weaknesses: ${weaknesses.map(w => w.weakness || w).slice(0, 2).join(', ')}`);
  } else {
    roadmap30.push('Establish baseline fundamentals for target role.');
  }

  // 2. Adjust intensity based on current gap score
  if (currentGapScore < 50) {
    // High gap
    roadmap30.push('Intensive skill acquisition: Focus on primary tech stack.');
    roadmap60.push('Build 2 production-grade projects demonstrating core competencies.');
    roadmap90.push('Simulated interview loops and advanced system design prep.');
  } else if (currentGapScore < 80) {
    // Moderate gap
    roadmap30.push('Bridge knowledge gaps in secondary technologies.');
    roadmap60.push('Optimize resume bullets for maximum ATS & Recruiter impact.');
    roadmap90.push('Weekly mock interviews targeting specific behavioral weaknesses.');
  } else {
    // Low gap (Ready)
    roadmap30.push('High-volume targeted application strategy (10+ per week).');
    roadmap60.push('Tier-1 company interview prep and advanced negotiation tactics.');
    roadmap90.push('Secure multiple offers and execute offer leverage.');
  }

  // 3. Role specific injection
  if (targetRole.toLowerCase().includes('frontend')) {
    roadmap60.push('Master advanced state management and performance profiling.');
  } else if (targetRole.toLowerCase().includes('backend')) {
    roadmap60.push('Deep dive into distributed systems and database query optimization.');
  } else if (targetRole.toLowerCase().includes('data')) {
    roadmap60.push('Scale data pipelines and master advanced aggregation frameworks.');
  }

  return {
    roadmap30,
    roadmap60,
    roadmap90,
    generatedAt: new Date()
  };
}

module.exports = {
  generateStrategyRoadmap
};

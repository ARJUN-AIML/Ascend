const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || 'dummy_key' });
const { resolveRole } = require('../intelligence/roleResolver');
const { roles } = require('../intelligence/roleKnowledgeBase');
const { normalizeSkill, getSkillPrerequisites } = require('../intelligence/skillOntology');

function safeJsonParse(text) {
  try {
    const jsonStr = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
    return JSON.parse(jsonStr);
  } catch (e) {
    return null;
  }
}

// Blocker 1: Confidence Engine Upgrade
function calculateRadarConfidence(roleConfidence, extractionData, rawExtractedCount, normalizedCount) {
  const extractionQuality = Math.max(20, Math.min(100, Math.round((rawExtractedCount / 10) * 100)));
  const ontologyCoverage = rawExtractedCount > 0 ? Math.round((normalizedCount / rawExtractedCount) * 100) : 50;
  
  // inputDepth: How much meaningful input user provided
  const inputDepth = Math.max(10, Math.min(100, rawExtractedCount * 10)); // 10 skills = 100
  
  // evidenceDensity: Mention vs projects vs quantified impact (simulated off extractionData)
  let evidenceDensity = 50; // default
  if (extractionData && extractionData.skillEvidenceMap) {
    const values = Object.values(extractionData.skillEvidenceMap);
    if (values.length > 0) {
       const avgTier = values.reduce((a,b)=>a+b, 0) / values.length;
       evidenceDensity = Math.round((avgTier / 3) * 100);
    }
  }

  const breakdown = {
    roleDetection: roleConfidence,
    extractionQuality: extractionQuality,
    ontologyCoverage: ontologyCoverage,
    inputDepth: inputDepth,
    evidenceDensity: evidenceDensity
  };
  
  const finalConfidence = Math.round(
    (breakdown.roleDetection * 0.2) +
    (breakdown.extractionQuality * 0.2) +
    (breakdown.ontologyCoverage * 0.2) +
    (breakdown.inputDepth * 0.2) +
    (breakdown.evidenceDensity * 0.2)
  );

  return { finalConfidence, breakdown };
}

// Blocker 3: Stricter Roadmap Dependency Refinement
function generateStricterRoadmap(missingCritical, missingImportant) {
  const allMissing = [...missingCritical, ...missingImportant];
  const roadmap = [];
  if (allMissing.length === 0) return roadmap;

  // Stricter predefined groupings logic based on typical data science / swe flows
  const phase1 = []; // Core langs / fundamentals
  const phase2 = []; // Data processing / SQL
  const phase3 = []; // Basic frameworks / ML
  const phase4 = []; // Advanced frameworks / Deep Learning
  const phase5 = []; // Deployment / DevOps

  const langRegex = /python|javascript|typescript|java|c\+\+|html|css/i;
  const dataRegex = /pandas|sql|numpy|statistics/i;
  const mlRegex = /machine learning|scikit-learn/i;
  const dlRegex = /deep learning|tensorflow|pytorch/i;
  const deployRegex = /docker|mlops|model deployment|kubernetes|aws/i;

  for (let skill of allMissing) {
    if (langRegex.test(skill) || skill === 'dom') phase1.push(skill);
    else if (dataRegex.test(skill)) phase2.push(skill);
    else if (mlRegex.test(skill) || skill === 'react') phase3.push(skill);
    else if (dlRegex.test(skill) || skill === 'redux' || skill === 'state management') phase4.push(skill);
    else if (deployRegex.test(skill) || skill === 'webpack' || skill === 'performance optimization') phase5.push(skill);
    else phase3.push(skill); // default mid-tier
  }

  let phaseCounter = 1;
  const addPhase = (skills, title, time) => {
    if (skills.length > 0) {
      roadmap.push({
        phase: phaseCounter++,
        title: title,
        skillsCovered: skills,
        estimatedTime: time,
        deliverables: `Master concepts in ${skills.join(', ')}`
      });
    }
  };

  addPhase(phase1, "Fundamentals & Languages", `${phase1.length * 2} Weeks`);
  addPhase(phase2, "Data Processing & Foundation", `${phase2.length * 2} Weeks`);
  addPhase(phase3, "Core Frameworks & Tools", `${phase3.length * 3} Weeks`);
  addPhase(phase4, "Advanced Frameworks", `${phase4.length * 3} Weeks`);
  addPhase(phase5, "Deployment & Operations", `${phase5.length * 2} Weeks`);

  return roadmap;
}

// Blocker 4: Project Engine (Phase 3.5 + Phase 4 Refinement)
function generateProjects(canonicalRole, readinessTier) {
  const allProjects = [];
  
  if (canonicalRole === "Machine Learning Engineer" || canonicalRole === "Data Scientist") {
    allProjects.push(
      { title: "Exploratory Data Analysis Script", difficulty: "Beginner", skillsUsed: ["python", "pandas"], estimatedTime: "1 Week" },
      { title: "House Price Prediction Pipeline", difficulty: "Beginner", skillsUsed: ["python", "pandas", "scikit-learn"], estimatedTime: "1-2 Weeks" },
      { title: "Resume Classifier API", difficulty: "Intermediate", skillsUsed: ["python", "nlp", "fastapi"], estimatedTime: "2-3 Weeks" },
      { title: "Customer Churn Prediction Model", difficulty: "Intermediate", skillsUsed: ["python", "machine learning", "sql"], estimatedTime: "2-3 Weeks" },
      { title: "End-to-end Model Deployment", difficulty: "Advanced", skillsUsed: ["tensorflow", "docker", "mlops"], estimatedTime: "3-4 Weeks" },
      { title: "Large-scale Distributed Training", difficulty: "Production-grade", skillsUsed: ["pytorch", "kubernetes", "aws"], estimatedTime: "4+ Weeks" }
    );
  } else if (canonicalRole === "Frontend Engineer") {
    allProjects.push(
      { title: "Static Landing Page", difficulty: "Beginner", skillsUsed: ["html", "css", "javascript"], estimatedTime: "1 Week" },
      { title: "Portfolio Dashboard", difficulty: "Beginner", skillsUsed: ["html", "css", "javascript"], estimatedTime: "1-2 Weeks" },
      { title: "Realtime Chat App", difficulty: "Intermediate", skillsUsed: ["react", "state management", "websockets"], estimatedTime: "2-3 Weeks" },
      { title: "Interactive E-commerce Catalog", difficulty: "Intermediate", skillsUsed: ["react", "redux", "performance optimization"], estimatedTime: "2-3 Weeks" },
      { title: "High-Performance E-commerce UI", difficulty: "Advanced", skillsUsed: ["react", "performance optimization", "webpack"], estimatedTime: "3-4 Weeks" },
      { title: "Micro-frontend Architecture", difficulty: "Production-grade", skillsUsed: ["react", "webpack", "ci/cd"], estimatedTime: "4+ Weeks" }
    );
  } else {
    allProjects.push(
      { title: "Simple REST API", difficulty: "Beginner", skillsUsed: ["node.js", "express"], estimatedTime: "1 Week" },
      { title: "CRUD API Service", difficulty: "Beginner", skillsUsed: ["node.js", "sql"], estimatedTime: "1-2 Weeks" },
      { title: "Authentication Microservice", difficulty: "Intermediate", skillsUsed: ["node.js", "jwt", "postgresql"], estimatedTime: "2-3 Weeks" },
      { title: "Microservices Deployment", difficulty: "Advanced", skillsUsed: ["docker", "api design", "system design"], estimatedTime: "3-4 Weeks" },
      { title: "High-throughput Streaming Pipeline", difficulty: "Production-grade", skillsUsed: ["kafka", "redis", "kubernetes"], estimatedTime: "4+ Weeks" }
    );
  }
  
  // Project Gating based on Readiness Tier
  const filteredProjects = [];
  
  if (readinessTier === "Beginner") {
    filteredProjects.push(...allProjects.filter(p => p.difficulty === "Beginner"));
    filteredProjects.push(...allProjects.filter(p => p.difficulty === "Intermediate").slice(0, 1));
  } else if (readinessTier === "Internship Ready") {
    filteredProjects.push(...allProjects.filter(p => p.difficulty === "Beginner"));
    filteredProjects.push(...allProjects.filter(p => p.difficulty === "Intermediate"));
  } else if (readinessTier === "Junior Ready") {
    filteredProjects.push(...allProjects.filter(p => p.difficulty === "Intermediate"));
    filteredProjects.push(...allProjects.filter(p => p.difficulty === "Advanced"));
  } else {
    // Mid Ready or Strong Candidate
    filteredProjects.push(...allProjects.filter(p => p.difficulty === "Advanced"));
    filteredProjects.push(...allProjects.filter(p => p.difficulty === "Production-grade"));
  }
  
  return filteredProjects.slice(0, 4); // return top 4 matches
}

// Deterministic intelligence generator
function generateIntelligence(matchedCritical, missingCritical) {
  const strengths = [];
  const weaknesses = [];
  
  if (matchedCritical.length >= 2) {
    strengths.push(`Strong foundation established (evidence: ${matchedCritical.slice(0, 2).join(', ')} verified)`);
  } else if (matchedCritical.length === 1) {
    strengths.push(`Baseline familiarity detected (evidence: ${matchedCritical[0]} verified)`);
  }

  if (missingCritical.length > 0) {
    weaknesses.push(`Missing critical role requirements (evidence: lacking ${missingCritical.slice(0, 3).join(', ')})`);
  }
  
  return { strengths, weaknesses };
}

// Blocker 2: Readiness Interpretation
function getReadinessTier(score) {
  if (score < 25) return "Beginner";
  if (score < 45) return "Internship Ready";
  if (score < 70) return "Junior Ready";
  if (score < 85) return "Mid Ready";
  return "Strong Candidate";
}

const analyzeSkillGap = async (currentSkillsText, roleTitle, forceExtractionObj = null) => {
  console.log(`[skillAnalysisService] Starting Phase 3.5 Radar Rewrite for ${roleTitle}`);

  // 1. Role Detection
  const roleResolution = resolveRole(roleTitle);
  const canonicalRole = roleResolution.canonicalRole;
  const roleDef = roles[canonicalRole] || { critical: [], important: [], categoryMapping: {}, hardCaps: {} };

  // 2. Skill Extraction
  let extractionData = forceExtractionObj;
  if (!extractionData) {
    const skills = currentSkillsText.split(',').map(s => s.trim());
    extractionData = { extractedSkills: skills, softSkills: [], skillEvidenceMap: {} };
  }

  // 3. Skill Normalization
  const normExtracted = [...new Set(extractionData.extractedSkills.map(s => normalizeSkill(s)).filter(Boolean))];
  const softSkills = (extractionData.softSkills || []).filter(Boolean);

  // 4. Deterministic Scoring & Missing Full Diff
  const missingCritical = [];
  const matchedCritical = [];
  for (let req of roleDef.critical) {
    if (!normExtracted.includes(req)) missingCritical.push(req);
    else matchedCritical.push(req);
  }

  const missingImportant = [];
  for (let req of roleDef.important || []) {
    if (!normExtracted.includes(req)) missingImportant.push(req);
  }

  let readinessScore = 100;
  readinessScore -= (missingCritical.length * 10);
  readinessScore -= (missingImportant.length * 5);
  
  // Readiness Score Hard Caps
  if (roleDef.hardCaps) {
    let missingCriticalCount = missingCritical.length;
    if (missingCriticalCount >= 5 && readinessScore > roleDef.hardCaps[5]) {
      readinessScore = roleDef.hardCaps[5];
    } else if (missingCriticalCount >= 3 && readinessScore > roleDef.hardCaps[3]) {
      readinessScore = roleDef.hardCaps[3];
    }
  }
  if (readinessScore < 10) readinessScore = 10;
  if (readinessScore > 100) readinessScore = 100;

  // Blocker 2: Readiness Tier
  const readinessTier = getReadinessTier(readinessScore);

  // Role-Specific Category Scoring
  const categoryScores = {};
  const radarData = [];
  for (const [category, weight] of Object.entries(roleDef.categoryMapping)) {
    let catScore = 0;
    if (category === "Soft Skills" && softSkills.length === 0) {
      catScore = 0;
    } else {
      catScore = Math.max(0, Math.round(readinessScore * weight * 3));
      if (catScore > 100) catScore = 100;
      if (catScore < 20 && missingCritical.length < 5) catScore = 40;
    }
    categoryScores[category] = catScore;
    radarData.push({ subject: category, A: catScore, B: 90, fullMark: 100 });
  }

  // Blocker 3: Better Roadmap Engine
  const roadmap = generateStricterRoadmap(missingCritical, missingImportant);

  // Blocker 4: Project Engine
  const projects = generateProjects(canonicalRole, readinessTier);

  const intelligence = generateIntelligence(matchedCritical, missingCritical);

  // Blocker 1: Confidence upgrade
  const rawCount = extractionData.extractedSkills.length;
  const conf = calculateRadarConfidence(roleResolution.confidence, extractionData, rawCount, normExtracted.length);

  // Final JSON Output Schema
  return {
    readinessScore,
    readinessTier,
    confidenceScore: conf.finalConfidence,
    confidenceBreakdown: conf.breakdown,
    categoryScores,
    missingCriticalSkills: missingCritical,
    missingImportantSkills: missingImportant,
    strengths: intelligence.strengths,
    weaknesses: intelligence.weaknesses,
    roadmap,
    recommendedProjects: projects,
    estimatedTimeline: `${(missingCritical.length + missingImportant.length) * 2} Weeks`,
    radarData
  };
};

module.exports = { analyzeSkillGap };

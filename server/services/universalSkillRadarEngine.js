const { masterRoleDatabase } = require('../intelligence/masterRoleDatabase');
const { marketIntelligenceDataset } = require('../intelligence/marketIntelligenceDataset');
const { resolveRoleAndSeniority } = require('../intelligence/universalRoleResolver');

const normalizeSkill = (skill) => {
  const s = skill.toLowerCase().trim();
  const map = {
    "js": "javascript", "mongo": "mongodb", "containers": "docker",
    "containerization": "docker", "pub-sub": "event driven architecture",
    "aws ec2": "aws", "aws s3": "aws", "react.js": "react",
    "node.js": "nodejs", "node": "nodejs", "postgres": "postgresql",
    "k8s": "kubernetes", "vue": "vuejs", "ts": "typescript", "next.js": "nextjs"
  };
  return map[s] || s;
};

const calculateCompanyTierFit = (normalizedSkills, profile, readiness) => {
  let hasInfra = normalizedSkills.includes('docker') || normalizedSkills.includes('aws') || normalizedSkills.includes('kubernetes');
  let hasSystemDesign = normalizedSkills.includes('system design') || normalizedSkills.includes('microservices') || normalizedSkills.includes('kafka');
  let hasTesting = normalizedSkills.includes('jest') || normalizedSkills.includes('cypress') || normalizedSkills.includes('pytest');
  
  let startup = Math.min(100, Math.round(readiness * 1.1 + (hasInfra ? 15 : 0)));
  let service = Math.min(100, Math.round(readiness * 1.0));
  let product = Math.min(100, Math.round(readiness * 0.9 + (hasTesting ? 15 : 0)));
  let faang = Math.min(100, Math.round(readiness * 0.7 + (hasSystemDesign ? 25 : 0)));
  
  // Hard penalties if readiness is too low
  if (readiness < 40) {
    startup -= 20; service -= 15; product -= 20; faang -= 30;
  }
  
  return {
    startup: Math.max(0, startup),
    service: Math.max(0, service),
    product: Math.max(0, product),
    faang: Math.max(0, faang)
  };
};

const analyzeUniversalSkillGap = (currentSkillsText, inputRole) => {
  let currentSkillsArray = [];
  if (typeof currentSkillsText === 'string') {
    currentSkillsArray = currentSkillsText.split(',').map(s => s.trim()).filter(Boolean);
  } else if (Array.isArray(currentSkillsText)) {
    currentSkillsArray = currentSkillsText;
  }

  const { canonicalRole, seniority } = resolveRoleAndSeniority(inputRole);
  const profile = masterRoleDatabase[canonicalRole];
  const marketData = marketIntelligenceDataset[canonicalRole] || { demand: "High", competition: "High", salaryRange: "N/A", hiringDifficulty: "Moderate" };
  const normalizedUserSkills = currentSkillsArray.map(normalizeSkill);
  
  let totalMatchedWeight = 0;
  let totalMaxWeight = 0;
  const categoryScores = {};
  const radarData = [];
  const deficits = [];
  let totalWeeks = 0;
  let missingCoreCount = 0;

  for (const [domainName, domainData] of Object.entries(profile.domains)) {
    const { weight: domainWeight, skills } = domainData;
    let matchedSkillWeight = 0;
    let maxSkillWeight = 0;
    let isFocusDomain = profile.seniority[seniority].focus.includes(domainName);

    for (const [skillName, skillWeight] of Object.entries(skills)) {
      maxSkillWeight += skillWeight;
      
      if (normalizedUserSkills.includes(normalizeSkill(skillName))) {
        matchedSkillWeight += skillWeight;
      } else {
        let severity = 'Optional';
        let weeks = 1;
        let impact = "+2%";

        if (isFocusDomain) {
          if (skillWeight >= 10) {
            severity = 'Critical'; weeks = 3; impact = "+15%"; missingCoreCount++;
          } else if (skillWeight >= 7) {
            severity = 'Major'; weeks = 2; impact = "+8%";
          } else {
            severity = 'Minor'; weeks = 1; impact = "+4%";
          }
        } else {
          if (skillWeight >= 10) {
            severity = 'Major'; weeks = 2; impact = "+10%";
          } else {
            severity = 'Minor'; weeks = 1; impact = "+3%";
          }
        }
        
        deficits.push({ name: skillName, importance: severity, time: `${weeks} week${weeks > 1 ? 's' : ''}`, impact });
        totalWeeks += weeks;
      }
    }

    let domainScorePct = 0;
    if (maxSkillWeight > 0) {
      domainScorePct = matchedSkillWeight / maxSkillWeight;
    }
    
    // Scale out of 100 for Radar chart
    const axisScore = Math.round(domainScorePct * 100);
    categoryScores[domainName] = axisScore;
    radarData.push({ subject: domainName, A: axisScore, B: profile.seniority[seniority].requiredWeight, fullMark: 100 });
    
    totalMatchedWeight += (domainScorePct * domainWeight);
    totalMaxWeight += domainWeight;
  }

  // Baseline Readiness
  let overallReadiness = 0;
  if (totalMaxWeight > 0) {
    overallReadiness = (totalMatchedWeight / totalMaxWeight) * 100;
  }

  // Seniority Target
  const targetReadiness = profile.seniority[seniority].requiredWeight;
  
  // Penalty Engine
  let confidence = "Low";
  const skillCount = normalizedUserSkills.length;
  if (skillCount >= 10 && missingCoreCount === 0) confidence = "High";
  else if (skillCount >= 5 && missingCoreCount <= 2) confidence = "Medium";
  
  if (skillCount > 20 && missingCoreCount >= 3) {
    overallReadiness -= 15; // Buzzword inflation penalty
    confidence = "Low";
  }
  
  if (overallReadiness < 10) overallReadiness = 10;
  if (overallReadiness > 100) overallReadiness = 100;
  overallReadiness = Math.round(overallReadiness);

  // Market Fit Engine
  let marketFitScore = overallReadiness;
  if (marketData.competition === "Extreme") marketFitScore -= 10;
  else if (marketData.competition === "Low") marketFitScore += 10;
  if (marketData.demand === "Extreme") marketFitScore += 10;
  marketFitScore = Math.min(100, Math.max(10, Math.round(marketFitScore)));

  // Roadmap Generator
  uniqueDeficits = Array.from(new Set(deficits.map(a => a.name)))
    .map(name => deficits.find(a => a.name === name));
  
  uniqueDeficits.sort((a, b) => {
    const map = { 'Critical': 1, 'Major': 2, 'Minor': 3, 'Optional': 4 };
    return map[a.importance] - map[b.importance];
  });

  const criticalDeficits = uniqueDeficits.filter(d => d.importance === 'Critical');
  const majorDeficits = uniqueDeficits.filter(d => d.importance === 'Major');
  const minorDeficits = uniqueDeficits.filter(d => d.importance === 'Minor');

  let phaseCounter = 1;
  const roadmap = [];
  if (criticalDeficits.length > 0) {
    roadmap.push({
      phase: phaseCounter++,
      estimatedTime: `${criticalDeficits.reduce((sum, d) => sum + parseInt(d.time), 0)} Weeks`,
      title: 'Core Fundamentals & Critical Gaps',
      skillsCovered: criticalDeficits.map(d => d.name),
      deliverables: `Master core concepts in ${criticalDeficits.map(d => d.name).join(', ')}`
    });
  }
  if (majorDeficits.length > 0) {
    roadmap.push({
      phase: phaseCounter++,
      estimatedTime: `${majorDeficits.reduce((sum, d) => sum + parseInt(d.time), 0)} Weeks`,
      title: 'Advanced Frameworks & Tooling',
      skillsCovered: majorDeficits.map(d => d.name),
      deliverables: `Implement projects using ${majorDeficits.map(d => d.name).join(', ')}`
    });
  }
  if (minorDeficits.length > 0) {
    roadmap.push({
      phase: phaseCounter++,
      estimatedTime: `${minorDeficits.reduce((sum, d) => sum + parseInt(d.time), 0)} Weeks`,
      title: 'Polishing & Edge Cases',
      skillsCovered: minorDeficits.map(d => d.name),
      deliverables: `Optimize and deploy with ${minorDeficits.map(d => d.name).join(', ')}`
    });
  }

  const companyFit = calculateCompanyTierFit(normalizedUserSkills, profile, overallReadiness);

  return {
    canonicalRole,
    seniority,
    readinessScore: overallReadiness,
    targetScore: targetReadiness,
    confidenceScore: confidence,
    marketFitScore,
    marketData,
    companyFit,
    deficits: uniqueDeficits,
    roadmap,
    estimatedTimeline: `${totalWeeks} Weeks`,
    radarData
  };
};

module.exports = { analyzeUniversalSkillGap };

const { resolveRoleAlias } = require('../intelligence/skillRadarRoleResolver');
const { roleProfiles } = require('../intelligence/skillRadarRoleProfiles');
const { calculatePenaltiesAndConfidence } = require('./skillRadarPenaltyEngine');

const normalizeSkill = (skill) => {
  const s = skill.toLowerCase().trim();
  const map = {
    "js": "javascript",
    "mongo": "mongodb",
    "containers": "docker",
    "containerization": "docker",
    "pub-sub": "event driven architecture",
    "aws ec2": "aws",
    "aws s3": "aws",
    "react.js": "react",
    "node.js": "nodejs",
    "node": "nodejs",
    "postgres": "postgresql",
    "k8s": "kubernetes",
    "vue": "vuejs",
    "ts": "typescript",
    "next.js": "nextjs"
  };
  return map[s] || s;
};

const analyzeSkillGap = (currentSkillsText, roleTitle) => {
  let currentSkillsArray = [];
  if (typeof currentSkillsText === 'string') {
    currentSkillsArray = currentSkillsText.split(',').map(s => s.trim()).filter(Boolean);
  } else if (Array.isArray(currentSkillsText)) {
    currentSkillsArray = currentSkillsText;
  }
  
  const canonicalRole = resolveRoleAlias(roleTitle);
  const profile = roleProfiles[canonicalRole] || roleProfiles["Full Stack MERN Developer"];
  const normalizedUserSkills = currentSkillsArray.map(normalizeSkill);
  
  let overallReadiness = 0;
  const categoryScores = {};
  const radarData = [];
  const missingCriticalSkills = [];
  const missingImportantSkills = [];
  const missingCoreNames = [];

  for (const [domainName, domainData] of Object.entries(profile)) {
    const { weight, skills } = domainData;
    let matchedSkillWeight = 0;
    let totalSkillWeight = 0;

    for (const [skillName, skillWeight] of Object.entries(skills)) {
      totalSkillWeight += skillWeight;
      if (normalizedUserSkills.includes(normalizeSkill(skillName))) {
        matchedSkillWeight += skillWeight;
      } else {
        if (skillWeight >= 8) {
          missingCriticalSkills.push(skillName);
          missingCoreNames.push(skillName);
        } else {
          missingImportantSkills.push(skillName);
        }
      }
    }

    let domainScore = 0;
    if (totalSkillWeight > 0) {
      domainScore = (matchedSkillWeight / totalSkillWeight) * weight;
    }
    
    const axisScore = Math.round((domainScore / weight) * 100);
    categoryScores[domainName] = axisScore;
    radarData.push({ subject: domainName, A: axisScore, B: 90, fullMark: 100 });
    
    overallReadiness += domainScore;
  }

  const { penaltyScore, penaltiesApplied, confidence } = calculatePenaltiesAndConfidence(
    normalizedUserSkills, 
    missingCoreNames, 
    Object.keys(profile).length * 4
  );

  overallReadiness += penaltyScore;

  if (overallReadiness < 10) overallReadiness = 10;
  if (overallReadiness > 100) overallReadiness = 100;
  overallReadiness = Math.round(overallReadiness);

  const deficits = [];
  let totalWeeks = 0;

  for (const [domainName, axisScore] of Object.entries(categoryScores)) {
    const domainProfile = profile[domainName];
    for (const [skillName, skillWeight] of Object.entries(domainProfile.skills)) {
      if (!normalizedUserSkills.includes(normalizeSkill(skillName))) {
        let severity = 'Optional';
        let weeks = 0;
        let impact = "+2%";

        if (axisScore < 40) {
          severity = 'Critical';
          weeks = 3;
          impact = "+12%";
        } else if (axisScore < 70) {
          severity = 'Major';
          weeks = 2;
          impact = "+8%";
        } else if (axisScore < 85) {
          severity = 'Minor';
          weeks = 1;
          impact = "+4%";
        }

        if (skillWeight >= 8 && severity !== 'Critical') {
          severity = 'Critical';
          weeks = 4;
          impact = "+15%";
        }

        if (severity !== 'Optional') {
          deficits.push({ name: skillName, importance: severity, time: `${weeks} week${weeks > 1 ? 's' : ''}`, impact });
          totalWeeks += weeks;
        }
      }
    }
  }
  
  const uniqueDeficits = [];
  const seen = new Set();
  for (const d of deficits) {
    if (!seen.has(d.name)) {
      seen.add(d.name);
      uniqueDeficits.push(d);
    }
  }

  uniqueDeficits.sort((a, b) => {
    const map = { 'Critical': 1, 'Major': 2, 'Minor': 3 };
    return map[a.importance] - map[b.importance];
  });

  let phaseCounter = 1;
  const roadmap = [];
  const criticalDeficits = uniqueDeficits.filter(d => d.importance === 'Critical');
  const majorDeficits = uniqueDeficits.filter(d => d.importance === 'Major');
  const minorDeficits = uniqueDeficits.filter(d => d.importance === 'Minor');

  if (criticalDeficits.length > 0) {
    roadmap.push({
      phase: phaseCounter++,
      estimatedTime: `${criticalDeficits.reduce((sum, d) => sum + parseInt(d.time), 0)} Weeks`,
      title: 'Core Foundations & Critical Gaps',
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

  const strengths = normalizedUserSkills.slice(0, 3).map(s => `Validated experience in ${s}`);
  const weaknesses = uniqueDeficits.slice(0, 3).map(d => `Missing ${d.importance.toLowerCase()} requirement: ${d.name}`);

  return {
    readinessScore: overallReadiness,
    confidenceScore: confidence,
    categoryScores,
    deficits: uniqueDeficits,
    missingCriticalSkills,
    missingImportantSkills,
    strengths,
    weaknesses,
    roadmap,
    estimatedTimeline: `${totalWeeks} Weeks`,
    radarData,
    penaltiesApplied
  };
};

module.exports = { analyzeSkillGap };

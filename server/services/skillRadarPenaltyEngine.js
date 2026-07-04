const calculatePenaltiesAndConfidence = (userSkills, missingCoreSkills, totalRoleSkillsCount) => {
  let penaltyScore = 0;
  const penaltiesApplied = [];
  
  // 1. Missing Core Skills Penalty
  if (missingCoreSkills.length > 0) {
    // Missing critical core skills apply heavy deduction
    const deduction = missingCoreSkills.length * 15; // -15 per missing core skill
    penaltyScore -= deduction;
    penaltiesApplied.push(`Missing critical core skills: ${missingCoreSkills.join(', ')} (-${deduction})`);
  }

  // 2. Skill Spam / Buzzword Stuffing
  // If user entered many skills but missed core ones
  const skillCount = userSkills.length;
  if (skillCount > 20 && missingCoreSkills.length > 0) {
    penaltyScore -= 10;
    penaltiesApplied.push(`High skill volume with missing core foundations (-10)`);
  }

  // 3. Confidence Calibration
  let confidence = "Low";
  if (skillCount >= 8) {
    confidence = "High";
  } else if (skillCount >= 4) {
    confidence = "Medium";
  }

  // If they spammed 20+ skills but missed half the core, confidence drops
  if (skillCount > 20 && missingCoreSkills.length >= 2) {
    confidence = "Low";
  }

  return { penaltyScore, penaltiesApplied, confidence };
};

module.exports = { calculatePenaltiesAndConfidence };

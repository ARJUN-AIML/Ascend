// In a real system, this would be a Mongoose schema/model.
// For our deterministic proof, this represents the profile memory structure.
class CareerIntelligenceProfile {
  constructor(userId, targetRole) {
    this.userId = userId;
    this.targetRole = targetRole;
    this.atsHistory = []; // Array of { week: number, score: number, missingSkills: [] }
    this.skillRadarHistory = []; // Array of { week: number, readinessScore: number, readinessTier: string }
    this.completedSkills = []; // Skills that were previously missing but are now matched
    this.rejectedRecommendations = {}; // { skill: failCount }
    this.acceptedRecommendations = []; 
  }

  addAtsEntry(week, score, missingSkills) {
    this.atsHistory.push({ week, score, missingSkills });
  }

  addRadarEntry(week, readinessScore, readinessTier) {
    this.skillRadarHistory.push({ week, readinessScore, readinessTier });
  }

  // Simulate marking a skill gap as closed
  closeSkillGap(skill) {
    if (!this.completedSkills.includes(skill)) {
      this.completedSkills.push(skill);
    }
  }

  // Simulate user ignoring a recommendation
  rejectRecommendation(skill) {
    this.rejectedRecommendations[skill] = (this.rejectedRecommendations[skill] || 0) + 1;
  }
}

module.exports = { CareerIntelligenceProfile };

const User = require('../models/User');
const ScoreHistory = require('../models/ScoreHistory');
const memoryEngine = require('../services/memoryEngine');
const patternIntelligence = require('../services/patternIntelligence');
const growthVelocityEngine = require('../services/growthVelocityEngine');
const strategyEngine = require('../services/strategyEngine');
const careerGapEngine = require('../services/careerGapEngine');

const completeOnboarding = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { targetRole, confirmedSkills, weeklyCommitmentHours, locationPreference, currentStatus, mainGoal } = req.body;

    user.careerProfile = {
      targetRole: targetRole || user.careerProfile.targetRole,
      currentStatus: currentStatus || user.careerProfile.currentStatus,
      mainGoal: mainGoal || user.careerProfile.mainGoal,
      confirmedSkills: confirmedSkills || user.careerProfile.confirmedSkills,
      weeklyCommitmentHours: weeklyCommitmentHours || user.careerProfile.weeklyCommitmentHours,
      locationPreference: locationPreference || user.careerProfile.locationPreference
    };
    user.onboardingStatus = 'COMPLETED';

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      onboardingStatus: updatedUser.onboardingStatus,
      careerProfile: updatedUser.careerProfile
    });
  } catch (err) {
    next(err);
  }
};

const getProgress = async (req, res, next) => {
  try {
    const history = await ScoreHistory.find({ user: req.user.id }).sort({ snapshotDate: 1 });
    res.json(history);
  } catch (err) {
    next(err);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { name, education, careerProfile, social, skills } = req.body;
    
    if (name) user.name = name;
    if (education) user.education = { ...user.education, ...education };
    if (social) user.social = { ...user.social, ...social };
    if (skills) user.skills = skills;
    if (careerProfile) {
      user.careerProfile = { ...user.careerProfile, ...careerProfile };
    }

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      education: updatedUser.education,
      careerProfile: updatedUser.careerProfile,
      social: updatedUser.social,
      skills: updatedUser.skills,
      onboardingStatus: updatedUser.onboardingStatus
    });
  } catch (err) {
    next(err);
  }
};

const getStrategy = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const targetRole = user.careerProfile?.targetRole || 'Frontend';
    const userSkills = user.skills || [];

    // 1. Fetch Memory
    const memory = await memoryEngine.analyzeMemory(req.user.id);

    // 2. Detect Patterns
    const patterns = patternIntelligence.detectPatterns(memory);

    // 3. Calculate Velocity
    const velocity = growthVelocityEngine.calculateGrowthVelocity(memory);

    // 4. Calculate Gap
    const gap = careerGapEngine.analyzeCareerGap(userSkills, targetRole);

    // 5. Generate Strategy Roadmap
    const strategy = strategyEngine.generateStrategyRoadmap(
      targetRole, 
      gap.gapScore, 
      memory.recurringWeaknesses
    );

    res.json({
      memory,
      patterns,
      velocity,
      gap,
      strategy
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  completeOnboarding,
  getProgress,
  updateProfile,
  getStrategy
};

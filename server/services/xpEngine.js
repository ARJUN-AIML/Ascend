const UserProgress = require('../models/UserProgress');

const XP_MAP = {
  'RESUME_SCAN': 40,
  'DAILY_MISSION': 20,
  'MOCK_INTERVIEW': 50,
  'SKILL_MILESTONE': 100
};

const calculateLevel = (xp) => Math.floor(Math.sqrt(xp / 25)) + 1;

const calculateRank = (level) => {
  if (level >= 20) return 'Platinum';
  if (level >= 10) return 'Gold';
  if (level >= 5) return 'Silver';
  return 'Bronze';
};

const ACHIEVEMENTS_MAP = {
  'FIRST_SCAN': { id: 'FIRST_SCAN', title: 'First Scan' },
  'FIRST_INTERVIEW': { id: 'FIRST_INTERVIEW', title: 'First Interview' },
  'TEN_MISSIONS': { id: 'TEN_MISSIONS', title: '10 Missions Complete' },
  'CAREER_GROWTH': { id: 'CAREER_GROWTH', title: 'Career Growth' }
};

const awardXP = async (userId, actionType, achievementIds = []) => {
  let progress = await UserProgress.findOne({ user: userId });
  
  if (!progress) {
    progress = new UserProgress({ user: userId, xp: 0, level: 1, rank: 'Bronze' });
  }

  const prevLevel = progress.level;
  const prevRank = progress.rank;

  const xpGained = XP_MAP[actionType] || 0;
  progress.xp += xpGained;
  progress.level = calculateLevel(progress.xp);
  progress.rank = calculateRank(progress.level);

  let newAchievements = [];
  achievementIds.forEach(id => {
    if (ACHIEVEMENTS_MAP[id] && !progress.achievements.find(a => a.id === id)) {
      const ach = { ...ACHIEVEMENTS_MAP[id], unlockedAt: new Date() };
      progress.achievements.push(ach);
      newAchievements.push(ach);
    }
  });

  progress.updatedAt = new Date();
  await progress.save();

  return {
    xpGained,
    totalXp: progress.xp,
    level: progress.level,
    levelUp: progress.level > prevLevel,
    rankUp: progress.rank !== prevRank,
    rank: progress.rank,
    newAchievements
  };
};

const getProgress = async (userId) => {
  let progress = await UserProgress.findOne({ user: userId });
  if (!progress) {
    progress = await UserProgress.create({ user: userId });
  }
  return progress;
};

module.exports = { awardXP, getProgress, XP_MAP, ACHIEVEMENTS_MAP };

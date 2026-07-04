const DailyMission = require('../models/DailyMission');
const { generateMissions } = require('../services/missionGenerator');
const User = require('../models/User');

const getTodayMissions = async (req, res, next) => {
  try {
    // Optionally fetch user context (ScoreHistory etc. if needed) to feed generator
    // For now, pass basic context
    const context = { resumeScore: 50, careerScore: 50 }; 
    const missions = await generateMissions(req.user.id, context);
    res.status(200).json(missions);
  } catch (err) {
    next(err);
  }
};

const updateMissionStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['TODO', 'DONE', 'MISSED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const mission = await DailyMission.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { status },
      { new: true }
    );

    if (!mission) {
      return res.status(404).json({ error: 'Mission not found' });
    }

    res.status(200).json(mission);
  } catch (err) {
    next(err);
  }
};

module.exports = { getTodayMissions, updateMissionStatus };

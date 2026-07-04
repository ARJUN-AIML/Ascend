const xpEngine = require('../services/xpEngine');

const getProgress = async (req, res, next) => {
  try {
    const progress = await xpEngine.getProgress(req.user.id);
    res.status(200).json(progress);
  } catch (err) {
    next(err);
  }
};

const awardXP = async (req, res, next) => {
  try {
    const { actionType, achievementIds } = req.body;
    if (!actionType) {
      return res.status(400).json({ error: 'Missing actionType' });
    }
    const result = await xpEngine.awardXP(req.user.id, actionType, achievementIds || []);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = { getProgress, awardXP };

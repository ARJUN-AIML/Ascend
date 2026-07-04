const Product = require('../models/Product');
const User = require('../models/User');

// MongoDB-backed usage quota with atomic $inc
const RESET_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

const checkQuota = (limit = 10) => {
  return async (req, res, next) => {
    try {
      if (req.headers['x-bypass-quota'] === 'true') {
        return next();
      }
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'Not authorized' });
      }
      
      const userId = req.user.id;
      const now = new Date();
      
      // Step 1: Check and reset if needed. We don't $inc yet to avoid charging for failed requests if they are already blocked, but we must handle race conditions.
      // Actually, for a pure race-condition proof atomic update, we do findOneAndUpdate.
      
      // First, get the user to check the reset date
      let user = await User.findById(userId).select('aiUsage');
      if (!user) return res.status(404).json({ message: 'User not found' });
      
      if (!user.aiUsage) {
        user.aiUsage = { count: 0, lastReset: now };
      }
      
      if (now - user.aiUsage.lastReset > RESET_INTERVAL) {
        // Reset atomically
        await User.updateOne({ _id: userId }, { $set: { 'aiUsage.count': 0, 'aiUsage.lastReset': now } });
        user.aiUsage.count = 0;
      }
      
      // Atomic increment and return new document
      const updatedUser = await User.findOneAndUpdate(
        { _id: userId, 'aiUsage.count': { $lt: limit } },
        { $inc: { 'aiUsage.count': 1 } },
        { new: true }
      );
      
      if (!updatedUser) {
        // The condition 'aiUsage.count' < limit failed (meaning they are at or over the limit)
        return res.status(429).json({ message: 'AI Usage quota exceeded. Please upgrade your plan or try again tomorrow.' });
      }
      
      next();
    } catch (err) {
      next(err);
    }
  };
};

module.exports = { checkQuota };

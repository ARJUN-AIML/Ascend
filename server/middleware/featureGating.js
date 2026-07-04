const User = require('../models/User');

// Middleware to check if user has access to premium features
const requirePro = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    if (user.subscription.plan !== 'PRO') {
      return res.status(403).json({ success: false, message: 'Upgrade to PRO to access this feature', code: 'UPGRADE_REQUIRED' });
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

// Middleware to enforce usage limits based on plan
const enforceUsageLimit = (featureType) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      // PRO users have unlimited access
      if (user.subscription.plan === 'PRO') {
        return next();
      }

      // Reset logic for free tier (weekly reset)
      const lastReset = user.usage.lastReset;
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      if (lastReset < oneWeekAgo) {
        // Reset limits
        user.usage.resumeScans = 0;
        user.usage.mockInterviews = 0;
        user.usage.lastReset = Date.now();
        await user.save();
      }

      // Check limits based on feature type
      if (featureType === 'RESUME_SCAN') {
        if (user.usage.resumeScans >= 3) {
          return res.status(403).json({ success: false, message: 'Free tier limit reached for Resume Scans (3/week). Upgrade to PRO for unlimited.', code: 'LIMIT_REACHED' });
        }
        user.usage.resumeScans += 1;
      } else if (featureType === 'MOCK_INTERVIEW') {
        if (user.usage.mockInterviews >= 2) {
          return res.status(403).json({ success: false, message: 'Free tier limit reached for Mock Interviews (2/week). Upgrade to PRO for unlimited.', code: 'LIMIT_REACHED' });
        }
        user.usage.mockInterviews += 1;
      }
      
      await user.save();
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  requirePro,
  enforceUsageLimit
};

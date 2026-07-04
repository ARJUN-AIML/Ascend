const express = require('express');
const router = express.Router();
const { completeOnboarding, getProgress, updateProfile, getStrategy } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.post('/onboarding', completeOnboarding);
router.get('/progress', getProgress);
router.put('/profile', updateProfile);
router.get('/strategy', getStrategy);

module.exports = router;

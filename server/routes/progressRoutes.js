const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const progressController = require('../controllers/progressController');

router.use(protect);
router.get('/', progressController.getProgress);
router.post('/award', progressController.awardXP);

module.exports = router;

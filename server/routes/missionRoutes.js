const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const missionController = require('../controllers/missionController');

router.use(protect);
router.get('/', missionController.getTodayMissions);
router.patch('/:id', missionController.updateMissionStatus);

module.exports = router;

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const interviewController = require('../controllers/interviewController');

router.use(protect);
router.post('/generate', interviewController.generateSession);
router.post('/evaluate', interviewController.evaluateSession);

module.exports = router;

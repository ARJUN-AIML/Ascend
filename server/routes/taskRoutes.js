const express = require('express');
const router = express.Router();
const { getTasks, updateTaskStatus } = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.route('/').get(getTasks);
router.route('/:id').patch(updateTaskStatus);

module.exports = router;

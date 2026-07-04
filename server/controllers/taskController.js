const Task = require('../models/Task');

const getTasks = async (req, res, next) => {
  try {
    // Return TODO tasks ordered by priority and dueDate
    const tasks = await Task.find({ user: req.user.id, status: 'TODO' })
      .sort({ impactScore: -1, dueDate: 1 });
    res.json(tasks);
  } catch (err) {
    next(err);
  }
};

const updateTaskStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['TODO', 'DONE', 'DISMISSED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { status },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(task);
  } catch (err) {
    next(err);
  }
};

module.exports = { getTasks, updateTaskStatus };

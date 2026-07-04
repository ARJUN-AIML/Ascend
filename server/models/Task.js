const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['RESUME_FIX', 'SKILL_BUILD', 'JOB_APPLY', 'ONBOARDING'],
    required: true
  },
  status: {
    type: String,
    enum: ['TODO', 'DONE', 'DISMISSED'],
    default: 'TODO'
  },
  dueDate: {
    type: Date,
    required: true
  },
  priority: {
    type: String,
    enum: ['HIGH', 'MEDIUM', 'LOW'],
    default: 'MEDIUM'
  },
  impactScore: {
    type: Number,
    min: 1,
    max: 100,
    default: 50 // Represents how much moving this task to DONE will improve the Career Score
  },
  estimatedMinutes: {
    type: Number,
    default: 15
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  sourceType: {
    type: String,
    enum: ['AI_GENERATED', 'SYSTEM', 'MANUAL'],
    default: 'AI_GENERATED'
  },
  generatedFrom: {
    type: mongoose.Schema.Types.ObjectId, // Could ref Product or other analysis docs, left flexible
    default: null
  }
}, { timestamps: true });

// Prevent task bloat by enforcing indexes
TaskSchema.index({ user: 1, status: 1, dueDate: 1 });

module.exports = mongoose.model('Task', TaskSchema);

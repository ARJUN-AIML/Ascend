const mongoose = require('mongoose');

const EvaluationHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['resume', 'interview', 'jdmatch'],
    required: true
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  breakdown: {
    type: Object, // Flexible for different dimension formats (resume vs interview)
    default: {}
  },
  weaknesses: {
    type: [String],
    default: []
  },
  penalties: {
    type: [String], // Array of penalty IDs or string messages
    default: []
  }
}, { timestamps: true });

// Index for fast lookups per user and type
EvaluationHistorySchema.index({ user: 1, type: 1, createdAt: -1 });

module.exports = mongoose.model('EvaluationHistory', EvaluationHistorySchema);

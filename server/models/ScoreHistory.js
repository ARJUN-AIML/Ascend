const mongoose = require('mongoose');

const ScoreHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  resumeScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  careerScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  snapshotDate: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('ScoreHistory', ScoreHistorySchema);

const mongoose = require('mongoose');

const StrategySnapshotSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  roadmap30: {
    type: [String],
    default: []
  },
  roadmap60: {
    type: [String],
    default: []
  },
  roadmap90: {
    type: [String],
    default: []
  },
  generatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('StrategySnapshot', StrategySnapshotSchema);

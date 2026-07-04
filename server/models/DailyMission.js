const mongoose = require('mongoose');

const DailyMissionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['RESUME_IMPROVEMENT', 'SKILL_BUILDING', 'JOB_APPLICATION', 'INTERVIEW_PREP', 'GENERIC'],
    required: true
  },
  impactScore: {
    type: Number,
    required: true
  },
  estimatedMinutes: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['TODO', 'DONE', 'MISSED'],
    default: 'TODO'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('DailyMission', DailyMissionSchema);

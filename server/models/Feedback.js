const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  context: {
    type: String, // 'MockInterview', 'ResumeScan', 'Dashboard'
    required: true
  },
  scoreAccurate: {
    type: String, // 'Yes', 'No', 'N/A'
    default: 'N/A'
  },
  feedbackUseful: {
    type: String, // 'Yes', 'No'
    default: 'N/A'
  },
  wouldUseAgain: {
    type: String, // 'Yes', 'No'
    default: 'N/A'
  },
  wouldPay: {
    type: String, // 'Yes', 'No'
    default: 'N/A'
  },
  additionalComments: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Feedback', FeedbackSchema);

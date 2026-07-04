const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true
  },
  password: {
    type: String,
    required: [true, 'Please add a password']
  },
  hasCompletedOnboarding: {
    type: Boolean,
    default: false
  },
  education: {
    college: String,
    degree: String,
    department: String,
    graduationYear: String
  },
  career: {
    targetRole: String,
    domain: String,
    location: String
  },
  skills: [String],
  social: {
    linkedin: String,
    github: String,
    portfolio: String
  },
  subscription: {
    plan: { type: String, enum: ['FREE', 'PRO'], default: 'FREE' },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
    expiresAt: { type: Date, default: null }
  },
  usage: {
    resumeScans: { type: Number, default: 0 },
    mockInterviews: { type: Number, default: 0 },
    lastReset: { type: Date, default: Date.now }
  },
  aiUsage: {
    count: { type: Number, default: 0 },
    lastReset: { type: Date, default: Date.now }
  },
  onboardingStatus: {
    type: String,
    enum: ['PENDING', 'COMPLETED'],
    default: 'PENDING'
  },
  careerProfile: {
    targetRole: { type: String, default: '' },
    currentStatus: { type: String, default: '' },
    mainGoal: { type: String, default: '' },
    confirmedSkills: [{ type: String }],
    weeklyCommitmentHours: { type: Number, default: 5 },
    locationPreference: { type: String, default: '' }
  },
  retention: {
    streak: { type: Number, default: 0 },
    xp: { type: Number, default: 0 },
    lastActive: { type: Date, default: null }
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Match password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

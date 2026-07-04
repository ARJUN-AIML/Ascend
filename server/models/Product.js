const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
      index: true
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      required: true,
      trim: true,
    },
    stipend: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['Applied', 'OA', 'Interview', 'Selected', 'Rejected'],
      default: 'Applied',
    },
    platform: {
      type: String,
      trim: true,
      default: 'Direct',
    },
    deadline: {
      type: Date,
      required: true,
    },
    notes: { type: String, default: '' },
    applicationLink: { type: String, default: '' },
    source: { type: String, default: '' },
    location: { type: String, default: '' },
    appliedDate: { type: Date, default: Date.now },
    lastUpdated: { type: Date, default: Date.now }
  },
  { timestamps: true, collection: 'products' }
);

module.exports = mongoose.model('Product', productSchema);
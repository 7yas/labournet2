const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  location: {
    type: String,
    required: true
  },
  projectType: {
    type: String,
    enum: ['Residential', 'Commercial', 'Industrial'],
    required: true
  },
  timeline: {
    startDate: Date,
    endDate: Date
  },
  hourlyRate: {
    min: Number,
    max: Number
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'completed', 'cancelled'],
    default: 'active'
  },
  contractor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contractor',
    required: true
  },
  workers: [{
    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Worker'
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    },
    appliedAt: {
      type: Date,
      default: Date.now
    }
  }],
  employmentType: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract'],
    required: true
  },
  applicantsCount: {
    type: Number,
    default: 0
  },
  progress: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Add virtual population for contractor details
projectSchema.virtual('contractorDetails', {
  ref: 'Contractor',
  localField: 'contractor',
  foreignField: '_id',
  justOne: true
});

// Ensure virtuals are included in toJSON
projectSchema.set('toJSON', { virtuals: true });
projectSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Project', projectSchema); 
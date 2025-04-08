const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  employmentType: {
    type: String,
    required: true,
    trim: true
  },
  hourlyRate: {
    type: String,
    required: true,
    trim: true
  },
  jobDescription: {
    type: String,
    required: true,
    trim: true
  },
  requirements: {
    type: String,
    trim: true
  },
  company: {
    type: String,
    required: true,
    trim: true
  },
  projectType: {
    type: String,
    required: true,
    trim: true
  },
  timeline: {
    type: String,
    required: true,
    trim: true
  },
  expiresAfter: {
    type: String,
    required: true,
    trim: true
  },
  postedDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    default: 'active',
    enum: ['active', 'completed', 'cancelled']
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'postedByRole'
  },
  postedByRole: {
    type: String,
    required: true,
    enum: ['Builder', 'Contractor', 'Worker', 'professional']
  }
}, {
  timestamps: true
});

const Project = mongoose.model('Project', projectSchema);

module.exports = Project; 
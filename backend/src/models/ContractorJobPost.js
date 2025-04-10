const mongoose = require('mongoose');

const contractorJobPostSchema = new mongoose.Schema({
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
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Contractor'
  },
  status: {
    type: String,
    default: 'active',
    enum: ['active', 'completed', 'cancelled']
  }
}, {
  timestamps: true
});

const ContractorJobPost = mongoose.model('ContractorJobPost', contractorJobPostSchema);

module.exports = ContractorJobPost; 
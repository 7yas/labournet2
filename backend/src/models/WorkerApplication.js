const mongoose = require('mongoose');

const workerApplicationSchema = new mongoose.Schema({
  // Worker details
  workerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker',
    required: true
  },
  fullName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  hourlyRate: {
    type: Number,
    required: true
  },
  skills: [String],
  certifications: [String],
  
  // Project details
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ContractorJobPost',
    required: true
  },
  projectTitle: {
    type: String,
    required: true
  },
  projectType: {
    type: String,
    required: true
  },
  projectLocation: {
    type: String,
    required: true
  },
  projectTimeline: {
    type: String,
    required: true
  },
  
  // Contractor details
  contractorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contractor',
    required: true
  },
  
  // Application details
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  coverLetter: {
    type: String,
    required: true
  },
  appliedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('WorkerApplication', workerApplicationSchema); 
const mongoose = require('mongoose');

const workerApplicationSchema = new mongoose.Schema({
  worker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker',
    required: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  contractor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contractor',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  coverLetter: String,
  hourlyRate: {
    type: Number,
  },
  skills: [String],
  experience: String,
  availability: String,
  appliedAt: {
    type: Date,
    default: Date.now
  },
  
  projectTitle: {
    type: String,
  },
  projectType: {
    type: String,
  },
  projectLocation: {
    type: String,
  },
  projectTimeline: {
    type: String,
  },
}, {
  timestamps: true
});

module.exports = mongoose.model('WorkerApplication', workerApplicationSchema);
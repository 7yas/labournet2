const mongoose = require('mongoose');

const workerApplicationSchema = new mongoose.Schema({
  worker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  contractor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  applicationDate: {
    type: Date,
    default: Date.now
  },
  skills: [String],
  experience: String,
  availability: String
});

module.exports = mongoose.model('WorkerApplication', workerApplicationSchema); 
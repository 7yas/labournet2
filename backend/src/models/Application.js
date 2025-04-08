const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
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
  expectedRate: Number,
  contractorDetails: {
    businessName: String,
    businessType: String,
    yearsOfExperience: Number,
    licenseNumber: String,
    insuranceInfo: String,
    projectTypes: [String],
    address: String,
    certifications: [String],
    skills: [String],
    hourlyRate: Number,
    availability: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Application', applicationSchema); 
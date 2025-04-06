const mongoose = require('mongoose');

const workerSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  yearsOfExperience: {
    type: Number,
    required: true
  },
  skills: {
    type: [String],
    required: true
  },
  certifications: {
    type: [String],
    required: true
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true
  },
  hourlyRate: {
    type: Number,
    required: true
  },
  availability: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  }
});

// Add timestamps
workerSchema.set('timestamps', true);

// Add pre-save hook to update updatedAt
workerSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Worker', workerSchema); 
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
  phoneNumber: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  hourlyRate: {
    type: Number,
    required: true,
    min: 0
  }
}, {
  timestamps: true
});

// Add pre-save hook to update updatedAt
workerSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Worker', workerSchema); 
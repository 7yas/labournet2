const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  senderRole: {
    type: String,
    enum: ['contractor', 'professional', 'worker'],
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiverRole: {
    type: String,
    enum: ['contractor', 'professional', 'worker'],
    required: true
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  contractorDetails: {
    businessName: String,
    businessType: String,
    yearsOfExperience: Number,
    licenseNumber: String,
    insuranceInfo: String,
    projectTypes: [String],
    address: String,
    phoneNumber: String,
    email: String
  },
  status: {
    type: String,
    enum: ['unread', 'read'],
    default: 'unread'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Message', messageSchema); 
const express = require('express');
const router = express.Router();
const WorkerApplication = require('../models/WorkerApplication');
const auth = require('../middleware/auth');

// Create a new application
router.post('/', auth, async (req, res) => {
  try {
    const application = new WorkerApplication(req.body);
    await application.save();
    res.status(201).json(application);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get applications for a contractor
router.get('/contractor/:contractorId', auth, async (req, res) => {
  try {
    const applications = await WorkerApplication.find({ 
      contractorId: req.params.contractorId,
      status: 'pending'
    }).sort({ appliedAt: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update application status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const application = await WorkerApplication.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    res.json(application);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 
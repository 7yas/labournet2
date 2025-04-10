const express = require('express');
const router = express.Router();
const WorkerApplication = require('../models/WorkerApplication');
const auth = require('../middleware/auth');
const mongoose = require('mongoose');

// Get applications for a contractor
router.get('/contractor/:id', async (req, res) => {
  try {
    console.log('Received request for contractor ID:', req.params.id);
    
    const contractorId = req.params.id;
    console.log('Searching for applications with contractor ID:', contractorId);

    const applications = await WorkerApplication.find({ contractor: contractorId })
      .populate('worker')
      .populate('project')
      .populate('contractor');

    console.log('Found applications:', applications.length);
    
    if (!applications || applications.length === 0) {
      console.log('No applications found for contractor:', contractorId);
      return res.json([]);
    }

    res.json(applications);
  } catch (error) {
    console.error('Detailed error:', error);
    res.status(500).json({ 
      message: 'Error fetching applications',
      error: error.message,
      stack: error.stack
    });
  }
});

// Get count of pending applications for a contractor
router.get('/contractor/count', auth, async (req, res) => {
  try {
    const count = await WorkerApplication.countDocuments({
      contractor: req.user._id,
      status: 'pending'
    });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Accept an application
router.put('/:id/accept', auth, async (req, res) => {
  try {
    const application = await WorkerApplication.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    if (application.contractor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    application.status = 'accepted';
    await application.save();
    res.json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reject an application
router.put('/:id/reject', auth, async (req, res) => {
  try {
    const application = await WorkerApplication.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    if (application.contractor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    application.status = 'rejected';
    await application.save();
    res.json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new application
router.post('/', auth, async (req, res) => {
  try {
    const { projectId, contractorId, skills, experience, availability } = req.body;
    
    const application = new WorkerApplication({
      worker: req.user._id,
      project: projectId,
      contractor: contractorId,
      skills,
      experience,
      availability
    });

    await application.save();
    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 
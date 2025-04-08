const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const Project = require('../models/Project');
const Contractor = require('../models/Contractor');
const auth = require('../middleware/auth');

// Get all applications for a project
router.get('/project/:projectId', auth, async (req, res) => {
  try {
    console.log('Fetching applications for project:', req.params.projectId);
    console.log('Authenticated user:', req.user._id, req.role);

    const applications = await Application.find({ project: req.params.projectId })
      .populate('contractor', 'businessName email phoneNumber');

    if (!applications || applications.length === 0) {
      return res.status(200).json([]);
    }

    res.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ 
      message: 'Error fetching applications',
      error: error.message 
    });
  }
});

// Apply to project
router.post('/', auth, async (req, res) => {
  try {
    const { project, contractor, coverLetter, expectedRate, contractorDetails } = req.body;
    
    // Validate required fields
    if (!project || !contractor) {
      return res.status(400).json({ message: 'Project and contractor are required' });
    }

    const application = new Application({
      project,
      contractor,
      coverLetter,
      expectedRate,
      contractorDetails
    });

    await application.save();
    
    // Update project applicants count
    await Project.findByIdAndUpdate(
      project,
      { $inc: { applicantsCount: 1 } }
    );
    
    res.status(201).json(application);
  } catch (error) {
    console.error('Error creating application:', error);
    res.status(400).json({ 
      message: 'Error creating application',
      error: error.message 
    });
  }
});

// Update application status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json(application);
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(400).json({ 
      message: 'Error updating application status',
      error: error.message 
    });
  }
});

module.exports = router; 
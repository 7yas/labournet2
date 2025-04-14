const express = require('express');
const router = express.Router();
const WorkerApplication = require('../models/WorkerApplication');
const auth = require('../middleware/auth');

// Create a new application
router.post('/', auth, async (req, res) => {
  try {
    const { worker, project, contractor, coverLetter, skills, experience, availability, hourlyRate, projectId, projectTitle, projectType, projectLocation, projectTimeline } = req.body;

    // Validate required fields
    if (!worker || !project || !contractor || !coverLetter || !hourlyRate || !projectTitle || !projectType || !projectLocation || !projectTimeline) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const application = new WorkerApplication({
      worker,
      project,
      contractor,
      coverLetter,
      skills: skills || [],
      experience: experience || '',
      availability: availability || 'Full-time',
      hourlyRate: hourlyRate || 0,
      projectTitle: projectTitle || '',
      projectType: projectType || 'Full-time',
      projectLocation: projectLocation || '',
      projectTimeline: projectTimeline || '1 month',
    });

    await application.save();
    res.status(201).json(application);
  } catch (error) {
    console.error('Error creating WorkerApplication:', error);
    res.status(500).json({ message: 'Failed to create WorkerApplication', error: error.message });
  }
});

// Get applications for a contractor
router.get('/contractor/:contractorId', auth, async (req, res) => {
  try {
    const applications = await WorkerApplication.find({ contractor: req.params.contractorId })
      .populate('worker', 'fullName email phoneNumber')
      .populate('project', 'title location')
      .sort({ appliedAt: -1 });

    res.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
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
const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Contractor = require('../models/Contractor');

// Get all projects with optional filtering
router.get('/', async (req, res) => {
  try {
    const { builder, contractor } = req.query;
    let query = {};

    if (builder) {
      query.builder = builder;
    }
    if (contractor) {
      query.contractor = contractor;
    }

    // Populate contractor details
    const projects = await Project.find(query)
      .populate('contractorDetails')
      .sort('-createdAt');

    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get project by ID
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('contractorDetails');
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create project
router.post('/', async (req, res) => {
  try {
    // Ensure contractor exists and get their details
    const contractor = await Contractor.findById(req.body.contractor);
    if (!contractor) {
      return res.status(404).json({ 
        message: 'Contractor not found',
        details: 'Please complete your contractor profile before posting a job'
      });
    }

    // Create the project with contractor details
    const project = new Project({
      ...req.body,
      contractor: contractor._id
    });

    const newProject = await project.save();
    
    // Populate contractor details before sending response
    const populatedProject = await Project.findById(newProject._id)
      .populate('contractorDetails');
    
    res.status(201).json(populatedProject);
  } catch (error) {
    console.error('Error creating project:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error',
        details: Object.values(error.errors).map(err => err.message)
      });
    }
    res.status(400).json({ message: error.message });
  }
});

// Update project
router.put('/:id', async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('contractorDetails');
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    res.json(project);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(400).json({ message: error.message });
  }
});

// Delete project
router.delete('/:id', async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json({ message: 'Project deleted' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 
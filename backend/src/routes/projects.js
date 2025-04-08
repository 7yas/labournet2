const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Contractor = require('../models/Contractor');

// Get all projects with optional filtering
router.get('/', async (req, res) => {
  try {
    const { builder, contractor, role } = req.query;
    let query = {};

    // Build query based on parameters
    if (builder) {
      query.postedBy = builder;
    }
    if (contractor) {
      query.contractor = contractor;
    }
    if (role) {
      query.postedByRole = role;
    }

    // Get projects with populated postedBy field
    const projects = await Project.find(query)
      .populate('postedBy', 'fullName email businessName')
      .sort({ createdAt: -1 });

    res.status(200).json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ 
      message: 'Failed to fetch projects',
      error: error.message 
    });
  }
});

// Get project by ID
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('postedBy', 'fullName email');
    
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
    console.log('Received project data:', req.body);
    
    const project = new Project(req.body);
    const savedProject = await project.save();
    
    console.log('Project saved successfully:', savedProject);
    res.status(201).json(savedProject);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(400).json({ 
      message: error.message || 'Failed to create project',
      details: error.errors || 'No additional error details'
    });
  }
});

// Update project
router.put('/:id', async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('postedBy', 'fullName email');
    
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
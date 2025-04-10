const express = require('express');
const router = express.Router();
const ContractorJobPost = require('../models/ContractorJobPost');
const auth = require('../middleware/auth');

// Create a new job post
router.post('/', auth, async (req, res) => {
  try {
    const jobPost = new ContractorJobPost({
      ...req.body,
      postedBy: req.user._id
    });
    await jobPost.save();
    res.status(201).json(jobPost);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all job posts for a contractor
router.get('/contractor/:contractorId', auth, async (req, res) => {
  try {
    const jobPosts = await ContractorJobPost.find({ postedBy: req.params.contractorId });
    res.json(jobPosts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all job posts
router.get('/', async (req, res) => {
  try {
    const jobPosts = await ContractorJobPost.find().populate('postedBy', 'businessName');
    res.json(jobPosts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 
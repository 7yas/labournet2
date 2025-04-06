const express = require('express');
const router = express.Router();
const Contractor = require('../models/Contractor');
const Worker = require('../models/Worker');
const Builder = require('../models/Builder');

// Login route
router.post('/login', async (req, res) => {
  try {
    console.log('Login request received:', req.body);
    const { email, password, role } = req.body;
    
    if (!email || !password || !role) {
      console.log('Missing required fields:', { email, password, role });
      return res.status(400).json({ message: 'Email, password, and role are required' });
    }

    let user;
    if (role === 'professional') {
      console.log('Searching for professional user with email:', email);
      user = await Builder.findOne({ email });
    } else if (role === 'contractor') {
      console.log('Searching for contractor user with email:', email);
      user = await Contractor.findOne({ email });
    } else if (role === 'worker') {
      console.log('Searching for worker user with email:', email);
      user = await Worker.findOne({ email });
    } else {
      console.log('Invalid role provided:', role);
      return res.status(400).json({ message: 'Invalid role' });
    }

    console.log('User found:', user ? 'Yes' : 'No');

    if (!user) {
      console.log('User not found in database');
      return res.status(404).json({ message: 'User does not exist' });
    }

    if (user.password !== password) {
      console.log('Password mismatch');
      return res.status(401).json({ message: 'Invalid password' });
    }

    console.log('Login successful for user:', user.email);
    // Return success response with user data
    res.status(200).json({
      message: 'Login successful',
      user: {
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Simple signup route
router.post('/signup', async (req, res) => {
  try {
    console.log('Received signup request:', req.body);
    
    const { email, password, fullName, role, ...profileData } = req.body;

    // Basic validation
    const missingFields = [];
    if (!email) missingFields.push('email');
    if (!password) missingFields.push('password');
    if (!fullName) missingFields.push('fullName');
    if (!role) missingFields.push('role');

    if (missingFields.length > 0) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        missingFields 
      });
    }

    // Check if email already exists
    const existingUser = await Contractor.findOne({ email }) || 
                        await Worker.findOne({ email }) || 
                        await Builder.findOne({ email });
    
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Create profile based on role
    let newProfile;
    if (role === 'contractor') {
      // Validate contractor specific fields
      const contractorFields = ['businessName', 'businessLicense', 'businessType', 'yearsOfExperience', 'licenseNumber', 'insuranceInfo', 'projectTypes', 'phoneNumber'];
      const missingContractorFields = contractorFields.filter(field => !profileData[field]);
      
      if (missingContractorFields.length > 0) {
        return res.status(400).json({ 
          message: 'Missing required contractor fields',
          missingFields: missingContractorFields
        });
      }

      newProfile = new Contractor({
        email,
        password,
        fullName,
        ...profileData
      });
    } else if (role === 'worker') {
      // Validate worker specific fields
      const workerFields = ['yearsOfExperience', 'skills', 'certifications', 'phoneNumber', 'hourlyRate', 'availability', 'description', 'address'];
      const missingWorkerFields = workerFields.filter(field => !profileData[field]);
      
      if (missingWorkerFields.length > 0) {
        return res.status(400).json({ 
          message: 'Missing required worker fields',
          missingFields: missingWorkerFields
        });
      }

      // Convert skills and certifications to arrays if they're strings
      const skills = typeof profileData.skills === 'string' 
        ? profileData.skills.split(',').map(s => s.trim()).filter(s => s)
        : Array.isArray(profileData.skills) 
          ? profileData.skills.map(s => s.trim()).filter(s => s)
          : [];

      const certifications = typeof profileData.certifications === 'string'
        ? profileData.certifications.split(',').map(c => c.trim()).filter(c => c)
        : Array.isArray(profileData.certifications)
          ? profileData.certifications.map(c => c.trim()).filter(c => c)
          : [];

      newProfile = new Worker({
        email,
        password,
        fullName,
        yearsOfExperience: profileData.yearsOfExperience,
        skills,
        certifications,
        hourlyRate: profileData.hourlyRate,
        availability: profileData.availability,
        description: profileData.description,
        phoneNumber: profileData.phoneNumber,
        address: profileData.address
      });
    } else if (role === 'builder') {
      // Validate builder specific fields
      const builderFields = ['businessName', 'businessLicense', 'yearsOfExperience', 'licenseNumber', 'insuranceInfo', 'phoneNumber', 'address'];
      const missingBuilderFields = builderFields.filter(field => !profileData[field]);
      
      if (missingBuilderFields.length > 0) {
        return res.status(400).json({ 
          message: 'Missing required builder fields',
          missingFields: missingBuilderFields
        });
      }

      newProfile = new Builder({
        email,
        password,
        fullName,
        ...profileData
      });
    } else {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const savedProfile = await newProfile.save();
    console.log('Profile saved successfully:', savedProfile);
    
    // Return success response with user data
    res.status(201).json({
      message: 'Account created successfully',
      user: {
        _id: savedProfile._id,
        email: savedProfile.email,
        fullName: savedProfile.fullName,
        role: role
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(400).json({ 
      message: error.message || 'Failed to create account',
      details: error.errors || 'No additional error details'
    });
  }
});

module.exports = router; 
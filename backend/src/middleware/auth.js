const jwt = require('jsonwebtoken');
const Builder = require('../models/Builder');
const Contractor = require('../models/Contractor');
const Worker = require('../models/Worker');

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user based on role
    let user;
    if (decoded.role === 'professional') {
      user = await Builder.findById(decoded.userId);
    } else if (decoded.role === 'contractor') {
      user = await Contractor.findById(decoded.userId);
    } else if (decoded.role === 'worker') {
      user = await Worker.findById(decoded.userId);
    }
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Add user and role to request
    req.user = user;
    req.role = decoded.role;
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = auth; 
const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const auth = require('../middleware/auth');

// Create a new message
router.post('/', auth, async (req, res) => {
  try {
    const message = new Message({
      ...req.body,
      sender: req.user._id
    });

    await message.save();
    res.status(201).json(message);
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).json({ message: 'Error creating message' });
  }
});

// Get messages for a user
router.get('/', auth, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id },
        { receiver: req.user._id }
      ]
    })
    .populate('sender', 'fullName email')
    .populate('receiver', 'fullName email')
    .populate('projectId', 'title')
    .sort({ createdAt: -1 });

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Error fetching messages' });
  }
});

// Get messages for a specific project
router.get('/project/:projectId', auth, async (req, res) => {
  try {
    const messages = await Message.find({
      projectId: req.params.projectId,
      $or: [
        { sender: req.user._id },
        { receiver: req.user._id }
      ]
    })
    .populate('sender', 'fullName email')
    .populate('receiver', 'fullName email')
    .sort({ createdAt: -1 });

    res.json(messages);
  } catch (error) {
    console.error('Error fetching project messages:', error);
    res.status(500).json({ message: 'Error fetching project messages' });
  }
});

// Mark message as read
router.patch('/:messageId/read', auth, async (req, res) => {
  try {
    const message = await Message.findOneAndUpdate(
      { _id: req.params.messageId, receiver: req.user._id },
      { status: 'read' },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    res.json(message);
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({ message: 'Error marking message as read' });
  }
});

module.exports = router; 
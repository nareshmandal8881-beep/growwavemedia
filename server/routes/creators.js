const express = require('express');
const router = express.Router();
const Creator = require('../models/Creator');

// Get all creators (Admin)
router.get('/', async (req, res) => {
  try {
    const creators = await Creator.find().sort({ createdAt: -1 });
    res.json(creators);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create creator
router.post('/', async (req, res) => {
  try {
    const creator = new Creator(req.body);
    await creator.save();
    res.status(201).json(creator);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get creator by Firebase UID
router.get('/uid/:uid', async (req, res) => {
  try {
    const creator = await Creator.findOne({ uid: req.params.uid });
    if (!creator) return res.status(404).json({ message: 'Creator not found' });
    res.json(creator);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update creator profile
router.patch('/:id', async (req, res) => {
  try {
    const creator = await Creator.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    res.json(creator);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;

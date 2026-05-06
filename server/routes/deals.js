const express = require('express');
const router = express.Router();
const Deal = require('../models/Deal');

// Get all deals (Admin)
router.get('/', async (req, res) => {
  try {
    const deals = await Deal.find().sort({ createdAt: -1 });
    res.json(deals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create deal
router.post('/', async (req, res) => {
  try {
    const deal = new Deal(req.body);
    await deal.save();
    res.status(201).json(deal);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete deal
router.delete('/:id', async (req, res) => {
  try {
    await Deal.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deal deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all deals for a creator
router.get('/creator/:creatorId', async (req, res) => {
  try {
    const deals = await Deal.find({ creatorId: req.params.creatorId }).sort({ createdAt: -1 });
    res.json(deals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a single deal
router.get('/:id', async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);
    if (!deal) return res.status(404).json({ message: 'Deal not found' });
    res.json(deal);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update deal status
router.patch('/:id/status', async (req, res) => {
  try {
    const deal = await Deal.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status, updatedAt: Date.now() },
      { new: true }
    );
    res.json(deal);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;

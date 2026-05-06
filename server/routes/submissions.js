const express = require('express');
const router = express.Router();
const Submission = require('../models/Submission');

// Get all submissions (Admin)
router.get('/', async (req, res) => {
  try {
    const submissions = await Submission.find().sort({ submittedAt: -1 });
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get submission for a deal
router.get('/deal/:dealId', async (req, res) => {
  try {
    const submission = await Submission.findOne({ dealId: req.params.dealId });
    res.json(submission);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create or Update submission
router.post('/', async (req, res) => {
  try {
    const { dealId } = req.body;
    let submission = await Submission.findOne({ dealId });
    
    if (submission) {
      // Update existing
      submission = await Submission.findOneAndUpdate(
        { dealId },
        { ...req.body, submittedAt: Date.now() },
        { new: true }
      );
    } else {
      // Create new
      submission = new Submission(req.body);
      await submission.save();
    }
    
    res.status(201).json(submission);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update submission status
router.patch('/:id', async (req, res) => {
  try {
    const submission = await Submission.findByIdAndUpdate(
      req.params.id,
      { ...req.body, reviewedAt: Date.now() },
      { new: true }
    );
    res.json(submission);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;

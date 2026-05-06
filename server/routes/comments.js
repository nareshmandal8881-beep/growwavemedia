const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');

// Get all comments for a submission
router.get('/submission/:id', async (req, res) => {
  try {
    const comments = await Comment.find({ submissionId: req.params.id }).sort({ createdAt: 1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Post a new comment
router.post('/', async (req, res) => {
  try {
    const comment = new Comment(req.body);
    await comment.save();
    res.status(201).json(comment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;

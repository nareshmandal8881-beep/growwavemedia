const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  submissionId: { type: String, required: true },
  text: { type: String, required: true },
  sender: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Comment', commentSchema);

const mongoose = require('mongoose');

const DealSchema = new mongoose.Schema({
  title: { type: String, required: true },
  amount: { type: Number, default: 0 },
  platform: String,
  videoType: String,
  status: { type: String, default: 'active' }, // active, submitted_video, approved, paid, completed
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Creator' },
  updatedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Deal', DealSchema);

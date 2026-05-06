const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
  dealId: { type: mongoose.Schema.Types.ObjectId, ref: 'Deal' },
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Creator' },
  dealTitle: String,
  creatorName: String,
  videoLink: String,
  uploadedVideoUrl: String,
  uploadMode: { type: String, enum: ['link', 'file'] },
  contentPlatform: String,
  timestamp: String,
  signatureData: String, // Base64 signature
  status: { type: String, default: 'submitted_video' }, // submitted_video, approved, rejected, paid
  adminUtrId: String,
  adminProofUrl: String,
  rejectReason: String,
  reviewedAt: Date,
  submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Submission', SubmissionSchema);

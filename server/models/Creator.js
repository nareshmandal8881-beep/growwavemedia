const mongoose = require('mongoose');

const CreatorSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true }, // Firebase UID link
  name: String,
  email: { type: String, unique: true },
  phone: String,
  channelName: String,
  creatorAddress: String,
  accountHolder: String,
  bankName: String,
  ifscCode: String,
  accountNumber: String,
  upiId: String,
  signatureUrl: String,
  status: { type: String, default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Creator', CreatorSchema);

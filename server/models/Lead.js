const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  type: { type: String, enum: ['influencer', 'brand'], required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  handleCompany: String,
  nicheWebsite: String,
  followers: String,
  message: String,
  ytName: String,
  ytLink: String,
  ytSubs: String,
  igHandle: String,
  igLink: String,
  igFollowers: String,
  fbName: String,
  fbLink: String,
  fbFollowers: String,
  company: String,
  website: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Lead', leadSchema);

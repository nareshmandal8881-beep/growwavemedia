const mongoose = require('mongoose');

const InvoiceSchema = new mongoose.Schema({
  invoiceId: { type: String, unique: true },
  dealId: { type: mongoose.Schema.Types.ObjectId, ref: 'Deal' },
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Creator' },
  dealTitle: String,
  creatorName: String,
  creatorEmail: String,
  channelName: String,
  creatorAddress: String,
  accountHolder: String,
  bankName: String,
  ifscCode: String,
  accountNumber: String,
  upiId: String,
  amount: Number,
  platform: String,
  utrId: String,
  adminProofUrl: String,
  signatureData: String,
  status: { type: String, default: 'pending_payment' }, // pending_payment, paid, cancelled
  billingPeriod: String,
  date: String,
  paidAt: Date,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Invoice', InvoiceSchema);

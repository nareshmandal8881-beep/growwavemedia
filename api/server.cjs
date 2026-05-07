const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Load .env from server directory if present (local dev)
try { require('dotenv').config({ path: path.join(__dirname, '../server/.env') }); } catch(e) {}

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ── DB connection (cached for serverless) ────────────────────────────────────
let isConnected = false;
async function connectDB() {
  if (isConnected) return;
  const uri =
    process.env.MONGODB_URI ||
    'mongodb+srv://dominhosting1_db_user:wSCUZctqkmHDdAtr@cluster0.ijyz5tt.mongodb.net/?appName=Cluster0';
  const conn = await mongoose.connect(uri);
  isConnected = conn.connections[0].readyState === 1;
  console.log('✅ MongoDB connected');
}

app.use(async (_req, _res, next) => {
  try { await connectDB(); } catch (e) { console.error(e); }
  next();
});

// ── Mongoose Models (inline to avoid path issues on Vercel) ───────────────────
const { Schema, model, models } = mongoose;

const creatorSchema = new Schema({ uid: String, name: String, email: String, phone: String, channelName: String, youtubeLink: String, instagramLink: String, signatureUrl: String, paymentDetails: String, accountHolder: String, bankName: String, ifscCode: String, accountNumber: String, upiId: String, creatorAddress: String }, { timestamps: true });
const dealSchema = new Schema({ title: String, creatorId: String, creatorName: String, channelName: String, youtubeLink: String, instagramLink: String, platform: String, videoType: String, deliverables: String, amount: Number, deadline: String, status: { type: String, default: 'locked' } }, { timestamps: true });
const submissionSchema = new Schema({ dealId: String, creatorId: String, dealTitle: String, creatorName: String, channelName: String, contentPlatform: String, videoLink: String, uploadedVideoUrl: String, signatureUrl: String, signatureData: String, timestamp: String, creatorAddress: String, accountHolder: String, bankName: String, ifscCode: String, accountNumber: String, upiId: String, amount: Number, status: { type: String, default: 'submitted_video' }, adminUtrId: String, adminProofUrl: String, rejectReason: String }, { timestamps: true });
const invoiceSchema = new Schema({ invoiceId: String, dealId: String, creatorId: String, dealTitle: String, creatorName: String, channelName: String, creatorAddress: String, accountHolder: String, bankName: String, ifscCode: String, accountNumber: String, upiId: String, amount: Number, date: String, status: { type: String, default: 'pending_payment' }, utrId: String, adminProofUrl: String, signatureUrl: String }, { timestamps: true });
const commentSchema = new Schema({ submissionId: String, author: String, text: String, isAdmin: Boolean }, { timestamps: true });
const leadSchema = new Schema({ type: { type: String, enum: ['influencer', 'brand', 'contact_form'] }, name: String, email: String, phone: String, company: String, website: String, message: String, ytName: String, ytLink: String, ytSubs: String, igHandle: String, igLink: String, igFollowers: String, fbLink: String }, { timestamps: true });

const Creator    = models.Creator    || model('Creator',    creatorSchema);
const Deal       = models.Deal       || model('Deal',       dealSchema);
const Submission = models.Submission || model('Submission', submissionSchema);
const Invoice    = models.Invoice    || model('Invoice',    invoiceSchema);
const Comment    = models.Comment    || model('Comment',    commentSchema);
const Lead       = models.Lead       || model('Lead',       leadSchema);

// ── Routes ────────────────────────────────────────────────────────────────────

// LEADS
app.get('/api/leads', async (req, res) => {
  try { res.json(await Lead.find().sort({ createdAt: -1 })); } catch (e) { res.status(500).json({ error: e.message }); }
});
app.post('/api/leads', async (req, res) => {
  try { const l = await new Lead(req.body).save(); res.status(201).json(l); } catch (e) { res.status(400).json({ error: e.message }); }
});
app.delete('/api/leads/:id', async (req, res) => {
  try { await Lead.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' }); } catch (e) { res.status(500).json({ error: e.message }); }
});

// CREATORS
app.get('/api/creators', async (req, res) => {
  try { res.json(await Creator.find().sort({ createdAt: -1 })); } catch (e) { res.status(500).json({ message: e.message }); }
});
app.post('/api/creators', async (req, res) => {
  try { const c = await new Creator(req.body).save(); res.status(201).json(c); } catch (e) { res.status(400).json({ message: e.message }); }
});
app.get('/api/creators/uid/:uid', async (req, res) => {
  try {
    const c = await Creator.findOne({ uid: req.params.uid });
    if (!c) return res.status(404).json({ message: 'Creator not found' });
    res.json(c);
  } catch (e) { res.status(500).json({ message: e.message }); }
});
app.patch('/api/creators/:id', async (req, res) => {
  try { const c = await Creator.findByIdAndUpdate(req.params.id, { ...req.body, updatedAt: Date.now() }, { new: true }); res.json(c); } catch (e) { res.status(400).json({ message: e.message }); }
});

// DEALS
app.get('/api/deals', async (req, res) => {
  try { res.json(await Deal.find().sort({ createdAt: -1 })); } catch (e) { res.status(500).json({ message: e.message }); }
});
app.post('/api/deals', async (req, res) => {
  try { const d = await new Deal(req.body).save(); res.status(201).json(d); } catch (e) { res.status(400).json({ message: e.message }); }
});
app.get('/api/deals/creator/:creatorId', async (req, res) => {
  try { res.json(await Deal.find({ creatorId: req.params.creatorId }).sort({ createdAt: -1 })); } catch (e) { res.status(500).json({ message: e.message }); }
});
app.get('/api/deals/:id', async (req, res) => {
  try {
    const d = await Deal.findById(req.params.id);
    if (!d) return res.status(404).json({ message: 'Deal not found' });
    res.json(d);
  } catch (e) { res.status(500).json({ message: e.message }); }
});
app.delete('/api/deals/:id', async (req, res) => {
  try { await Deal.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' }); } catch (e) { res.status(500).json({ message: e.message }); }
});
app.patch('/api/deals/:id/status', async (req, res) => {
  try { const d = await Deal.findByIdAndUpdate(req.params.id, { status: req.body.status, updatedAt: Date.now() }, { new: true }); res.json(d); } catch (e) { res.status(400).json({ message: e.message }); }
});

// SUBMISSIONS
app.get('/api/submissions', async (req, res) => {
  try { res.json(await Submission.find().sort({ createdAt: -1 })); } catch (e) { res.status(500).json({ message: e.message }); }
});
app.get('/api/submissions/deal/:dealId', async (req, res) => {
  try { const s = await Submission.findOne({ dealId: req.params.dealId }); res.json(s || null); } catch (e) { res.status(500).json({ message: e.message }); }
});
app.post('/api/submissions', async (req, res) => {
  try { const s = await new Submission(req.body).save(); res.status(201).json(s); } catch (e) { res.status(400).json({ message: e.message }); }
});
app.patch('/api/submissions/:id', async (req, res) => {
  try { const s = await Submission.findByIdAndUpdate(req.params.id, { ...req.body }, { new: true }); res.json(s); } catch (e) { res.status(400).json({ message: e.message }); }
});

// INVOICES
app.get('/api/invoices', async (req, res) => {
  try { res.json(await Invoice.find().sort({ createdAt: -1 })); } catch (e) { res.status(500).json({ message: e.message }); }
});
app.get('/api/invoices/creator/:creatorId', async (req, res) => {
  try { res.json(await Invoice.find({ creatorId: req.params.creatorId }).sort({ createdAt: -1 })); } catch (e) { res.status(500).json({ message: e.message }); }
});
app.post('/api/invoices', async (req, res) => {
  try { const inv = await new Invoice(req.body).save(); res.status(201).json(inv); } catch (e) { res.status(400).json({ message: e.message }); }
});
app.patch('/api/invoices/:id', async (req, res) => {
  try { const inv = await Invoice.findByIdAndUpdate(req.params.id, { ...req.body }, { new: true }); res.json(inv); } catch (e) { res.status(400).json({ message: e.message }); }
});
app.get('/api/invoices/:id', async (req, res) => {
  try { const inv = await Invoice.findById(req.params.id); if (!inv) return res.status(404).json({ message: 'Not found' }); res.json(inv); } catch (e) { res.status(500).json({ message: e.message }); }
});

// COMMENTS
app.get('/api/comments/:submissionId', async (req, res) => {
  try { res.json(await Comment.find({ submissionId: req.params.submissionId }).sort({ createdAt: 1 })); } catch (e) { res.status(500).json({ message: e.message }); }
});
app.post('/api/comments', async (req, res) => {
  try { const c = await new Comment(req.body).save(); res.status(201).json(c); } catch (e) { res.status(400).json({ message: e.message }); }
});

// health check
app.get('/api', (_req, res) => res.json({ status: 'ok', message: 'Grow Wave Media API running' }));

module.exports = app;

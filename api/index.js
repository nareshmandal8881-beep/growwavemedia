import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    return;
  }
  try {
    const uri = process.env.MONGODB_URI || 'mongodb+srv://dominhosting1_db_user:wSCUZctqkmHDdAtr@cluster0.ijyz5tt.mongodb.net/?appName=Cluster0';
    const db = await mongoose.connect(uri);
    isConnected = db.connections[0].readyState;
    console.log('✅ Connected to MongoDB Atlas');
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err);
  }
};

// Middleware to ensure DB connection before handling requests
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// Routes
app.use('/api/creators', require('../server/routes/creators'));
app.use('/api/deals', require('../server/routes/deals'));
app.use('/api/submissions', require('../server/routes/submissions'));
app.use('/api/invoices', require('../server/routes/invoices'));
app.use('/api/comments', require('../server/routes/comments'));
app.use('/api/leads', require('../server/routes/leads'));

app.get('/api', (req, res) => {
  res.send('Grow Wave Media API is running on Vercel...');
});

// For Vercel Serverless Functions, we must export the express app using ES export
export default app;

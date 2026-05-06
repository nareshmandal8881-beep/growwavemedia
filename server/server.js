const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// Routes
const creators = require('./routes/creators');
const deals = require('./routes/deals');
const submissions = require('./routes/submissions');
const invoices = require('./routes/invoices');
const comments = require('./routes/comments');
const leads = require('./routes/leads');

app.use('/api/creators', creators);
app.use('/api/deals', deals);
app.use('/api/submissions', submissions);
app.use('/api/invoices', invoices);
app.use('/api/comments', comments);
app.use('/api/leads', leads);

// Basic Route
app.get('/', (req, res) => {
  res.send('Grow Wave Media API is running...');
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

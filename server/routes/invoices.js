const express = require('express');
const router = express.Router();
const Invoice = require('../models/Invoice');

// Get all invoices (Admin)
router.get('/', async (req, res) => {
  try {
    const invoices = await Invoice.find().sort({ createdAt: -1 });
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all invoices for a creator
router.get('/creator/:creatorId', async (req, res) => {
  try {
    const invoices = await Invoice.find({ creatorId: req.params.creatorId }).sort({ createdAt: -1 });
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a single invoice
router.get('/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create new invoice
router.post('/', async (req, res) => {
  try {
    const invoice = new Invoice(req.body);
    await invoice.save();
    res.status(201).json(invoice);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update invoice status
router.patch('/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      { ...req.body, paidAt: req.body.status === 'paid' ? Date.now() : undefined },
      { new: true }
    );
    res.json(invoice);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;

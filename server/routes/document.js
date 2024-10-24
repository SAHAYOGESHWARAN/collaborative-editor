const express = require('express');
const Document = require('../models/Document');
const router = express.Router();

// Fetch document by ID
router.get('/:id', async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (document) {
      res.json(document);
    } else {
      res.status(404).json({ message: 'Document not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new document
router.post('/', async (req, res) => {
  try {
    const newDocument = new Document({ content: req.body.content || '' });
    const savedDocument = await newDocument.save();
    res.json(savedDocument);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update an existing document
router.put('/:id', async (req, res) => {
  try {
    const updatedDocument = await Document.findByIdAndUpdate(
      req.params.id,
      { content: req.body.content },
      { new: true }
    );
    res.json(updatedDocument);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

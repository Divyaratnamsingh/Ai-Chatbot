const express = require('express');
const router = express.Router();
const { createEntry, getEntries, getEntry, updateEntry, deleteEntry, generatePrompt } = require('../controllers/journalController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createEntry);
router.get('/', protect, getEntries);
router.post('/prompt', protect, generatePrompt);
router.get('/:id', protect, getEntry);
router.put('/:id', protect, updateEntry);
router.delete('/:id', protect, deleteEntry);

module.exports = router;

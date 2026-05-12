const express = require('express');
const router = express.Router();
const { createMoodEntry, getMoodEntries, getMoodStats, updateMoodEntry, deleteMoodEntry } = require('../controllers/moodController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createMoodEntry);
router.get('/', protect, getMoodEntries);
router.get('/stats', protect, getMoodStats);
router.put('/:id', protect, updateMoodEntry);
router.delete('/:id', protect, deleteMoodEntry);

module.exports = router;

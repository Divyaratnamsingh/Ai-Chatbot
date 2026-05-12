const express = require('express');
const router = express.Router();
const { getMoodTrends, getEmotionFrequency, getWellnessScore, getInsights } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.get('/mood-trends', protect, getMoodTrends);
router.get('/emotion-frequency', protect, getEmotionFrequency);
router.get('/wellness-score', protect, getWellnessScore);
router.get('/insights', protect, getInsights);

module.exports = router;

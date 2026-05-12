const express = require('express');
const router = express.Router();
const { sendMessage, getHistory, clearHistory } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.post('/send', protect, sendMessage);
router.get('/history', protect, getHistory);
router.delete('/clear', protect, clearHistory);

module.exports = router;

const ChatMessage = require('../models/ChatMessage');
const MoodEntry = require('../models/MoodEntry');
const { getAIResponse } = require('../services/aiService');

// POST /api/chat/send
const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    // Save user message
    const userMessage = await ChatMessage.create({
      userId: req.user._id,
      role: 'user',
      content: message
    });

    // Get conversation history for context
    const history = await ChatMessage.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();
    history.reverse();

    // Get AI response
    const { response, emotion } = await getAIResponse(message, history);

    // Save AI response
    const aiMessage = await ChatMessage.create({
      userId: req.user._id,
      role: 'assistant',
      content: response,
      emotionDetected: emotion
    });

    // Auto-log mood if a specific emotion is detected
    if (emotion && emotion !== 'neutral') {
      const emotionToMoodMap = {
        happy: 5,
        calm: 4,
        confused: 3,
        anxious: 2,
        angry: 2,
        sad: 1
      };
      const moodValue = emotionToMoodMap[emotion] || 3;
      const capitalizedEmotion = emotion.charAt(0).toUpperCase() + emotion.slice(1);

      await MoodEntry.create({
        userId: req.user._id,
        mood: moodValue,
        emotions: [capitalizedEmotion],
        note: `Chatbot auto-logged: "${message.substring(0, 450)}"`,
        activities: ['💬 Chatbot'],
        date: new Date()
      });
    }

    res.json({
      userMessage: {
        _id: userMessage._id,
        role: 'user',
        content: message,
        createdAt: userMessage.createdAt
      },
      aiMessage: {
        _id: aiMessage._id,
        role: 'assistant',
        content: response,
        emotionDetected: emotion,
        createdAt: aiMessage.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/chat/history
const getHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const messages = await ChatMessage.find({ userId: req.user._id })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await ChatMessage.countDocuments({ userId: req.user._id });

    res.json({ messages, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// DELETE /api/chat/clear
const clearHistory = async (req, res) => {
  try {
    await ChatMessage.deleteMany({ userId: req.user._id });
    res.json({ message: 'Chat history cleared' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { sendMessage, getHistory, clearHistory };

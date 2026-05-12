const MoodEntry = require('../models/MoodEntry');
const JournalEntry = require('../models/JournalEntry');
const ChatMessage = require('../models/ChatMessage');
const { getWellnessInsight } = require('../services/aiService');

// GET /api/analytics/mood-trends
const getMoodTrends = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const entries = await MoodEntry.find({
      userId: req.user._id,
      date: { $gte: startDate }
    }).sort({ date: 1 }).lean();

    // Group by date
    const trends = {};
    entries.forEach(e => {
      const dateKey = new Date(e.date).toISOString().split('T')[0];
      if (!trends[dateKey]) {
        trends[dateKey] = { date: dateKey, moods: [], avgMood: 0 };
      }
      trends[dateKey].moods.push(e.mood);
    });

    // Calculate daily averages
    const trendData = Object.values(trends).map(t => ({
      date: t.date,
      avgMood: Math.round((t.moods.reduce((a, b) => a + b, 0) / t.moods.length) * 10) / 10,
      entries: t.moods.length
    }));

    res.json(trendData);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/analytics/emotion-frequency
const getEmotionFrequency = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const entries = await MoodEntry.find({
      userId: req.user._id,
      date: { $gte: startDate }
    }).lean();

    const frequency = {};
    entries.forEach(e => {
      e.emotions.forEach(em => {
        frequency[em] = (frequency[em] || 0) + 1;
      });
    });

    const result = Object.entries(frequency)
      .map(([emotion, count]) => ({ emotion, count }))
      .sort((a, b) => b.count - a.count);

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/analytics/wellness-score
const getWellnessScore = async (req, res) => {
  try {
    const days = 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const moodEntries = await MoodEntry.find({
      userId: req.user._id,
      date: { $gte: startDate }
    }).lean();

    const journalEntries = await JournalEntry.find({
      userId: req.user._id,
      createdAt: { $gte: startDate }
    }).lean();

    const chatMessages = await ChatMessage.find({
      userId: req.user._id,
      createdAt: { $gte: startDate },
      role: 'user'
    }).lean();

    // Calculate wellness score (0-100)
    let score = 50; // Base score

    // Mood contribution (up to +30)
    if (moodEntries.length > 0) {
      const avgMood = moodEntries.reduce((s, e) => s + e.mood, 0) / moodEntries.length;
      score += (avgMood - 3) * 10; // -20 to +20
      score += Math.min(moodEntries.length, 7) * 1.5; // Consistency bonus
    }

    // Journal contribution (up to +15)
    score += Math.min(journalEntries.length, 5) * 3;

    // Chat engagement contribution (up to +10)
    score += Math.min(chatMessages.length, 10) * 1;

    score = Math.max(0, Math.min(100, Math.round(score)));

    res.json({
      score,
      breakdown: {
        moodTracking: moodEntries.length,
        journaling: journalEntries.length,
        chatSessions: chatMessages.length
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/analytics/insights
const getInsights = async (req, res) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    const entries = await MoodEntry.find({
      userId: req.user._id,
      date: { $gte: startDate }
    }).lean();

    const insight = await getWellnessInsight(entries);
    res.json({ insight, basedOn: entries.length + ' mood entries from the past week' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getMoodTrends, getEmotionFrequency, getWellnessScore, getInsights };

const MoodEntry = require('../models/MoodEntry');

// POST /api/mood
const createMoodEntry = async (req, res) => {
  try {
    const { mood, emotions, note, activities, date } = req.body;

    if (!mood || mood < 1 || mood > 5) {
      return res.status(400).json({ message: 'Mood must be between 1 and 5' });
    }

    const entry = await MoodEntry.create({
      userId: req.user._id,
      mood,
      emotions: emotions || [],
      note: note || '',
      activities: activities || [],
      date: date || new Date()
    });

    res.status(201).json(entry);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/mood
const getMoodEntries = async (req, res) => {
  try {
    const { startDate, endDate, limit = 30 } = req.query;
    const query = { userId: req.user._id };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const entries = await MoodEntry.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .lean();

    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/mood/stats
const getMoodStats = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const entries = await MoodEntry.find({
      userId: req.user._id,
      date: { $gte: startDate }
    }).sort({ date: 1 }).lean();

    if (entries.length === 0) {
      return res.json({
        averageMood: 0,
        totalEntries: 0,
        moodDistribution: {},
        emotionFrequency: {},
        streak: 0,
        entries: []
      });
    }

    // Calculate average mood
    const averageMood = entries.reduce((sum, e) => sum + e.mood, 0) / entries.length;

    // Mood distribution
    const moodDistribution = {};
    entries.forEach(e => {
      moodDistribution[e.mood] = (moodDistribution[e.mood] || 0) + 1;
    });

    // Emotion frequency
    const emotionFrequency = {};
    entries.forEach(e => {
      e.emotions.forEach(em => {
        emotionFrequency[em] = (emotionFrequency[em] || 0) + 1;
      });
    });

    // Calculate streak
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const hasEntry = entries.some(e => {
        const entryDate = new Date(e.date);
        entryDate.setHours(0, 0, 0, 0);
        return entryDate.getTime() === checkDate.getTime();
      });
      if (hasEntry) streak++;
      else break;
    }

    res.json({
      averageMood: Math.round(averageMood * 10) / 10,
      totalEntries: entries.length,
      moodDistribution,
      emotionFrequency,
      streak,
      entries
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PUT /api/mood/:id
const updateMoodEntry = async (req, res) => {
  try {
    const entry = await MoodEntry.findOne({ _id: req.params.id, userId: req.user._id });
    if (!entry) {
      return res.status(404).json({ message: 'Mood entry not found' });
    }

    const { mood, emotions, note, activities } = req.body;
    if (mood) entry.mood = mood;
    if (emotions) entry.emotions = emotions;
    if (note !== undefined) entry.note = note;
    if (activities) entry.activities = activities;

    await entry.save();
    res.json(entry);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// DELETE /api/mood/:id
const deleteMoodEntry = async (req, res) => {
  try {
    const entry = await MoodEntry.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!entry) {
      return res.status(404).json({ message: 'Mood entry not found' });
    }
    res.json({ message: 'Mood entry deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { createMoodEntry, getMoodEntries, getMoodStats, updateMoodEntry, deleteMoodEntry };

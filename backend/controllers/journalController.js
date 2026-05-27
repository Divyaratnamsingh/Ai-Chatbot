const JournalEntry = require('../models/JournalEntry');
const { getJournalPrompt, generateJournalEntry } = require('../services/aiService');

// POST /api/journal
const createEntry = async (req, res) => {
  try {
    const { title, content, emotions, tags } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const entry = await JournalEntry.create({
      userId: req.user._id,
      title,
      content,
      emotions: emotions || [],
      tags: tags || []
    });

    res.status(201).json(entry);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/journal
const getEntries = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search;

    let query = { userId: req.user._id };
    if (search) {
      query.$text = { $search: search };
    }

    const entries = await JournalEntry.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await JournalEntry.countDocuments(query);

    res.json({ entries, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/journal/:id
const getEntry = async (req, res) => {
  try {
    const entry = await JournalEntry.findOne({ _id: req.params.id, userId: req.user._id });
    if (!entry) {
      return res.status(404).json({ message: 'Journal entry not found' });
    }
    res.json(entry);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PUT /api/journal/:id
const updateEntry = async (req, res) => {
  try {
    const entry = await JournalEntry.findOne({ _id: req.params.id, userId: req.user._id });
    if (!entry) {
      return res.status(404).json({ message: 'Journal entry not found' });
    }

    const { title, content, emotions, tags } = req.body;
    if (title) entry.title = title;
    if (content) entry.content = content;
    if (emotions) entry.emotions = emotions;
    if (tags) entry.tags = tags;

    await entry.save();
    res.json(entry);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// DELETE /api/journal/:id
const deleteEntry = async (req, res) => {
  try {
    const entry = await JournalEntry.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!entry) {
      return res.status(404).json({ message: 'Journal entry not found' });
    }
    res.json({ message: 'Journal entry deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /api/journal/prompt
const generatePrompt = async (req, res) => {
  try {
    const prompt = await getJournalPrompt();
    res.json({ prompt });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /api/journal/generate-entry
const generateEntryWithAI = async (req, res) => {
  try {
    const { title, prompt } = req.body;
    if (!title) {
      return res.status(400).json({ message: 'Title is required to generate journal entry' });
    }
    const content = await generateJournalEntry(title, prompt);
    res.json({ content });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { createEntry, getEntries, getEntry, updateEntry, deleteEntry, generatePrompt, generateEntryWithAI };


const express = require('express');
const request = require('supertest');

// Mock Mongoose model methods so we don't need a real DB connection
jest.mock('../models/ChatMessage', () => {
  return {
    create: jest.fn().mockImplementation((data) => Promise.resolve({
      _id: 'mock_msg_id',
      userId: data.userId,
      role: data.role,
      content: data.content,
      emotionDetected: data.emotionDetected,
      createdAt: new Date().toISOString()
    })),
    find: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    lean: jest.fn().mockResolvedValue([
      { _id: '1', role: 'user', content: 'hello' },
      { _id: '2', role: 'assistant', content: 'hi' }
    ]),
    countDocuments: jest.fn().mockResolvedValue(2),
    deleteMany: jest.fn().mockResolvedValue({ deletedCount: 2 })
  };
});

// Mock MoodEntry model
jest.mock('../models/MoodEntry', () => {
  return {
    create: jest.fn().mockImplementation((data) => Promise.resolve({
      _id: 'mock_mood_id',
      userId: data.userId,
      mood: data.mood,
      emotions: data.emotions,
      note: data.note,
      activities: data.activities,
      date: data.date || new Date().toISOString()
    }))
  };
});

// Mock protect middleware
jest.mock('../middleware/authMiddleware', () => ({
  protect: (req, res, next) => {
    req.user = { _id: 'mock_user_id', name: 'Test User' };
    next();
  }
}));

const ChatMessage = require('../models/ChatMessage');
const MoodEntry = require('../models/MoodEntry');
const chatRoutes = require('../routes/chatRoutes');

const app = express();
app.use(express.json());
app.use('/api/chat', chatRoutes);

describe('Chat API Routes - Integration Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/chat/send', () => {
    test('should send a message and return user & assistant replies', async () => {
      const response = await request(app)
        .post('/api/chat/send')
        .send({ message: "I'm feeling anxious" });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('userMessage');
      expect(response.body).toHaveProperty('aiMessage');
      expect(response.body.userMessage.content).toBe("I'm feeling anxious");
      expect(response.body.aiMessage.emotionDetected).toBe('anxious');

      expect(ChatMessage.create).toHaveBeenCalledTimes(2);
      expect(MoodEntry.create).toHaveBeenCalledTimes(1);
      expect(MoodEntry.create).toHaveBeenCalledWith(expect.objectContaining({
        mood: 2,
        emotions: ['Anxious'],
        activities: ['💬 Chatbot']
      }));
    });

    test('should auto-log a mood when happy emotion is detected', async () => {
      const response = await request(app)
        .post('/api/chat/send')
        .send({ message: "I am feeling so happy today!" });

      expect(response.status).toBe(200);
      expect(response.body.aiMessage.emotionDetected).toBe('happy');
      expect(MoodEntry.create).toHaveBeenCalledTimes(1);
      expect(MoodEntry.create).toHaveBeenCalledWith(expect.objectContaining({
        mood: 5,
        emotions: ['Happy'],
        activities: ['💬 Chatbot'],
        note: expect.stringContaining('I am feeling so happy today!')
      }));
    });

    test('should NOT auto-log a mood when the emotion is neutral', async () => {
      const response = await request(app)
        .post('/api/chat/send')
        .send({ message: "what is the weather today?" });

      expect(response.status).toBe(200);
      expect(response.body.aiMessage.emotionDetected).toBe('neutral');
      expect(MoodEntry.create).not.toHaveBeenCalled();
    });

    test('should return 400 if message is empty', async () => {
      const response = await request(app)
        .post('/api/chat/send')
        .send({ message: '' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Message is required');
    });
  });

  describe('GET /api/chat/history', () => {
    test('should return chat message history list', async () => {
      const response = await request(app)
        .get('/api/chat/history');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('messages');
      expect(Array.isArray(response.body.messages)).toBe(true);
      expect(response.body.messages.length).toBe(2);
    });
  });

  describe('DELETE /api/chat/clear', () => {
    test('should delete chat messages history', async () => {
      const response = await request(app)
        .delete('/api/chat/clear');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Chat history cleared');
      expect(ChatMessage.deleteMany).toHaveBeenCalledWith({ userId: 'mock_user_id' });
    });
  });
});

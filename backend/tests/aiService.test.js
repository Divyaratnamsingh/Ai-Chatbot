const { detectEmotion, getAIResponse, generateJournalEntry } = require('../services/aiService');

describe('AI Service - Unit Tests', () => {
  describe('detectEmotion', () => {
    test('should detect happy emotion keywords', () => {
      expect(detectEmotion('I am feeling so happy and excited today!')).toBe('happy');
    });

    test('should detect sad emotion keywords', () => {
      expect(detectEmotion('I feel depressed and lonely.')).toBe('sad');
    });

    test('should detect anxious emotion keywords', () => {
      expect(detectEmotion('I am so stressed and overwhelmed.')).toBe('anxious');
    });

    test('should detect angry emotion keywords', () => {
      expect(detectEmotion('I am frustrated and angry.')).toBe('angry');
    });

    test('should detect calm emotion keywords', () => {
      expect(detectEmotion('I feel peaceful and relaxed.')).toBe('calm');
    });

    test('should detect confused emotion keywords', () => {
      expect(detectEmotion('I am confused and unsure of what to do.')).toBe('confused');
    });

    test('should return neutral for unrecognized keywords', () => {
      expect(detectEmotion('What is the weather today?')).toBe('neutral');
    });
  });

  describe('getAIResponse (Fallback Modes)', () => {
    test('should return the correct fallback response for anxious emotion', async () => {
      const result = await getAIResponse("I'm feeling anxious");
      expect(result.emotion).toBe('anxious');
      expect(result.response).toContain('anxiety can feel overwhelming');
      expect(result.response).not.toContain('*');
    });

    test('should return the correct fallback response for happy emotion', async () => {
      const result = await getAIResponse("I am happy");
      expect(result.emotion).toBe('happy');
      expect(result.response).toContain('wonderful to hear');
      expect(result.response).not.toContain('*');
    });

    test('should return neutral fallback response for unknown message', async () => {
      const result = await getAIResponse("hello");
      expect(result.emotion).toBe('neutral');
      expect(result.response).toContain('Thank you for sharing');
      expect(result.response).not.toContain('*');
    });
  });

  describe('generateJournalEntry (Fallback Modes)', () => {
    test('should generate a journal draft using title only', async () => {
      const title = 'A lovely day at the park';
      const result = await generateJournalEntry(title);
      expect(result).toContain(`Today, I am writing about "${title}"`);
      expect(result).not.toContain('Reflecting on the writing prompt');
    });

    test('should generate a journal draft using title and prompt', async () => {
      const title = 'Feeling nervous about exams';
      const prompt = 'What is one small thing you can control today?';
      const result = await generateJournalEntry(title, prompt);
      expect(result).toContain(`Today, I am writing about "${title}"`);
      expect(result).toContain(`Reflecting on the writing prompt: "${prompt}"`);
    });
  });
});

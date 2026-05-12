const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;
let model = null;

const initializeAI = () => {
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    console.log('✅ Gemini AI initialized');
    return true;
  }
  console.log('⚠️  Gemini API key not configured — using fallback responses');
  return false;
};

const SYSTEM_PROMPT = `You are MindWell, a compassionate and empathetic AI mental health wellness companion. Your role is to:

1. Listen actively and respond with empathy and warmth
2. Help users explore their emotions and thoughts
3. Suggest evidence-based coping strategies (CBT, mindfulness, breathing exercises)
4. Encourage self-reflection and journaling
5. Detect signs of distress and provide appropriate support
6. NEVER diagnose mental health conditions
7. ALWAYS recommend professional help when users express severe distress, self-harm, or suicidal thoughts
8. Keep responses concise (2-4 paragraphs max) and conversational
9. Use a warm, supportive, non-judgmental tone

CRISIS RESPONSE: If a user mentions self-harm, suicide, or severe crisis, immediately provide:
- National Suicide Prevention Lifeline: 988
- Crisis Text Line: Text HOME to 741741
- International Association for Suicide Prevention: https://www.iasp.info/resources/Crisis_Centres/

Remember: You are a wellness companion, NOT a therapist or medical professional.`;

const EMOTION_KEYWORDS = {
  happy: ['happy', 'joy', 'excited', 'great', 'wonderful', 'amazing', 'good', 'fantastic', 'blessed', 'grateful', 'love'],
  sad: ['sad', 'depressed', 'down', 'unhappy', 'miserable', 'hopeless', 'lonely', 'crying', 'tears', 'heartbroken'],
  anxious: ['anxious', 'worried', 'nervous', 'panic', 'fear', 'scared', 'stress', 'overwhelmed', 'tense', 'restless'],
  angry: ['angry', 'frustrated', 'annoyed', 'furious', 'irritated', 'mad', 'rage', 'upset', 'resentful'],
  calm: ['calm', 'peaceful', 'relaxed', 'serene', 'tranquil', 'content', 'mindful', 'centered'],
  confused: ['confused', 'lost', 'uncertain', 'unsure', 'doubt', 'conflicted', 'torn', 'indecisive']
};

const detectEmotion = (text) => {
  const lower = text.toLowerCase();
  let maxScore = 0;
  let detectedEmotion = 'neutral';

  for (const [emotion, keywords] of Object.entries(EMOTION_KEYWORDS)) {
    const score = keywords.filter(kw => lower.includes(kw)).length;
    if (score > maxScore) {
      maxScore = score;
      detectedEmotion = emotion;
    }
  }

  return detectedEmotion;
};

const FALLBACK_RESPONSES = {
  happy: "That's wonderful to hear! 😊 It sounds like you're in a positive space right now. What's been contributing to these good feelings? Savoring positive moments can help build emotional resilience.",
  sad: "I hear you, and I want you to know that it's okay to feel this way. 💙 Sadness is a natural emotion, and you don't have to face it alone. Would you like to talk about what's been weighing on you? Sometimes putting feelings into words can help lighten the load.",
  anxious: "I understand that anxiety can feel overwhelming. 🌿 Let's take a moment together. Try taking a slow, deep breath — inhale for 4 counts, hold for 4, exhale for 6. You're safe right now. Would you like to explore what's triggering these feelings?",
  angry: "It sounds like you're dealing with some strong emotions right now. That's completely valid. 🔥 Anger often signals that something important to us has been crossed. Would you like to explore what's behind these feelings?",
  calm: "It's lovely that you're feeling centered and peaceful. 🧘 That's a wonderful state of mind. Is there anything you'd like to reflect on or discuss while you're in this space?",
  confused: "It's completely normal to feel uncertain sometimes. 🤔 Life can be complex, and not having all the answers is part of being human. What's on your mind? Let's work through it together.",
  neutral: "Thank you for sharing with me. 💬 I'm here to listen and support you. How are you feeling today? There's no right or wrong answer — just share whatever comes naturally."
};

const getAIResponse = async (userMessage, conversationHistory = []) => {
  const emotion = detectEmotion(userMessage);

  if (!model) {
    return {
      response: FALLBACK_RESPONSES[emotion] || FALLBACK_RESPONSES.neutral,
      emotion
    };
  }

  try {
    const historyMessages = conversationHistory.slice(-10).map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const chat = model.startChat({
      history: [
        { role: 'user', parts: [{ text: 'Please follow these instructions for our conversation: ' + SYSTEM_PROMPT }] },
        { role: 'model', parts: [{ text: 'I understand. I am MindWell, your compassionate mental health wellness companion. I will follow all the guidelines you mentioned. How can I support you today?' }] },
        ...historyMessages
      ]
    });

    const result = await chat.sendMessage(userMessage);
    const response = result.response.text();

    return { response, emotion };
  } catch (error) {
    console.error('Gemini API Error:', error.message);
    return {
      response: FALLBACK_RESPONSES[emotion] || FALLBACK_RESPONSES.neutral,
      emotion
    };
  }
};

const getJournalPrompt = async () => {
  if (!model) {
    const prompts = [
      "What are three things you're grateful for today, and why do they matter to you?",
      "Describe a moment today when you felt truly present. What were you doing?",
      "If your emotions today were weather, what would the forecast be?",
      "Write about a challenge you faced recently. What did you learn from it?",
      "What does self-care look like for you today? How can you prioritize it?",
      "Describe a person who made a positive impact on your life recently.",
      "What boundaries do you need to set or maintain for your wellbeing?",
      "Write a letter of compassion to yourself about something you're struggling with."
    ];
    return prompts[Math.floor(Math.random() * prompts.length)];
  }

  try {
    const result = await model.generateContent(
      'Generate a single thoughtful, introspective journaling prompt focused on mental wellness, self-reflection, or emotional growth. Keep it under 2 sentences. Do not include any prefix like "Prompt:" — just the prompt itself.'
    );
    return result.response.text().trim();
  } catch (error) {
    return "What emotions have been visiting you today? Take a moment to sit with them without judgment.";
  }
};

const getWellnessInsight = async (moodData) => {
  if (!model) {
    return "Based on your recent mood patterns, consider incorporating a short mindfulness practice into your daily routine. Even 5 minutes of focused breathing can help stabilize emotional fluctuations.";
  }

  try {
    const prompt = `Based on this mood data from the past week, provide a brief, actionable wellness insight (2-3 sentences max). Be warm and supportive. Mood data: ${JSON.stringify(moodData)}`;
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    return "Keep tracking your moods — self-awareness is the first step toward emotional wellness. You're doing great by showing up for yourself!";
  }
};

module.exports = { initializeAI, getAIResponse, detectEmotion, getJournalPrompt, getWellnessInsight };

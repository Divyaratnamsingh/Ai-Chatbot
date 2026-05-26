import { useState, useEffect, useRef } from 'react';
import {
  Box, TextField, IconButton, Typography, Avatar, Paper,
  Chip, CircularProgress, Tooltip, Button,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { Send, DeleteOutlined, SmartToy, Person, VpnKey } from '@mui/icons-material';
import { chatAPI } from '../services/api';

// Typewriter effect component for assistant responses
function Typewriter({ text, speed = 8, onType }) {
  const [displayedText, setDisplayedText] = useState('');
  
  // Use a ref to capture the latest onType callback to avoid resetting the typing interval
  const onTypeRef = useRef(onType);
  useEffect(() => {
    onTypeRef.current = onType;
  }, [onType]);

  useEffect(() => {
    setDisplayedText('');
    let currentIndex = 0;
    const timer = setInterval(() => {
      if (currentIndex < text.length) {
        const char = text.charAt(currentIndex);
        setDisplayedText((prev) => prev + char);
        currentIndex++;
        if (onTypeRef.current) onTypeRef.current();
      } else {
        clearInterval(timer);
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);

  return <>{displayedText}</>;
}

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [lastResponseId, setLastResponseId] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadHistory = async () => {
    try {
      const res = await chatAPI.getHistory();
      setMessages(res.data.messages || []);
    } catch { /* empty */ }
    setHistoryLoading(false);
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const text = input.trim();
    setInput('');
    setLoading(true);

    // Optimistically add user message
    const tempUserMsg = { _id: Date.now(), role: 'user', content: text, createdAt: new Date().toISOString() };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const res = await chatAPI.send(text);
      // Replace temp message and add AI response
      setLastResponseId(res.data.aiMessage._id);
      setMessages(prev => [
        ...prev.filter(m => m._id !== tempUserMsg._id),
        res.data.userMessage,
        res.data.aiMessage
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { _id: Date.now() + 1, role: 'assistant', content: "I'm having trouble connecting right now. Please try again.", createdAt: new Date().toISOString() }
      ]);
    }
    setLoading(false);
  };

  const clearChat = async () => {
    try {
      await chatAPI.clear();
      setMessages([]);
    } catch { /* empty */ }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const emotionColors = {
    happy: '#22c55e', sad: '#60a5fa', anxious: '#f59e0b',
    angry: '#ef4444', calm: '#06b6d4', confused: '#14b8a6', neutral: '#94a3b8'
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)' }}>
      {/* Chat Header */}
      <Box sx={{
        px: 3, py: 2,
        borderBottom: '1px solid',
        borderColor: 'divider',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(15,118,110,0.03)',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ background: 'linear-gradient(135deg, #0f766e, #14b8a6)', width: 40, height: 40 }}>
            <SmartToy />
          </Avatar>
          <Box>
            <Typography variant="subtitle1" fontWeight={700}>MindWell AI</Typography>
            <Typography variant="caption" color="text.secondary">
              {loading ? '✍️ Typing...' : '🟢 Online — Your wellness companion'}
            </Typography>
          </Box>
        </Box>
        <Tooltip title="Clear chat history">
          <IconButton onClick={clearChat} size="small" sx={{ color: 'text.secondary' }}>
            <DeleteOutlined />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Messages */}
      <Box sx={{ flex: 1, overflow: 'auto', px: { xs: 2, md: 3 }, py: 2 }}>
        {historyLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', pt: 8 }}>
            <CircularProgress sx={{ color: '#0f766e' }} />
          </Box>
        ) : messages.length === 0 ? (
          <Box sx={{ textAlign: 'center', pt: 8 }}>
            <Typography variant="h1" sx={{ fontSize: '4rem', mb: 2 }}>🧠</Typography>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              Welcome to MindWell Chat
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 450, mx: 'auto', mb: 4 }}>
              I'm here to listen and support you. Share how you're feeling, and I'll respond with empathy and helpful suggestions.
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
              {['How are you feeling today?', "I'm feeling anxious", "I need someone to talk to", 'Help me relax'].map(q => (
                <Chip
                  key={q}
                  label={q}
                  onClick={() => { setInput(q); }}
                  sx={{
                    cursor: 'pointer',
                    background: 'rgba(15,118,110,0.1)',
                    border: '1px solid rgba(15,118,110,0.2)',
                    '&:hover': { background: 'rgba(15,118,110,0.2)', transform: 'translateY(-1px)' },
                    transition: 'all 0.2s',
                  }}
                />
              ))}
            </Box>
          </Box>
        ) : (
          messages.map((msg, i) => (
            <Box
              key={msg._id || i}
              className={i === messages.length - 1 ? 'animate-fadeInUp' : ''}
              sx={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                mb: 2,
              }}
            >
              {msg.role === 'assistant' && (
                <Avatar sx={{
                  width: 32, height: 32, mr: 1, mt: 0.5,
                  background: 'linear-gradient(135deg, #0f766e, #14b8a6)',
                  fontSize: '0.8rem'
                }}>
                  <SmartToy sx={{ fontSize: 18 }} />
                </Avatar>
              )}
              <Box sx={{ maxWidth: '75%' }}>
                <Paper sx={{
                  p: 2, borderRadius: 3,
                  ...(msg.role === 'user' ? {
                    background: 'linear-gradient(135deg, #0f766e, #115e59)',
                    color: 'white',
                    borderBottomRightRadius: 4,
                  } : {
                    bgcolor: 'background.paper',
                    borderBottomLeftRadius: 4,
                  }),
                }}>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                    {msg.role === 'assistant' && msg._id === lastResponseId ? (
                      <Typewriter
                        text={msg.content}
                        onType={() => {
                          messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
                        }}
                      />
                    ) : (
                      msg.content
                    )}
                  </Typography>
                </Paper>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, px: 0.5 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                    {msg.createdAt ? formatTime(msg.createdAt) : ''}
                  </Typography>
                  {msg.emotionDetected && msg.emotionDetected !== 'neutral' && (
                    <Chip
                      label={msg.emotionDetected}
                      size="small"
                      sx={{
                        height: 18, fontSize: '0.65rem',
                        bgcolor: `${emotionColors[msg.emotionDetected] || '#94a3b8'}22`,
                        color: emotionColors[msg.emotionDetected] || '#94a3b8',
                        border: `1px solid ${emotionColors[msg.emotionDetected] || '#94a3b8'}44`,
                      }}
                    />
                  )}
                </Box>
              </Box>
              {msg.role === 'user' && (
                <Avatar sx={{
                  width: 32, height: 32, ml: 1, mt: 0.5,
                  background: 'linear-gradient(135deg, #16a34a, #4ade80)',
                  fontSize: '0.8rem'
                }}>
                  <Person sx={{ fontSize: 18 }} />
                </Avatar>
              )}
            </Box>
          ))
        )}
        {loading && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }} className="animate-fadeIn">
            <Avatar sx={{
              width: 32, height: 32,
              background: 'linear-gradient(135deg, #0f766e, #14b8a6)',
            }}>
              <SmartToy sx={{ fontSize: 18 }} />
            </Avatar>
            <Paper sx={{ p: 2, borderRadius: 3, display: 'flex', gap: 0.8 }}>
              <span className="typing-dot" style={{ color: '#0f766e' }} />
              <span className="typing-dot" style={{ color: '#0f766e' }} />
              <span className="typing-dot" style={{ color: '#0f766e' }} />
            </Paper>
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input */}
      <Box sx={{
        px: { xs: 2, md: 3 }, py: 2,
        borderTop: '1px solid',
        borderColor: 'divider',
        background: 'rgba(15,118,110,0.02)',
      }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end', maxWidth: 800, mx: 'auto' }}>
          <TextField
            fullWidth multiline maxRows={4}
            placeholder="Share what's on your mind..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 4,
                background: 'rgba(15,118,110,0.03)',
              }
            }}
          />
          <IconButton
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            sx={{
              width: 48, height: 48,
              background: 'linear-gradient(135deg, #0f766e, #14b8a6)',
              color: 'white',
              '&:hover': { background: 'linear-gradient(135deg, #115e59, #0d9488)' },
              '&:disabled': { background: 'rgba(15,118,110,0.2)', color: 'rgba(255,255,255,0.3)' },
            }}
          >
            <Send />
          </IconButton>
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 1, fontSize: '0.7rem' }}>
          MindWell is an AI companion, not a therapist. If you're in crisis, call 988 (Suicide Prevention Lifeline).
        </Typography>
      </Box>
    </Box>
  );
}

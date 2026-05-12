import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('mindwell_user') || 'null');
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// Chat
export const chatAPI = {
  send: (message) => api.post('/chat/send', { message }),
  getHistory: (page = 1) => api.get(`/chat/history?page=${page}`),
  clear: () => api.delete('/chat/clear'),
};

// Mood
export const moodAPI = {
  create: (data) => api.post('/mood', data),
  getAll: (params) => api.get('/mood', { params }),
  getStats: (days = 30) => api.get(`/mood/stats?days=${days}`),
  update: (id, data) => api.put(`/mood/${id}`, data),
  delete: (id) => api.delete(`/mood/${id}`),
};

// Journal
export const journalAPI = {
  create: (data) => api.post('/journal', data),
  getAll: (params) => api.get('/journal', { params }),
  get: (id) => api.get(`/journal/${id}`),
  update: (id, data) => api.put(`/journal/${id}`, data),
  delete: (id) => api.delete(`/journal/${id}`),
  getPrompt: () => api.post('/journal/prompt'),
};

// Analytics
export const analyticsAPI = {
  getMoodTrends: (days = 30) => api.get(`/analytics/mood-trends?days=${days}`),
  getEmotionFrequency: (days = 30) => api.get(`/analytics/emotion-frequency?days=${days}`),
  getWellnessScore: () => api.get('/analytics/wellness-score'),
  getInsights: () => api.get('/analytics/insights'),
};

export default api;

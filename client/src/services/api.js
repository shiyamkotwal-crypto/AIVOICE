import axios from 'axios';

// Resolve dynamic API Base URL safely across local dev, Render, and Vercel
const resolveApiBaseUrl = () => {
  const envUrl = (import.meta.env.VITE_API_URL || '').trim();
  if (envUrl) {
    const cleanUrl = envUrl.replace(/\/+$/, '');
    return cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
  }
  // In dev or single-origin production, default to relative /api
  return '/api';
};

const api = axios.create({
  baseURL: resolveApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 90000,
});

// Request Interceptor: attach JWT token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('voicebridge_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: handle 401 unauth
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and user if unauthorized
      localStorage.removeItem('voicebridge_token');
      localStorage.removeItem('voicebridge_user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/' && window.location.pathname !== '/signup') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  signup: async (data) => {
    const res = await api.post('/auth/signup', data);
    return res.data;
  },
  login: async (data) => {
    const res = await api.post('/auth/login', data);
    return res.data;
  },
  demoLogin: async (role = 'student') => {
    const res = await api.post('/auth/demo', { role });
    return res.data;
  },
  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },
};

export const chatAPI = {
  sendMessage: async ({ conversation_id, message, language, domain, persona, is_voice }) => {
    const res = await api.post('/chat', {
      conversation_id,
      message,
      language,
      domain,
      persona,
      is_voice,
    });
    return res.data;
  },
  getConversations: async (language) => {
    const params = language && language !== 'all' ? { language } : {};
    const res = await api.get('/conversations', { params });
    return res.data;
  },
  getChatHistory: async (userId, language) => {
    const params = language && language !== 'all' ? { language } : {};
    const res = await api.get(`/chat/history/${userId}`, { params });
    return res.data;
  },
  getConversation: async (id) => {
    const res = await api.get(`/conversations/${id}`);
    return res.data;
  },
  createConversation: async ({ title, language, domain }) => {
    const res = await api.post('/conversations', { title, language, domain });
    return res.data;
  },
  deleteConversation: async (id) => {
    const res = await api.delete(`/conversations/${id}`);
    return res.data;
  },
  markAudioPlayed: async (messageId) => {
    const res = await api.patch(`/messages/${messageId}/audio-played`);
    return res.data;
  },
};

export const analyticsAPI = {
  getAnalytics: async () => {
    const res = await api.get('/analytics');
    return res.data;
  },
};

export const domainAPI = {
  getDomains: async () => {
    const res = await api.get('/domains');
    return res.data;
  },
};

export const healthAPI = {
  checkHealth: async () => {
    const res = await api.get('/health');
    return res.data;
  },
};

export default api;

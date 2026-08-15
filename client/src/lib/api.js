import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Content Assets
export const contentApi = {
  getAll: (params) => api.get('/content-assets', { params }),
  getById: (id) => api.get(`/content-assets/${id}`),
  create: (data) => api.post('/content-assets', data),
  update: (id, data) => api.put(`/content-assets/${id}`, data),
  updateStatus: (id, data) => api.patch(`/content-assets/${id}/status`, data),
  delete: (id) => api.delete(`/content-assets/${id}`),
};

// Tasks
export const taskApi = {
  getAll: (params) => api.get('/tasks', { params }),
  getById: (id) => api.get(`/tasks/${id}`),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  moveColumn: (id, column) => api.patch(`/tasks/${id}/column`, { column }),
  delete: (id) => api.delete(`/tasks/${id}`),
  getStandup: () => api.get('/tasks/standup'),
};

// Dashboard
export const dashboardApi = {
  get: () => api.get('/dashboard'),
};

// Chatbot
export const chatApi = {
  send: (message, context) => api.post('/chatbot', { message, context }),
  getHistory: (limit) => api.get('/chatbot/history', { params: { limit } }),
  clearHistory: () => api.delete('/chatbot/history'),
};

export default api;

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v2';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Contacts API
export const contactsApi = {
  list: (params = {}) => api.get('/contacts', { params }),
  get: (id) => api.get(`/contacts/${id}`),
  create: (data) => api.post('/contacts', data),
  update: (id, data) => api.put(`/contacts/${id}`, data),
  delete: (id) => api.delete(`/contacts/${id}`),
  import: (data) => {
    const config = data instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
    return api.post('/contacts/upload', data, config);
  },
};

// Campaigns API
export const campaignsApi = {
  list: () => api.get('/campaigns'),
  get: (id) => api.get(`/campaigns/${id}`),
  create: (data) => api.post('/campaigns', data),
  update: (id, data) => api.put(`/campaigns/${id}`, data),
  delete: (id) => api.delete(`/campaigns/${id}`),
  send: (id) => api.post(`/campaigns/${id}/send`),
  addContacts: (id, contactIds) => api.post(`/campaigns/${id}/contacts`, { contactIds }),
  getContacts: (id) => api.get(`/campaigns/${id}/contacts`),
};

// Scraper API
export const scraperApi = {
  googleMaps: (data) => api.post('/scraper/google-maps', data),
  status: (jobId) => api.get(`/scraper/status/${jobId}`),
};

// WhatsApp API
export const whatsappApi = {
  test: (data) => api.post('/whatsapp/test', data),
  status: () => api.get('/whatsapp/status'),
  webhook: (data) => api.post('/webhooks/evolution', data),
};

// Evolution API
export const evolutionApi = {
  getSettings: () => api.get('/evolution/settings'),
  updateSettings: (data) => api.post('/evolution/settings', data),
  testConnection: () => api.post('/evolution/test-connection'),
  getInstanceStatus: () => api.get('/evolution/instance/status'),
  fetchInstances: () => api.get('/evolution/instances'),
  createInstance: (data) => api.post('/evolution/instances', data),
  updateInstance: (id, data) => api.put(`/evolution/instances/${id}`, data),
  deleteInstance: (id) => api.delete(`/evolution/instances/${id}`),
  connection: (instanceId) => api.get(`/evolution/connection/${instanceId}`),
  restart: (instanceId) => api.post(`/evolution/restart/${instanceId}`),
  logout: (instanceId) => api.post(`/evolution/logout/${instanceId}`),
  qr: (instanceId) => api.get(`/evolution/qr/${instanceId}`),
};

// Logs API
export const logsApi = {
  list: (params = {}) => api.get('/logs', { params }),
};

// Health check
export const healthCheck = () => api.get('/health');

// Auth API
export const authApi = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout')
};

export default api;
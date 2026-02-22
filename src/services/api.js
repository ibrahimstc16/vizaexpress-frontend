import axios from 'axios';

const API_URL = 'https://vizaexpress-backend-production.up.railway.app/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const getApplications = () => api.get('/applications');
export const createApplication = (data) => api.post('/applications', data);
export const getApplication = (id) => api.get(`/applications/${id}`);

// Document upload - doğru endpoint
export const uploadDocument = (applicationId, formData) => {
  formData.append('applicationId', applicationId);
  return api.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

// Payment
export const createCheckoutSession = (data) => api.post('/payments/create-checkout-session', data);
export const verifyPayment = (sessionId) => api.get(`/payments/verify/${sessionId}`);

export default api;
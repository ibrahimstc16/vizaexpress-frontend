import axios from 'axios';

const API_URL = 'https://vizaexpress-backend.onrender.com/api';

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
export const uploadDocument = (applicationId, formData) => 
  api.post(`/applications/${applicationId}/documents`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

// Payment
export const createCheckoutSession = (data) => api.post('/payments/create-checkout-session', data);
export const verifyPayment = (sessionId) => api.get(`/payments/verify/${sessionId}`);

export default api;
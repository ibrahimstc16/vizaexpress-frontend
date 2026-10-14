import axios from 'axios';

export const API_URL = (import.meta.env.VITE_API_URL || 'https://vizaexpress-backend-production.up.railway.app/api').replace(/\/$/, '');

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

export const session = {
  getToken() {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  getUser() {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
    } catch {
      return null;
    }
  },
  save(token, user) {
    try {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch {
      // Without storage the user stays logged in until the tab closes.
    }
  },
  clear() {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch {
      // Nothing to clear.
    }
  },
};

const api = axios.create({ baseURL: API_URL, timeout: 30000 });

api.interceptors.request.use((config) => {
  const token = session.getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let onUnauthorized = null;
export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const isAuthCall = error.config?.url?.startsWith('/auth/login') || error.config?.url?.startsWith('/auth/register');
    if (status === 401 && !isAuthCall && session.getToken()) {
      session.clear();
      onUnauthorized?.();
    }
    return Promise.reject(error);
  }
);

// Turns an axios error into a message key or server message for the UI.
export function errorMessage(error, t) {
  if (!error?.response) return t('common.networkError');
  if (error.response.status === 429) return t('auth.errors.tooMany');
  if (error.response.status >= 500) return t('common.genericError');
  return error.response.data?.error || t('common.genericError');
}

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};

export const applicationsApi = {
  list: () => api.get('/applications'),
  create: (packageType) => api.post('/applications', { packageType }),
  get: (id) => api.get(`/applications/${id}`),
};

export const documentsApi = {
  upload: (applicationId, documentType, file, { language, onProgress } = {}) => {
    const form = new FormData();
    form.append('applicationId', applicationId);
    form.append('documentType', documentType);
    if (language) form.append('language', language);
    form.append('file', file);
    return api.post('/documents/upload', form, {
      timeout: 120000,
      onUploadProgress: (e) => e.total && onProgress?.(Math.round((e.loaded / e.total) * 100)),
    });
  },
  file: async (id) => {
    const res = await api.get(`/documents/${id}/file`, { responseType: 'blob' });
    return { blob: res.data, contentType: res.headers['content-type'] };
  },
};

export const paymentsApi = {
  checkout: (packageType, applicationId) => api.post('/payments/create-checkout-session', { packageType, applicationId }),
  verify: (sessionId) => api.get(`/payments/verify/${sessionId}`),
};

export const contactApi = {
  send: (data) => api.post('/contact', data),
};

export const adminApi = {
  stats: () => api.get('/admin/stats'),
  applications: () => api.get('/admin/applications'),
  application: (id) => api.get(`/admin/applications/${id}`),
  updateStatus: (id, status) => api.put(`/admin/applications/${id}/status`, { status }),
  users: () => api.get('/admin/users'),
};

export default api;

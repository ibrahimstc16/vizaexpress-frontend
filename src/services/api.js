import axios from 'axios';
import { SITE } from '../config/site';

// Set at build time from VITE_API_URL after vite.config.js has checked it
// against deploy/apiEnvironments.js. null means this build has no API, and
// every request is refused before it leaves the browser.
export const API_URL = __API_URL__;

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

let onUnauthorized = null;
export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

// Automatic retries, only for reads: a GET can be sent again without side
// effects. Writes (sign-in, registration, upload, payment) are never repeated;
// the person decides. A read is retried after a network failure or a
// temporary server error, never after a timeout (it already waited), a
// refusal (4xx, including 429), maintenance or a switched-off feature.
export const RETRY_DELAYS_MS = [1000, 2000];
const MAX_RETRY_AFTER_S = 5;
const TRANSIENT_STATUS = new Set([502, 503, 504]);
const TRANSIENT_CODES = new Set([undefined, 'RATE_LIMIT_UNAVAILABLE']);

export function isTimeout(error) {
  return error?.code === 'ECONNABORTED' || error?.code === 'ETIMEDOUT';
}

// Seconds from a Retry-After header, or null. The API must list Retry-After
// in Access-Control-Expose-Headers for a page on another origin to read it.
export function retryAfterSeconds(error) {
  const value = Number(error?.response?.headers?.['retry-after']);
  return Number.isFinite(value) && value >= 0 ? value : null;
}

export function retryDelay(error, attempt) {
  const config = error?.config;
  if (!config || (config.method || 'get').toLowerCase() !== 'get') return null;
  if (config.retry === false || attempt >= RETRY_DELAYS_MS.length) return null;
  if (error.code === 'API_NOT_CONFIGURED' || axios.isCancel(error) || isTimeout(error)) return null;
  if (!error.response) return RETRY_DELAYS_MS[attempt];
  if (!TRANSIENT_STATUS.has(error.response.status) || !TRANSIENT_CODES.has(error.response.data?.code)) return null;
  const wait = retryAfterSeconds(error);
  if (wait === null) return RETRY_DELAYS_MS[attempt];
  return wait <= MAX_RETRY_AFTER_S ? wait * 1000 : null;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// The client for one API address; null refuses every request before it is
// sent. Exported for the unit tests, which use a synthetic address.
export function createApi(apiUrl) {
  const client = axios.create({ baseURL: apiUrl ?? undefined, timeout: 30000 });

  client.interceptors.request.use((config) => {
    if (!apiUrl) {
      const error = new Error('This build is not connected to an API');
      error.code = 'API_NOT_CONFIGURED';
      throw error;
    }
    const token = session.getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const status = error.response?.status;
      const isAuthCall = error.config?.url?.startsWith('/auth/login') || error.config?.url?.startsWith('/auth/register');
      if (status === 401 && !isAuthCall && session.getToken()) {
        session.clear();
        onUnauthorized?.();
      }
      const attempt = error.config?.retryAttempt || 0;
      const delay = retryDelay(error, attempt);
      if (delay === null) throw error;
      await sleep(delay);
      return client.request({ ...error.config, retryAttempt: attempt + 1 });
    }
  );
  return client;
}

const api = createApi(API_URL);

// Answers the API gives with a code of its own: maintenance, a switched-off
// feature, or too many requests.
const CODE_MESSAGES = {
  MAINTENANCE: 'apiErrors.maintenance',
  REGISTRATION_DISABLED: 'apiErrors.registrationDisabled',
  PAYMENTS_DISABLED: 'apiErrors.paymentsDisabled',
  RATE_LIMIT_UNAVAILABLE: 'apiErrors.busy',
};

// The message for an answer the API explains with a code, a timeout or a
// 429, or null when the caller should decide (for example a 401 at sign-in).
export function knownErrorMessage(error, t) {
  if (error?.code === 'API_NOT_CONFIGURED') return t('common.apiNotConfigured');
  if (isTimeout(error)) return t('apiErrors.timeout');
  const response = error?.response;
  if (!response) return null;
  const code = response.data?.code;
  if (code === 'MAINTENANCE') return t(CODE_MESSAGES.MAINTENANCE, { email: SITE.supportEmail });
  if (CODE_MESSAGES[code]) return t(CODE_MESSAGES[code]);
  if (response.status === 429 || code === 'RATE_LIMITED') {
    const wait = retryAfterSeconds(error);
    return wait
      ? t('apiErrors.rateLimited', { minutes: Math.max(1, Math.ceil(wait / 60)) })
      : t('apiErrors.rateLimitedNoTime');
  }
  return null;
}

// Turns an axios error into a message for the UI.
export function errorMessage(error, t) {
  const known = knownErrorMessage(error, t);
  if (known) return known;
  if (!error?.response) return t('common.networkError');
  const { status } = error.response;
  if (status === 401) return t('apiErrors.sessionExpired');
  if (status === 403) return t('apiErrors.forbidden');
  if (status === 503) return t('apiErrors.unavailable');
  if (status >= 500) return t('common.genericError');
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

import axios from 'axios';

// ─────────────────────────────────────────────────────────────────────────────
// Axios instance — single shared client for all API calls
// ─────────────────────────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  timeout: 65000, // 65s global max to allow AI routes. Backend timeout middleware handles shorter limits.
  withCredentials: true,
});

// CSRF temporarily disabled for Vercel/Render cross-origin deployment
// export const fetchCsrfToken = async () => { ... }

// ── Request interceptor ───────────────────────────────────────────────────────
api.interceptors.request.use((config) => {
  // Timing logs are dev-only — not shipped to production
  if (process.env.NODE_ENV !== 'production') {
    const id = Math.random().toString(36).substring(7);
    config.metadata = { id };
    console.time(`API: ${config.url} [${id}]`);
  }
  return config;
});

// ── Response interceptor ─────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV !== 'production' && response.config.metadata) {
      const { id } = response.config.metadata;
      console.timeEnd(`API: ${response.config.url} [${id}]`);
    }
    return response;
  },
  (error) => {
    // Log timing even on error (dev only)
    if (
      process.env.NODE_ENV !== 'production' &&
      error.config?.metadata
    ) {
      const { id } = error.config.metadata;
      console.timeEnd(`API: ${error.config.url} [${id}]`);
    }

    // ── 401: unauthorized — force logout ──────────────────────
    if (error.response?.status === 401) {
      // Hard redirect — avoids stale React state from a partially-auth'd session
      if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
        window.location.href = '/login';
      }
    }

    // Distinguish Network Failure / Timeout / Server Offline
    if (!error.response) {
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        error.customMessage = 'Request timed out. Please try again.';
      } else {
        error.customMessage = 'Network Error: Cannot connect to server.';
      }
    } else {
      error.customMessage = error.response?.data?.message || error.message;
    }

    return Promise.reject(error);
  },
);

export default api;

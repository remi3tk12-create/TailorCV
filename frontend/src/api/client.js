import axios from 'axios';

// In production (when served by the backend on the same origin), use relative /api path.
// In Vite dev mode, Vite proxies /api requests to the backend (configured in vite.config.js).
const API_BASE = import.meta.env.PROD ? '/api' : 'http://localhost:3000/api';

const client = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically inject JWT auth token if available in localStorage
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default client;

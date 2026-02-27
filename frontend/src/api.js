import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  const url = config.url || '';
  const isAuthEndpoint = url.includes('/login/') || url.includes('/register/');

  if (token && !isAuthEndpoint) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

// If token is invalid/expired, clear it so user can log in again.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.detail;
    if (typeof message === 'string' && message.toLowerCase().includes('invalid token')) {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      localStorage.removeItem('is_staff');
      localStorage.removeItem('user_id');
    }
    return Promise.reject(error);
  }
);

export default api;

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    Accept: 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      const p = window.location.pathname;
      if (!p.startsWith('/login') && !p.startsWith('/register') && !p.startsWith('/auth/callback')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;

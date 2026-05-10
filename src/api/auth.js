import api from './axios';

export const login = (payload) => api.post('/auth/login', payload);
export const register = (payload) => api.post('/auth/register', payload);
export const logout = () => api.post('/auth/logout');
export const me = () => api.get('/auth/me');
export const updateProfile = (payload) => api.patch('/auth/profile', payload);
export const googleRedirectUrl = () =>
  `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/auth/google/redirect`;

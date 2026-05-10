import api from './axios';

export const listLoyaltyRules = () => api.get('/loyalty/rules');
export const createLoyaltyRule = (payload) => api.post('/loyalty/rules', payload);
export const updateLoyaltyRule = (id, payload) => api.put(`/loyalty/rules/${id}`, payload);
export const listLoyaltyCards = () => api.get('/loyalty/cards');
export const downloadLoyaltyPdf = (id) =>
  `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/loyalty/cards/${id}/pdf`;
export const myLoyaltyCard = () => api.get('/loyalty/my-card');

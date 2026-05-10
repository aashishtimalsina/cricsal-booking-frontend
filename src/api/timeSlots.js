import api from './axios';

export const listTimeSlots = () => api.get('/time-slots');
export const createTimeSlot = (payload) => api.post('/time-slots', payload);
export const updateTimeSlot = (id, payload) => api.put(`/time-slots/${id}`, payload);
export const deleteTimeSlot = (id) => api.delete(`/time-slots/${id}`);

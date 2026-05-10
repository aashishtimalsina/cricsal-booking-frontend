import api from './axios';

export const reportBookings = (params) => api.get('/reports/bookings', { params });
export const reportAcademy = (params) => api.get('/reports/academy', { params });

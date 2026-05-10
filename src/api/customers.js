import api from './axios';

export const customerBookingOverview = (params) => api.get('/customers/booking-overview', { params });

export const customerBookingOverviewById = (userId) => api.get(`/customers/booking-overview/${userId}`);

import api from './axios';

export const listActivityLogs = (params) => api.get('/activity-logs', { params });

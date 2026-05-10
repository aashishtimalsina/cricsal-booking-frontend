import api from './axios';

export const dashboardSummary = () => api.get('/dashboard/summary');
export const expiringStudents = () => api.get('/dashboard/expiring-students');

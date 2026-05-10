import api from './axios';

export const sendSmsToStudent = (studentId, message) =>
  api.post(`/sms/send/${studentId}`, message ? { message } : {});
export const listSmsLogs = (params) => api.get('/sms/logs', { params });

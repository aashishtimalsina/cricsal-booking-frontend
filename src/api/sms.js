import api from './axios';

export const sendSmsToStudent = (studentId, message) =>
  api.post(`/sms/send/${studentId}`, message ? { message } : {});
/** Manual payment reminder (smspasal); optional `message` in body (max 720 chars). */
export const sendStudentPaymentReminder = (studentId, body = {}) =>
  api.post(`/students/${studentId}/sms/payment-reminder`, body);
export const listSmsLogs = (params) => api.get('/sms/logs', { params });

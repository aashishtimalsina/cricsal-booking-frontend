import api from './axios';

export const listStudents = (params) => api.get('/students', { params });
export const createStudent = (payload, config) => api.post('/students', payload, config);
export const getStudent = (id) => api.get(`/students/${id}`);
export const updateStudent = (id, payload, config) => api.put(`/students/${id}`, payload, config);
export const listStudentPayments = (id) => api.get(`/students/${id}/payments`);
export const addStudentPayment = (id, payload) => api.post(`/students/${id}/payments`, payload);
export const deleteStudent = (id) => api.delete(`/students/${id}`);

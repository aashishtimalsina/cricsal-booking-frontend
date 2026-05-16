import api from './axios';

export const getSlotAvailability = (params) =>
  api.get('/bookings/slot-availability', { params });

export const listBookings = (params) => api.get('/bookings', { params });
export const createBooking = (payload) => api.post('/bookings', payload);
export const customerBooking = (payload, config) => api.post('/bookings/customer', payload, config);
export const myBookings = () => api.get('/bookings/my');
export const getBooking = (id) => api.get(`/bookings/${id}`);
export const confirmBooking = (id) => api.put(`/bookings/${id}/confirm`);
export const rejectBooking = (id, reason) => api.put(`/bookings/${id}/reject`, { reason });
/** @param {string | { payment_status: string; payment_amount?: number | string }} paymentOrPayload */
export const updateBookingPayment = (id, paymentOrPayload) =>
  api.put(
    `/bookings/${id}/payment`,
    typeof paymentOrPayload === 'string' ? { payment_status: paymentOrPayload } : paymentOrPayload
  );
export const cancelBooking = (id, reason) =>
  api.put(`/bookings/${id}/cancel`, reason ? { reason } : {});

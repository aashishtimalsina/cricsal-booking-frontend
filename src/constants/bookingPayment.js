/** Booking payment_status values — order is display order (paid first). */
export const BOOKING_PAYMENT_STATUSES = [
  { value: 'paid', label: 'Paid' },
  { value: 'partial', label: 'Advance' },
  { value: 'pending', label: 'Pending' },
];

export const DEFAULT_BOOKING_PAYMENT_STATUS = 'paid';

export function bookingPaymentStatusLabel(value) {
  return BOOKING_PAYMENT_STATUSES.find((x) => x.value === value)?.label ?? value;
}

/** Paid or advance (partial) — amount and screenshot required. */
export function bookingRequiresPaymentProof(status) {
  return status === 'paid' || status === 'partial';
}

import { bookingPaymentStatusLabel } from '../../constants/bookingPayment';

const styles = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  rejected: 'bg-red-100 text-red-800',
  paid: 'bg-green-100 text-green-800',
  partial: 'bg-blue-100 text-blue-800',
};

const PAYMENT_STATUS_KEYS = new Set(['pending', 'paid', 'partial']);

export default function StatusBadge({ status }) {
  const key = String(status || '').toLowerCase();
  const cls = styles[key] || 'bg-gray-100 text-gray-800';
  const label = PAYMENT_STATUS_KEYS.has(key) ? bookingPaymentStatusLabel(key) : status;
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>{label}</span>;
}

import { useQuery } from '@tanstack/react-query';
import { Navigate } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import { myBookings } from '../../api/bookings';
import useAuthStore from '../../store/authStore';
import { formatCurrency } from '../../utils/formatCurrency';

export default function MyBookings() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);

  const { data, isLoading } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: async () => (await myBookings()).data,
    enabled: !!token && user?.role === 'customer',
  });

  if (!token) return <Navigate to="/login" replace />;
  if (user && user.role !== 'customer') return <Navigate to="/admin/dashboard" replace />;

  const rows = data?.data ?? [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <PageHeader title="My bookings" />
      {isLoading ? (
        <p className="text-gray-600">Loading…</p>
      ) : (
        <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Slot</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((b) => (
                <tr key={b.id} className="border-t border-gray-100">
                  <td className="px-4 py-3">{b.id}</td>
                  <td className="px-4 py-3">{b.booking_date}</td>
                  <td className="px-4 py-3">{b.time_slot}</td>
                  <td className="px-4 py-3">{formatCurrency(b.payment_amount)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={b.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

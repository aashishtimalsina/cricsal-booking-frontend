import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import LoyaltyPointsUsed from '../../components/ui/LoyaltyPointsUsed';
import { customerBookingOverviewById } from '../../api/customers';
import { formatCurrency } from '../../utils/formatCurrency';

export default function CustomerBookingDetail() {
  const { userId } = useParams();

  const { data: row, isLoading, isError, error } = useQuery({
    queryKey: ['customer-booking-overview', userId],
    queryFn: async () => (await customerBookingOverviewById(userId)).data.data,
    enabled: Boolean(userId),
  });

  if (isLoading) {
    return <p className="text-gray-600">Loading…</p>;
  }

  if (isError) {
    const status = error?.response?.status;
    return (
      <div className="space-y-4">
        <p className="text-red-700">{status === 404 ? 'Customer not found or has no bookings.' : 'Could not load this customer.'}</p>
        <Link
          to="/admin/customers/bookings"
          className="inline-flex rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-semibold text-stone-800 shadow-sm hover:bg-stone-50"
        >
          Back to list
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeader
          title={row.name}
          subtitle={`${row.email} · ${row.phone || '—'} · ${row.bookings_count} bookings (${row.confirmed_bookings_count} confirmed)`}
        />
        <Link
          to="/admin/customers/bookings"
          className="inline-flex shrink-0 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-semibold text-stone-800 shadow-sm hover:bg-stone-50"
        >
          ← Back to customer list
        </Link>
      </div>

      <div className="grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-gray-50 px-3 py-2 ring-1 ring-gray-100">
          <p className="text-xs text-gray-500">Total booked amount</p>
          <p className="font-semibold text-gray-900">{formatCurrency(row.total_payment_amount)}</p>
        </div>
        <div className="rounded-lg bg-amber-50 px-3 py-2 ring-1 ring-amber-100">
          <p className="text-xs text-amber-900/80">Loyalty points redeemed (all bookings)</p>
          <p className="font-semibold text-amber-950">{row.total_loyalty_points_redeemed}</p>
          <p className="mt-1 text-[11px] leading-snug text-amber-900/70">
            Sum of “Pts used” in each row. <strong className="font-medium">0</strong> means no points were applied when
            those bookings were created (not the same as current card balance).
          </p>
        </div>
        {row.loyalty_card ? (
          <>
            <div className="rounded-lg bg-gray-50 px-3 py-2 ring-1 ring-gray-100">
              <p className="text-xs text-gray-500">Card</p>
              <p className="font-mono text-sm font-medium text-emerald-900">{row.loyalty_card.card_number}</p>
            </div>
            <div className="rounded-lg bg-gray-50 px-3 py-2 ring-1 ring-gray-100">
              <p className="text-xs text-gray-500">Points (total / redeemable)</p>
              <p className="font-semibold text-gray-900">
                {row.loyalty_card.total_points} / {row.loyalty_card.redeemable_points}{' '}
                <span className="text-xs font-normal capitalize text-gray-500">({row.loyalty_card.tier})</span>
              </p>
            </div>
          </>
        ) : (
          <div className="rounded-lg bg-gray-50 px-3 py-2 sm:col-span-2 lg:col-span-2 ring-1 ring-gray-100">
            <p className="text-xs text-gray-500">Loyalty</p>
            <p className="text-sm text-gray-600">No loyalty card yet.</p>
          </div>
        )}
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-3 py-2">Date</th>
              <th className="px-3 py-2">Slot</th>
              <th className="px-3 py-2">Hrs</th>
              <th className="px-3 py-2">Amount</th>
              <th className="px-3 py-2">Pay</th>
              <th className="px-3 py-2" title="Points the customer redeemed on that booking">
                Pts used
              </th>
              <th className="px-3 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {(row.bookings ?? []).map((b) => (
              <tr key={b.id} className="border-t border-gray-100">
                <td className="px-3 py-2 whitespace-nowrap">{b.booking_date}</td>
                <td className="px-3 py-2">{b.time_slot}</td>
                <td className="px-3 py-2">{b.hours}</td>
                <td className="px-3 py-2">{formatCurrency(b.payment_amount)}</td>
                <td className="px-3 py-2">
                  <StatusBadge status={b.payment_status} />
                </td>
                <td className="px-3 py-2">
                  <LoyaltyPointsUsed value={b.loyalty_points_used} />
                </td>
                <td className="px-3 py-2">
                  <StatusBadge status={b.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-center text-sm text-gray-500">
        <Link to="/admin/bookings" className="font-medium text-emerald-700 hover:text-emerald-900">
          All bookings
        </Link>
      </p>
    </div>
  );
}

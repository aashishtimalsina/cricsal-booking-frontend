import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import PageHeader from '../../components/ui/PageHeader';
import { listActivityLogs } from '../../api/activityLogs';

const ACTION_LABELS = {
  'booking.created': 'Booking created',
  'booking.confirmed': 'Booking confirmed',
  'booking.rejected': 'Booking rejected',
  'booking.cancelled': 'Booking cancelled',
  'booking.payment_updated': 'Booking payment updated',
  'student.created': 'Student created',
  'student.updated': 'Student updated',
  'student.deleted': 'Student deleted',
  'student_payment.recorded': 'Student payment recorded',
  'user.created': 'User created',
  'user.updated': 'User updated',
  'user.deleted': 'User deleted',
};

function formatAction(action) {
  return ACTION_LABELS[action] || action;
}

export default function ActivityLogs() {
  const [action, setAction] = useState('');
  const [userId, setUserId] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['activity-logs', action, userId, start, end],
    queryFn: async () =>
      (
        await listActivityLogs({
          action: action || undefined,
          user_id: userId || undefined,
          start_date: start || undefined,
          end_date: end || undefined,
        })
      ).data,
  });

  const rows = data?.data ?? [];

  return (
    <div>
      <PageHeader
        title="Activity logs"
        subtitle="Who confirmed bookings, created students, recorded payments, and other admin actions"
      />
      <div className="mb-4 flex flex-wrap gap-3">
        <select
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          value={action}
          onChange={(e) => setAction(e.target.value)}
        >
          <option value="">All actions</option>
          {Object.entries(ACTION_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <input
          type="number"
          min={1}
          placeholder="User ID"
          className="w-28 rounded-lg border border-gray-300 px-3 py-2 text-sm"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />
        <input
          type="date"
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          value={start}
          onChange={(e) => setStart(e.target.value)}
        />
        <input
          type="date"
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
        />
      </div>
      {isLoading ? (
        <p className="text-gray-600">Loading…</p>
      ) : (
        <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">When</th>
                <th className="px-4 py-3">User ID</th>
                <th className="px-4 py-3">Actor</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Summary</th>
                <th className="px-4 py-3">Subject</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No activity logged yet.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="border-t border-gray-100">
                    <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                      {r.created_at ? new Date(r.created_at).toLocaleString() : '—'}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{r.user_id ?? '—'}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{r.user_name || 'System'}</div>
                      {r.user_email && (
                        <div className="text-xs text-gray-500">{r.user_email}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-800">
                        {formatAction(r.action)}
                      </span>
                    </td>
                    <td className="max-w-md px-4 py-3 text-gray-800">{r.summary}</td>
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-gray-600">
                      {r.subject_type ? `${r.subject_type} #${r.subject_id}` : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

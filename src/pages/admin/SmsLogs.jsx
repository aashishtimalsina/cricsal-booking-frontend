import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import PageHeader from '../../components/ui/PageHeader';
import { listSmsLogs } from '../../api/sms';

export default function SmsLogs() {
  const [status, setStatus] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['sms-logs', status, start, end],
    queryFn: async () => (await listSmsLogs({ status: status || undefined, start_date: start || undefined, end_date: end || undefined })).data,
  });
  const rows = data?.data ?? [];

  return (
    <div>
      <PageHeader title="SMS logs" />
      <div className="mb-4 flex flex-wrap gap-3">
        <select className="rounded-lg border border-gray-300 px-3 py-2 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All</option>
          <option value="sent">Sent</option>
          <option value="failed">Failed</option>
        </select>
        <input type="date" className="rounded-lg border border-gray-300 px-3 py-2 text-sm" value={start} onChange={(e) => setStart(e.target.value)} />
        <input type="date" className="rounded-lg border border-gray-300 px-3 py-2 text-sm" value={end} onChange={(e) => setEnd(e.target.value)} />
      </div>
      {isLoading ? (
        <p className="text-gray-600">Loading…</p>
      ) : (
        <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Message</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 max-w-[14rem]">Gateway</th>
                <th className="px-4 py-3">Sent</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-gray-100">
                  <td className="px-4 py-3">{r.recipient_name || r.reference_display_name || '—'}</td>
                  <td className="px-4 py-3">{r.recipient_phone}</td>
                  <td className="max-w-xs truncate px-4 py-3">{r.message}</td>
                  <td className="px-4 py-3">{r.status}</td>
                  <td className="max-w-[14rem] truncate px-4 py-3 font-mono text-xs text-gray-600" title={r.gateway_response || ''}>
                    {r.gateway_response
                      ? String(r.gateway_response).replace(/^smspasal http=\d+ body=/, '')
                      : '—'}
                  </td>
                  <td className="px-4 py-3">{r.sent_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

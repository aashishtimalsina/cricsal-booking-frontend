import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { listTimeSlots, createTimeSlot, deleteTimeSlot } from '../../api/timeSlots';
import { useToast } from '../../context/ToastContext';

export default function TimeSlots() {
  const { showToast } = useToast();
  const qc = useQueryClient();
  const [form, setForm] = useState({ label: '', start_time: '08:00', end_time: '09:00' });

  const { data, isLoading } = useQuery({
    queryKey: ['time-slots-admin'],
    queryFn: async () => (await listTimeSlots()).data,
  });
  const rows = data?.data ?? [];

  async function add(e) {
    e.preventDefault();
    try {
      await createTimeSlot(form);
      showToast('Slot added');
      setForm({ label: '', start_time: '08:00', end_time: '09:00' });
      qc.invalidateQueries({ queryKey: ['time-slots-admin'] });
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed');
    }
  }

  async function remove(id) {
    try {
      await deleteTimeSlot(id);
      qc.invalidateQueries({ queryKey: ['time-slots-admin'] });
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed');
    }
  }

  return (
    <div>
      <PageHeader title="Time slots" />
      <form className="mb-6 flex flex-wrap items-end gap-3 rounded-xl bg-white p-4 shadow-sm" onSubmit={add}>
        <Input label="Label" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} required />
        <Input label="Start" type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} required />
        <Input label="End" type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} required />
        <Button type="submit">Add</Button>
      </form>
      {isLoading ? (
        <p className="text-gray-600">Loading…</p>
      ) : (
        <ul className="divide-y divide-gray-100 rounded-xl bg-white shadow-sm">
          {rows.map((s) => (
            <li key={s.id} className="flex items-center justify-between px-4 py-3 text-sm">
              <span>
                {s.label} ({s.start_time}-{s.end_time}) {s.is_active ? '' : '— inactive'}
              </span>
              <Button variant="danger" className="!py-1 !text-xs" onClick={() => remove(s.id)}>
                Delete
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

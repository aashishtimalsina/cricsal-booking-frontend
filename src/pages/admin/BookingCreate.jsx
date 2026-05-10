import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { createBooking } from '../../api/bookings';
import { useToast } from '../../context/ToastContext';

export default function BookingCreate() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    booking_date: '',
    time_slot: '',
    hours: 1,
    payment_status: 'pending',
    payment_amount: 0,
    notes: '',
  });

  async function onSubmit(e) {
    e.preventDefault();
    try {
      await createBooking({
        ...form,
        hours: Number(form.hours),
        payment_amount: Number(form.payment_amount),
      });
      showToast('Booking created');
      navigate('/admin/bookings');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed');
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title="Create booking (admin)" />
      <form className="space-y-3 rounded-xl bg-white p-6 shadow-sm" onSubmit={onSubmit}>
        <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
        <Input label="Booking date" type="date" value={form.booking_date} onChange={(e) => setForm({ ...form, booking_date: e.target.value })} required />
        <Input
          label="Start slot label (exactly as in time slots, e.g. 09:00-10:00)"
          value={form.time_slot}
          onChange={(e) => setForm({ ...form, time_slot: e.target.value })}
          required
        />
        <Input label="Consecutive hours" type="number" min={1} max={24} value={form.hours} onChange={(e) => setForm({ ...form, hours: e.target.value })} required />
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-gray-700">Payment status</span>
          <select
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            value={form.payment_status}
            onChange={(e) => setForm({ ...form, payment_status: e.target.value })}
          >
            <option value="pending">pending</option>
            <option value="paid">paid</option>
            <option value="partial">partial</option>
          </select>
        </label>
        <Input
          label="Payment amount"
          type="number"
          min={0}
          step="0.01"
          value={form.payment_amount}
          onChange={(e) => setForm({ ...form, payment_amount: e.target.value })}
          required
        />
        <Input label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        <Button type="submit" className="w-full">
          Save
        </Button>
      </form>
    </div>
  );
}

import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Input, { fieldClass } from '../../components/ui/Input';
import { createBooking } from '../../api/bookings';
import { listTimeSlots } from '../../api/timeSlots';
import { useToast } from '../../context/ToastContext';

const selectClass = `${fieldClass} cursor-pointer appearance-none pr-10 disabled:cursor-not-allowed`;
const selectPlainClass =
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500';

function parseSlotTimes(label) {
  const m = String(label).match(/^(\d{2}:\d{2})-(\d{2}:\d{2})$/);
  if (!m) return null;
  return { start: m[1], end: m[2] };
}

function formatBlockRange(slots, startIndex, hours) {
  const h = Math.max(1, Math.min(24, Math.floor(Number(hours)) || 1));
  if (startIndex < 0 || startIndex + h > slots.length) return null;
  const first = parseSlotTimes(slots[startIndex].label);
  const last = parseSlotTimes(slots[startIndex + h - 1].label);
  if (!first || !last) return slots[startIndex]?.label ?? '';
  return `${first.start}–${last.end}`;
}

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
    status: 'pending',
    notes: '',
  });
  const [submitError, setSubmitError] = useState(null);

  const { data: slotsRes, isLoading: slotsLoading } = useQuery({
    queryKey: ['time-slots', 'admin'],
    queryFn: async () => (await listTimeSlots()).data,
  });
  const slots = useMemo(() => {
    const raw = slotsRes?.data;
    return Array.isArray(raw) ? raw : [];
  }, [slotsRes]);

  const hoursClamped = Math.max(1, Math.min(24, Number(form.hours) || 1));

  const selectedRangePreview = useMemo(() => {
    if (!form.time_slot || !slots.length) return null;
    const idx = slots.findIndex((s) => s.label === form.time_slot);
    if (idx < 0 || idx + hoursClamped > slots.length) return null;
    return formatBlockRange(slots, idx, hoursClamped);
  }, [form.time_slot, hoursClamped, slots]);

  function setHoursAndMaybeClearSlot(h) {
    setSubmitError(null);
    const hoursNum = Math.max(1, Math.min(24, Number(h) || 1));
    setForm((prev) => {
      let time_slot = prev.time_slot;
      if (slots.length && time_slot) {
        const idx = slots.findIndex((s) => s.label === time_slot);
        if (idx < 0 || idx + hoursNum > slots.length) {
          time_slot = '';
        }
      }
      return { ...prev, hours: hoursNum, time_slot };
    });
  }

  async function onSubmit(e) {
    e.preventDefault();
    try {
      await createBooking({
        ...form,
        email: form.email.trim() || null,
        hours: Number(form.hours),
        payment_amount: Number(form.payment_amount),
      });
      setSubmitError(null);
      showToast('Booking created');
      navigate('/admin/bookings');
    } catch (err) {
      const data = err.response?.data;
      const message = data?.message || 'Failed';
      const conflicts = Array.isArray(data?.conflicts) ? data.conflicts : [];
      setSubmitError({ message, conflicts });
      showToast(message);
    }
  }

  return (
    <div className="w-full min-w-0 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link to="/admin/bookings" className="text-sm font-medium text-emerald-700 hover:text-emerald-900">
          ← Back to bookings
        </Link>
      </div>
      <PageHeader
        title="New booking"
        subtitle="Walk-in or phone bookings: phone is required; email is optional when the guest has none. Confirmation emails are skipped without a valid email — use SMS or call instead."
      />

      <form
        className="grid w-full grid-cols-1 gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm sm:grid-cols-2 sm:gap-5 sm:p-6 lg:grid-cols-3 lg:gap-x-6 lg:gap-y-5 lg:p-8"
        onSubmit={onSubmit}
      >
        <p className="text-xs leading-relaxed text-gray-500 sm:col-span-2 lg:col-span-3">
          Without a valid email, pending / confirmed / rejected emails are not sent — contact the guest by phone or SMS.
        </p>

        {submitError && (
          <div
            role="alert"
            className="rounded-lg border border-amber-200 bg-amber-50 p-4 sm:col-span-2 lg:col-span-3"
          >
            <p className="text-sm font-semibold text-amber-950">{submitError.message}</p>
            {submitError.conflicts.length > 0 && (
              <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-amber-900">
                {submitError.conflicts.map((c) => (
                  <li key={c.id}>
                    <span className="font-medium">{c.name}</span>
                    <span className="text-amber-800/90">
                      {' '}
                      — {c.status}
                      {c.time_slot ? (
                        <>
                          {' '}
                          · slot {c.time_slot}
                          {c.hours > 1 ? ` (${c.hours}h)` : ''}
                        </>
                      ) : null}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <Input label="Customer name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <Input
          label="Email (optional)"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="Phone-only: leave blank"
        />
        <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />

        <Input
          label="Booking date"
          type="date"
          value={form.booking_date}
          onChange={(e) => {
            setSubmitError(null);
            setForm({ ...form, booking_date: e.target.value });
          }}
          required
        />
        <Input
          label="Consecutive hours"
          type="number"
          min={1}
          max={24}
          value={form.hours}
          onChange={(e) => setHoursAndMaybeClearSlot(e.target.value)}
          required
        />

        <div className="flex min-h-0 flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700" htmlFor="admin-booking-shift">
            Shift (start)
          </label>
          <p className="text-xs text-gray-500">First slot label matches your time-slot config.</p>
          <div className="relative mt-0.5">
            <select
              id="admin-booking-shift"
              className={selectClass}
              value={form.time_slot}
              onChange={(e) => {
                setSubmitError(null);
                setForm({ ...form, time_slot: e.target.value });
              }}
              required
              disabled={slotsLoading}
            >
              <option value="">{slotsLoading ? 'Loading slots…' : 'Select start shift'}</option>
              {slots.map((s, i) => {
                const valid = i + hoursClamped <= slots.length;
                const display = valid
                  ? formatBlockRange(slots, i, hoursClamped)
                  : `${parseSlotTimes(s.label)?.start ?? s.label} (not enough slots for ${hoursClamped}h)`;
                return (
                  <option key={s.id} value={s.label} disabled={!valid}>
                    {display}
                  </option>
                );
              })}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">▾</span>
          </div>
          {selectedRangePreview && (
            <p className="text-xs font-medium text-emerald-800">
              Session: <span className="font-mono">{selectedRangePreview}</span>
            </p>
          )}
        </div>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-gray-700">Payment status</span>
          <select
            className={selectPlainClass}
            value={form.payment_status}
            onChange={(e) => setForm({ ...form, payment_status: e.target.value })}
          >
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="partial">Partial</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-gray-700">Booking status</span>
          <select className={selectPlainClass} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="pending">Pending (email if provided)</option>
            <option value="confirmed">Confirmed (email if provided)</option>
          </select>
        </label>

        <Input
          label="Payment amount (NPR)"
          type="number"
          min={0}
          step="0.01"
          value={form.payment_amount}
          onChange={(e) => setForm({ ...form, payment_amount: e.target.value })}
          required
        />

        <div className="sm:col-span-2 lg:col-span-3">
          <Input label="Notes (optional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </div>

        <div className="flex flex-wrap gap-3 border-t border-gray-100 pt-4 sm:col-span-2 lg:col-span-3">
          <Button type="submit" className="min-w-[8rem]">
            Create booking
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate('/admin/bookings')}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

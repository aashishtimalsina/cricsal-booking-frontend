import { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import StatusBadge from '../../components/ui/StatusBadge';
import {
  listBookings,
  confirmBooking,
  rejectBooking,
  updateBookingPayment,
  cancelBooking,
} from '../../api/bookings';
import { formatCurrency } from '../../utils/formatCurrency';
import { useToast } from '../../context/ToastContext';

function buildPageList(current, last) {
  if (last <= 1) return [1];
  if (last <= 9) {
    return Array.from({ length: last }, (_, i) => i + 1);
  }
  const set = new Set([1, last]);
  for (let d = -2; d <= 2; d++) {
    const p = current + d;
    if (p >= 1 && p <= last) set.add(p);
  }
  return [...set].sort((a, b) => a - b);
}

export default function BookingList() {
  const { showToast } = useToast();
  const qc = useQueryClient();
  const [params, setParams] = useSearchParams();
  const status = params.get('status') || '';
  const [search, setSearch] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [page, setPage] = useState(1);
  const [paymentEdit, setPaymentEdit] = useState(null);
  const [paymentAmountDraft, setPaymentAmountDraft] = useState('');
  const [paymentSaving, setPaymentSaving] = useState(false);
  const [detail, setDetail] = useState(null);
  const [rejectId, setRejectId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [cancelId, setCancelId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  const queryKey = useMemo(() => ['bookings', status, search, start, end, page], [status, search, start, end, page]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey,
    queryFn: async () =>
      (
        await listBookings({
          page,
          status: status || undefined,
          search: search || undefined,
          start_date: start || undefined,
          end_date: end || undefined,
        })
      ).data,
  });

  const rows = data?.data ?? [];
  const meta = data?.meta;
  const pageList = useMemo(() => {
    if (!meta?.last_page) return [];
    return buildPageList(meta.current_page, meta.last_page);
  }, [meta]);

  const canPrev = meta && meta.current_page > 1;
  const canNext = meta && meta.current_page < meta.last_page;

  useEffect(() => {
    setPage(1);
  }, [status, search, start, end]);

  function openPaymentModal(b) {
    setPaymentEdit(b);
    setPaymentAmountDraft(String(b.payment_amount ?? '0'));
  }

  function closePaymentModal() {
    if (paymentSaving) return;
    setPaymentEdit(null);
  }

  function parsePaymentDraft() {
    const n = Number(paymentAmountDraft);
    if (Number.isNaN(n) || n < 0) return null;
    return n;
  }

  async function onSavePaymentModal() {
    const b = paymentEdit;
    if (!b) return;
    const amount = parsePaymentDraft();
    if (amount === null) {
      showToast('Enter a valid amount (NPR)');
      return;
    }
    setPaymentSaving(true);
    try {
      await updateBookingPayment(b.id, { payment_status: b.payment_status, payment_amount: amount });
      showToast('Amount saved');
      qc.invalidateQueries({ queryKey: ['bookings'] });
      setDetail((d) => (d && d.id === b.id ? { ...d, payment_amount: String(amount) } : d));
      setPaymentEdit(null);
    } catch (e) {
      showToast(e.response?.data?.message || 'Failed to save amount');
    } finally {
      setPaymentSaving(false);
    }
  }

  async function onMarkPaidModal() {
    const b = paymentEdit;
    if (!b) return;
    const amount = parsePaymentDraft();
    if (amount === null) {
      showToast('Enter a valid amount (NPR)');
      return;
    }
    setPaymentSaving(true);
    try {
      await updateBookingPayment(b.id, { payment_status: 'paid', payment_amount: amount });
      showToast('Marked as paid');
      qc.invalidateQueries({ queryKey: ['bookings'] });
      setDetail((d) => (d && d.id === b.id ? { ...d, payment_status: 'paid', payment_amount: String(amount) } : d));
      setPaymentEdit(null);
    } catch (e) {
      showToast(e.response?.data?.message || 'Failed to update payment');
    } finally {
      setPaymentSaving(false);
    }
  }

  async function onMarkPartialModal() {
    const b = paymentEdit;
    if (!b) return;
    const amount = parsePaymentDraft();
    if (amount === null) {
      showToast('Enter a valid amount (NPR)');
      return;
    }
    setPaymentSaving(true);
    try {
      await updateBookingPayment(b.id, { payment_status: 'partial', payment_amount: amount });
      showToast('Marked as partial payment');
      qc.invalidateQueries({ queryKey: ['bookings'] });
      setDetail((d) => (d && d.id === b.id ? { ...d, payment_status: 'partial', payment_amount: String(amount) } : d));
      setPaymentEdit(null);
    } catch (e) {
      showToast(e.response?.data?.message || 'Failed to update payment');
    } finally {
      setPaymentSaving(false);
    }
  }

  async function onConfirm(id) {
    try {
      await confirmBooking(id);
      showToast('Booking confirmed');
      qc.invalidateQueries({ queryKey: ['bookings'] });
      setDetail(null);
    } catch (e) {
      showToast(e.response?.data?.message || 'Failed');
    }
  }

  async function onReject() {
    try {
      await rejectBooking(rejectId, rejectReason);
      showToast('Booking rejected');
      qc.invalidateQueries({ queryKey: ['bookings'] });
      setRejectId(null);
      setRejectReason('');
      setDetail(null);
    } catch (e) {
      showToast(e.response?.data?.message || 'Failed');
    }
  }

  async function onCancelBooking() {
    try {
      await cancelBooking(cancelId, cancelReason.trim() || undefined);
      showToast('Booking cancelled');
      qc.invalidateQueries({ queryKey: ['bookings'] });
      setCancelId(null);
      setCancelReason('');
      setDetail(null);
    } catch (e) {
      showToast(e.response?.data?.message || 'Failed');
    }
  }

  return (
    <div>
      <div className="mb-2">
        <Link to="/admin/dashboard" className="text-sm font-medium text-emerald-700 hover:text-emerald-900">
          ← Back to dashboard
        </Link>
      </div>
      <PageHeader title="Bookings" subtitle="Manage ground reservations" />
      <div className="mb-4 flex flex-wrap gap-3">
        <select
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          value={status}
          onChange={(e) => {
            const v = e.target.value;
            const next = new URLSearchParams(params);
            if (v) next.set('status', v);
            else next.delete('status');
            setParams(next);
            setPage(1);
          }}
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
          <option value="rejected">Rejected</option>
        </select>
        <Input
          label=""
          placeholder="Search name"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <input
          type="date"
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          value={start}
          onChange={(e) => {
            setStart(e.target.value);
            setPage(1);
          }}
        />
        <input
          type="date"
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          value={end}
          onChange={(e) => {
            setEnd(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {isLoading ? (
        <p className="text-gray-600">Loading…</p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Slot</th>
                  <th className="px-4 py-3">Hrs</th>
                  <th className="px-4 py-3">Amount (NPR)</th>
                  <th className="px-4 py-3">Pay</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((b) => {
                  const paymentLocked = ['cancelled', 'rejected'].includes(b.status);
                  return (
                    <tr key={b.id} className="border-t border-gray-100">
                      <td className="px-4 py-3">{b.id}</td>
                      <td className="px-4 py-3">{b.name}</td>
                      <td className="px-4 py-3">{b.booking_date}</td>
                      <td className="px-4 py-3">{b.time_slot}</td>
                      <td className="px-4 py-3">{b.hours}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`font-medium tabular-nums ${paymentLocked ? 'text-gray-500' : 'text-gray-900'}`}
                        >
                          {formatCurrency(b.payment_amount)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={b.payment_status} />
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={b.status} />
                      </td>
                      <td className="space-x-2 px-4 py-3">
                        <Button variant="ghost" className="!px-2 !py-1 !text-xs" onClick={() => setDetail(b)}>
                          View
                        </Button>
                        {!paymentLocked && (
                          <Button variant="ghost" className="!px-2 !py-1 !text-xs text-emerald-800" onClick={() => openPaymentModal(b)}>
                            Payment
                          </Button>
                        )}
                        {b.status === 'pending' && (
                          <>
                            <Button variant="primary" className="!px-2 !py-1 !text-xs" onClick={() => onConfirm(b.id)}>
                              Confirm
                            </Button>
                            <Button variant="danger" className="!px-2 !py-1 !text-xs" onClick={() => setRejectId(b.id)}>
                              Reject
                            </Button>
                          </>
                        )}
                        {(b.status === 'pending' || b.status === 'confirmed') && (
                          <Button variant="ghost" className="!px-2 !py-1 !text-xs text-red-700" onClick={() => setCancelId(b.id)}>
                            Cancel
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {meta && meta.total > 0 && (
            <div className="mt-4 space-y-3 rounded-xl border border-gray-100 bg-white px-4 py-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-gray-600">
                  Showing {(meta.from ?? 0) || 0}–{meta.to ?? 0} of {meta.total}
                  {meta.last_page > 1 ? (
                    <span className="text-gray-500">
                      {' '}
                      · Page {meta.current_page} of {meta.last_page}
                    </span>
                  ) : null}
                  {isFetching ? <span className="ml-2 text-emerald-700">Updating…</span> : null}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" className="!text-sm" disabled={!canPrev || isFetching} onClick={() => setPage(1)}>
                    First
                  </Button>
                  <Button variant="secondary" className="!text-sm" disabled={!canPrev || isFetching} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                    Previous
                  </Button>
                  <Button variant="secondary" className="!text-sm" disabled={!canNext || isFetching} onClick={() => setPage((p) => p + 1)}>
                    Next
                  </Button>
                  <Button variant="secondary" className="!text-sm" disabled={!canNext || isFetching} onClick={() => setPage(meta.last_page)}>
                    Last
                  </Button>
                </div>
              </div>
              {meta.last_page > 1 && pageList.length > 0 && (
                <div className="flex flex-wrap items-center gap-1 border-t border-gray-100 pt-3">
                  <span className="mr-2 text-xs font-medium uppercase text-gray-500">Jump to</span>
                  {pageList.flatMap((p, idx) => {
                    const prev = pageList[idx - 1];
                    const nodes = [];
                    if (idx > 0 && p - prev > 1) {
                      nodes.push(
                        <span key={`ellipsis-${p}`} className="px-1 text-gray-400" aria-hidden>
                          …
                        </span>
                      );
                    }
                    nodes.push(
                      <button
                        key={p}
                        type="button"
                        disabled={isFetching || p === meta.current_page}
                        onClick={() => setPage(p)}
                        className={`min-w-[2.25rem] rounded-lg px-2 py-1 text-sm font-medium ${
                          p === meta.current_page
                            ? 'bg-emerald-600 text-white'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200 disabled:opacity-50'
                        }`}
                      >
                        {p}
                      </button>
                    );
                    return nodes;
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}

      <Modal open={!!detail} title={`Booking #${detail?.id}`} onClose={() => setDetail(null)}>
        {detail && (
          <div className="space-y-3 text-sm">
            <div className="flex flex-wrap gap-2">
              <StatusBadge status={detail.status} />
              <StatusBadge status={detail.payment_status} />
            </div>
            <p>
              <strong>Date:</strong> {detail.booking_date}
            </p>
            <p>
              <strong>Slot:</strong> {detail.time_slot} ({detail.hours}h)
            </p>
            <p>
              <strong>Amount:</strong> {formatCurrency(detail.payment_amount)}
            </p>
            <p>
              <strong>Name:</strong> {detail.name}
            </p>
            <p>
              <strong>Email:</strong> {detail.email}
            </p>
            <p>
              <strong>Phone:</strong> {detail.phone}
            </p>
            <p>
              <strong>Notes:</strong> {detail.notes || '—'}
            </p>
            {detail.rejection_reason && (detail.status === 'rejected' || detail.status === 'cancelled') && (
              <p className="rounded-lg bg-gray-50 p-2 text-gray-700">
                <strong>{detail.status === 'cancelled' ? 'Cancellation note:' : 'Reason:'}</strong> {detail.rejection_reason}
              </p>
            )}
            {detail.payment_screenshot_url && (
              <a href={detail.payment_screenshot_url} target="_blank" rel="noreferrer" className="text-green-700 underline">
                View payment screenshot
              </a>
            )}
            <div className="flex flex-wrap gap-2 border-t border-gray-100 pt-3">
              {!['cancelled', 'rejected'].includes(detail.status) && (
                <Button
                  variant="secondary"
                  className="!text-xs"
                  onClick={() => {
                    const d = detail;
                    setDetail(null);
                    openPaymentModal(d);
                  }}
                >
                  Record payment…
                </Button>
              )}
              {(detail.status === 'pending' || detail.status === 'confirmed') && (
                <Button
                  variant="danger"
                  className="!text-xs"
                  onClick={() => {
                    setCancelId(detail.id);
                    setDetail(null);
                  }}
                >
                  Cancel booking
                </Button>
              )}
              {detail.status === 'pending' && (
                <>
                  <Button variant="primary" className="!text-xs" onClick={() => onConfirm(detail.id)}>
                    Confirm
                  </Button>
                  <Button variant="danger" className="!text-xs" onClick={() => setRejectId(detail.id)}>
                    Reject
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={!!paymentEdit}
        title="Record payment"
        onClose={closePaymentModal}
        footer={
          <div className="flex w-full min-w-0 flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button variant="secondary" onClick={closePaymentModal} disabled={paymentSaving}>
              Close
            </Button>
            <div className="flex flex-wrap justify-end gap-2">
              <Button variant="secondary" className="!text-sm" onClick={onSavePaymentModal} disabled={paymentSaving}>
                Save amount
              </Button>
              <Button variant="secondary" className="!text-sm" onClick={onMarkPartialModal} disabled={paymentSaving}>
                Mark partial
              </Button>
              <Button
                variant="primary"
                className="!text-sm"
                onClick={onMarkPaidModal}
                disabled={paymentSaving || paymentEdit?.payment_status === 'paid'}
              >
                Mark paid
              </Button>
            </div>
          </div>
        }
      >
        {paymentEdit && (
          <>
            <div className="rounded-xl border border-gray-200/80 bg-gradient-to-b from-slate-50 to-white p-4 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Booking</p>
              <p className="mt-1.5 text-base font-semibold text-gray-900">
                #{paymentEdit.id} · {paymentEdit.name}
              </p>
              <p className="mt-1 text-sm text-gray-600">
                {paymentEdit.booking_date} · {paymentEdit.time_slot} · {paymentEdit.hours}h
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <StatusBadge status={paymentEdit.status} />
                <StatusBadge status={paymentEdit.payment_status} />
              </div>
            </div>
            <div>
              <label htmlFor="payment-modal-amount" className="mb-1.5 block text-sm font-medium text-gray-800">
                Amount (NPR)
              </label>
              <input
                id="payment-modal-amount"
                type="number"
                min={0}
                step="0.01"
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm tabular-nums shadow-sm outline-none ring-emerald-500/0 transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25"
                disabled={paymentSaving}
                value={paymentAmountDraft}
                onChange={(e) => setPaymentAmountDraft(e.target.value)}
              />
              <p className="mt-2 text-xs leading-relaxed text-gray-500">
                <strong className="font-medium text-gray-700">Save amount</strong> updates the NPR total and keeps the
                current payment status. <strong className="font-medium text-gray-700">Mark partial</strong> or{' '}
                <strong className="font-medium text-gray-700">Mark paid</strong> updates both the amount and the pay
                badge.
              </p>
            </div>
          </>
        )}
      </Modal>

      <Modal
        open={!!rejectId}
        title="Reject booking"
        onClose={() => setRejectId(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setRejectId(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={onReject}>
              Reject
            </Button>
          </>
        }
      >
        <Input label="Reason" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} required />
      </Modal>

      <Modal
        open={!!cancelId}
        title="Cancel booking"
        onClose={() => {
          setCancelId(null);
          setCancelReason('');
        }}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setCancelId(null);
                setCancelReason('');
              }}
            >
              Close
            </Button>
            <Button variant="danger" onClick={onCancelBooking}>
              Cancel booking
            </Button>
          </>
        }
      >
        <p className="mb-3 text-sm text-gray-600">
          Slots will be freed for this date. Confirmed bookings lose any loyalty points earned from that session, and any
          points spent on the booking are returned to the customer’s card. Pending bookings also have redeemed points
          restored.
        </p>
        <Input
          label="Note (optional)"
          placeholder="Shown on the booking record"
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
        />
      </Modal>
    </div>
  );
}

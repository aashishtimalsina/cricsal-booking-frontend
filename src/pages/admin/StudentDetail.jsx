import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import NepaliDateField from '../../components/ui/NepaliDateField';
import { getStudent, addStudentPayment } from '../../api/students';
import { formatCurrency } from '../../utils/formatCurrency';
import { resolveMediaUrl } from '../../utils/resolveMediaUrl';
import { useToast } from '../../context/ToastContext';
import {
  ACADEMY_PACKAGES,
  ACADEMY_PAYMENT_TYPES,
  ACADEMY_PAYMENT_CATEGORIES,
  academyPackageLabel,
  academyPaymentTypeLabel,
} from '../../constants/academy';

export default function StudentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToast();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [payNp, setPayNp] = useState('');
  const [pay, setPay] = useState({
    payment_date_en: '',
    amount: 0,
    payment_type: 'qr',
    payment_category: 'full',
    package: '1_month',
    notes: '',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['student', id],
    queryFn: async () => (await getStudent(id)).data,
  });
  const student = data?.data ?? data;

  useEffect(() => {
    if (searchParams.get('addPayment') !== '1') return;
    setOpen(true);
    const next = new URLSearchParams(searchParams);
    next.delete('addPayment');
    setSearchParams(next, { replace: true });
  }, [id, searchParams, setSearchParams]);

  async function submitPayment(e) {
    e.preventDefault();
    try {
      await addStudentPayment(id, { ...pay, payment_date_np: payNp, amount: Number(pay.amount) });
      showToast('Payment recorded');
      qc.invalidateQueries({ queryKey: ['student', id] });
      setOpen(false);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed');
    }
  }

  if (isLoading || !student) return <p className="text-gray-600">Loading…</p>;

  const payments = student.payments?.data ?? student.payments ?? [];

  return (
    <div>
      {student.photo_url && (
        <div className="mb-6 flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <img
            src={resolveMediaUrl(student.photo_url)}
            alt=""
            className="h-24 w-24 shrink-0 rounded-lg border border-gray-200 object-cover"
          />
          <div>
            <p className="text-sm font-medium text-gray-800">Student photo</p>
            <p className="text-xs text-gray-500">Shown on records and ID-style views.</p>
          </div>
        </div>
      )}
      <PageHeader
        title={student.full_name}
        subtitle={
          student.due_label
            ? `${student.student_code} · ${student.due_label}${student.package_end_date ? ` (ends ${student.package_end_date})` : ''}`
            : student.student_code
        }
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => navigate(`/admin/students/${id}/edit`)}>
              Edit student
            </Button>
            <Button onClick={() => setOpen(true)}>Add payment</Button>
          </div>
        }
      />
      <div className="rounded-xl bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-800">Payment timeline</h3>
        <ul className="mt-3 space-y-2 border-l-2 border-green-200 pl-4">
          {payments.map((p) => (
            <li key={p.id} className="text-sm text-gray-700">
              <span className="font-medium">{p.payment_date_np}</span> — {formatCurrency(p.amount)} (
              {p.package_label ?? academyPackageLabel(p.package)}, {p.payment_type_label ?? academyPaymentTypeLabel(p.payment_type)}) ends{' '}
              {p.package_end_date}
            </li>
          ))}
        </ul>
      </div>

      <Modal open={open} title="Add payment" onClose={() => setOpen(false)}>
        <form className="space-y-3" onSubmit={submitPayment}>
          <NepaliDateField label="Payment date (BS)" value={payNp} onChange={setPayNp} />
          <Input
            label="Payment date (AD)"
            type="date"
            value={pay.payment_date_en}
            onChange={(e) => setPay({ ...pay, payment_date_en: e.target.value })}
            required
          />
          <Input
            label="Amount"
            type="number"
            min={0}
            step="0.01"
            value={pay.amount}
            onChange={(e) => setPay({ ...pay, amount: e.target.value })}
            required
          />
          <fieldset className="text-sm">
            <legend className="font-medium">Payment type</legend>
            <div className="mt-1 flex flex-wrap gap-4">
              {ACADEMY_PAYMENT_TYPES.map(({ value, label }) => (
                <label key={value} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="payment_type"
                    checked={pay.payment_type === value}
                    onChange={() => setPay({ ...pay, payment_type: value })}
                  />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset className="text-sm">
            <legend className="font-medium">Category</legend>
            <div className="mt-1 flex flex-wrap gap-4">
              {ACADEMY_PAYMENT_CATEGORIES.map(({ value, label }) => (
                <label key={value} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="payment_category"
                    checked={pay.payment_category === value}
                    onChange={() => setPay({ ...pay, payment_category: value })}
                  />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-gray-700">Package</span>
            <select
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
              value={pay.package}
              onChange={(e) => setPay({ ...pay, package: e.target.value })}
            >
              {ACADEMY_PACKAGES.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <Input label="Notes" value={pay.notes} onChange={(e) => setPay({ ...pay, notes: e.target.value })} />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

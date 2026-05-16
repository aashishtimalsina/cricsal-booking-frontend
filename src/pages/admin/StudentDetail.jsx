import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { getStudent } from '../../api/students';
import { formatCurrency } from '../../utils/formatCurrency';
import { resolveMediaUrl } from '../../utils/resolveMediaUrl';
import StudentAddPaymentForm from '../../components/admin/StudentAddPaymentForm';
import {
  academyPackageLabel,
  academyPaymentTypeLabel,
  academyPaymentCategoryLabel,
} from '../../constants/academy';

export default function StudentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

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
              {p.package_label ?? academyPackageLabel(p.package)},{' '}
              {p.payment_type_label ?? academyPaymentTypeLabel(p.payment_type)},{' '}
              {p.payment_category_label ?? academyPaymentCategoryLabel(p.payment_category)}) ends{' '}
              {p.package_end_date}
            </li>
          ))}
        </ul>
      </div>

      <Modal open={open} title="Add payment" onClose={() => setOpen(false)}>
        <StudentAddPaymentForm
          studentId={id}
          onSuccess={() => {
            qc.invalidateQueries({ queryKey: ['student', id] });
            setOpen(false);
          }}
          onCancel={() => setOpen(false)}
        />
      </Modal>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import SlideOver from '../ui/SlideOver';
import Button from '../ui/Button';
import { getStudent } from '../../api/students';
import { formatCurrency } from '../../utils/formatCurrency';
import { resolveMediaUrl } from '../../utils/resolveMediaUrl';
import {
  academyPackageLabel,
  academyPaymentTypeLabel,
  academyPaymentCategoryLabel,
} from '../../constants/academy';
import StudentAddPaymentForm from './StudentAddPaymentForm';

function DetailRow({ label, value, mono }) {
  if (value == null || value === '') return null;
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
      <dt className="shrink-0 text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </dt>
      <dd
        className={`text-sm text-gray-900 ${mono ? 'font-mono' : ''} sm:text-right`}
      >
        {value}
      </dd>
    </div>
  );
}

function Section({ title, hint, children }) {
  return (
    <section className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        {hint && <p className="mt-0.5 text-xs text-gray-500">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

export default function StudentPaymentPanel({ studentId, onClose, startWithAddForm = false }) {
  const qc = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(startWithAddForm);

  useEffect(() => {
    setShowAddForm(startWithAddForm);
  }, [studentId, startWithAddForm]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['student', studentId],
    queryFn: async () => (await getStudent(studentId)).data,
    enabled: Boolean(studentId),
  });

  const student = data?.data ?? data;
  const payments = student?.payments?.data ?? student?.payments ?? [];
  const open = Boolean(studentId);

  function refreshStudent() {
    qc.invalidateQueries({ queryKey: ['student', studentId] });
    qc.invalidateQueries({ queryKey: ['students'] });
    setShowAddForm(false);
  }

  return (
    <SlideOver
      open={open}
      onClose={onClose}
      widthClass="max-w-2xl"
      title={student?.full_name ?? 'Student payments'}
      subtitle={
        student
          ? `${student.student_code}${student.due_label ? ` · ${student.due_label}` : ''}`
          : isLoading
            ? 'Loading…'
            : undefined
      }
    >
      {isLoading && <p className="text-sm text-gray-600">Loading student…</p>}
      {isError && (
        <p className="text-sm text-red-600">Could not load student details.</p>
      )}
      {student && (
        <div className="space-y-8">
          <div className="flex flex-wrap items-start gap-4">
            {student.photo_url ? (
              <img
                src={resolveMediaUrl(student.photo_url)}
                alt=""
                className="h-20 w-20 shrink-0 rounded-lg border border-gray-200 object-cover"
              />
            ) : (
              <div
                className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-gray-100 text-2xl font-semibold text-gray-400"
                aria-hidden
              >
                {student.full_name?.charAt(0) ?? '?'}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                {student.is_active ? (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
                    Active
                  </span>
                ) : (
                  <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700">
                    Inactive
                  </span>
                )}
                {student.package_payment_category === 'partial' && (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">
                    Partial pay
                  </span>
                )}
                {student.due_urgent && student.due_label && (
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800">
                    {student.due_label}
                  </span>
                )}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  to={`/admin/students/${student.id}`}
                  className="text-xs font-medium text-emerald-700 hover:underline"
                >
                  Full profile
                </Link>
                <span className="text-gray-300">·</span>
                <Link
                  to={`/admin/students/${student.id}/edit`}
                  className="text-xs font-medium text-emerald-700 hover:underline"
                >
                  Edit student
                </Link>
              </div>
            </div>
          </div>

          <Section title="Student details">
            <dl className="space-y-2.5 rounded-xl border border-gray-100 bg-gray-50/80 p-4">
              <DetailRow label="Code" value={student.student_code} mono />
              <DetailRow label="Phone" value={student.phone} />
              <DetailRow label="Guardian" value={student.guardian_name} />
              <DetailRow label="Address" value={student.address} />
              <DetailRow label="Registered (AD)" value={student.reg_date_en} />
              <DetailRow label="Registered (BS)" value={student.reg_date_np} />
              <DetailRow
                label="Admission charge"
                value={formatCurrency(student.admission_charge)}
              />
              <DetailRow
                label="Jersey charge"
                value={formatCurrency(student.jersey_charge)}
              />
              <DetailRow
                label="Current package"
                value={student.package_label ?? '—'}
              />
              <DetailRow
                label="Package ends"
                value={student.package_end_date ?? '—'}
              />
              <DetailRow label="Due status" value={student.due_label ?? '—'} />
            </dl>
          </Section>

          <Section
            title="Payment history"
            hint={`${payments.length} record${payments.length === 1 ? '' : 's'} — newest first`}
          >
            {payments.length === 0 ? (
              <p className="text-sm text-gray-500">No payments recorded yet.</p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="min-w-full text-left text-xs">
                  <thead className="bg-gray-50 text-[10px] uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="px-3 py-2">Date (BS)</th>
                      <th className="px-3 py-2">Date (AD)</th>
                      <th className="px-3 py-2">Amount</th>
                      <th className="px-3 py-2">Package</th>
                      <th className="px-3 py-2">Type</th>
                      <th className="px-3 py-2">Category</th>
                      <th className="px-3 py-2">Period</th>
                      <th className="px-3 py-2">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...payments].reverse().map((p) => (
                      <tr key={p.id} className="border-t border-gray-100">
                        <td className="px-3 py-2 font-medium text-gray-900">
                          {p.payment_date_np || '—'}
                        </td>
                        <td className="px-3 py-2 text-gray-700">
                          {p.payment_date_en || '—'}
                        </td>
                        <td className="px-3 py-2 font-medium text-gray-900">
                          {formatCurrency(p.amount)}
                        </td>
                        <td className="px-3 py-2 text-gray-700">
                          {p.package_label ?? academyPackageLabel(p.package)}
                        </td>
                        <td className="px-3 py-2 text-gray-700">
                          {p.payment_type_label ??
                            academyPaymentTypeLabel(p.payment_type)}
                        </td>
                        <td className="px-3 py-2 text-gray-700">
                          {p.payment_category_label ??
                            academyPaymentCategoryLabel(p.payment_category)}
                        </td>
                        <td className="px-3 py-2 text-gray-600">
                          {p.package_start_date && p.package_end_date
                            ? `${p.package_start_date} → ${p.package_end_date}`
                            : p.package_end_date ?? '—'}
                        </td>
                        <td className="max-w-[8rem] truncate px-3 py-2 text-gray-600">
                          {p.notes || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Section>

          <Section title="Add payment">
            {showAddForm ? (
              <StudentAddPaymentForm
                studentId={student.id}
                onSuccess={refreshStudent}
                onCancel={() => setShowAddForm(false)}
              />
            ) : (
              <Button type="button" onClick={() => setShowAddForm(true)}>
                Record new payment
              </Button>
            )}
          </Section>
        </div>
      )}
    </SlideOver>
  );
}

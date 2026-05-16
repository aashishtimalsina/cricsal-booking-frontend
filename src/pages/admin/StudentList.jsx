import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { listStudents, updateStudent, deleteStudent } from '../../api/students';
import { listSmsLogs, sendStudentPaymentReminder } from '../../api/sms';
import { useToast } from '../../context/ToastContext';
import { useCompany } from '../../context/CompanyContext';
import StudentPaymentPanel from '../../components/admin/StudentPaymentPanel';

/** First token of full name for short SMS salutation */
function studentFirstName(fullName) {
  const s = String(fullName ?? '').trim();
  if (!s) return 'Student';
  return s.split(/\s+/)[0];
}

/** Friendly manual reminder — short name + first name only */
function buildFriendlyPaymentReminderSms(company, student) {
  const abbr = String(company?.short_name ?? 'JCA').trim() || 'JCA';
  const first = studentFirstName(student?.full_name);
  return `From ${abbr}: Dear ${first}, package payment pending. Please pay soon. Thank you.`;
}

export default function StudentList() {
  const { showToast } = useToast();
  const qc = useQueryClient();
  const [smsStudent, setSmsStudent] = useState(null);
  const [paymentStudentId, setPaymentStudentId] = useState(null);
  const [smsMessage, setSmsMessage] = useState('');
  const [smsSending, setSmsSending] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const { company } = useCompany();
  const smsTemplatePreview =
    smsStudent != null
      ? buildFriendlyPaymentReminderSms(company, smsStudent)
      : '';

  const { data, isLoading } = useQuery({
    queryKey: ['students'],
    queryFn: async () => (await listStudents({})).data,
  });
  const rows = data?.data ?? [];

  const studentIdForLogs = smsStudent?.id;
  const { data: smsLogsData, isLoading: smsLogsLoading } = useQuery({
    queryKey: ['sms-logs', 'student', studentIdForLogs],
    queryFn: async () =>
      (await listSmsLogs({ student_id: studentIdForLogs })).data,
    enabled: Boolean(studentIdForLogs),
  });
  const smsLogRows = smsLogsData?.data ?? [];

  function openSmsModal(s) {
    setSmsStudent(s);
    setSmsMessage('');
  }

  function closeSmsModal() {
    setSmsStudent(null);
    setSmsMessage('');
    setSmsSending(false);
  }

  async function submitPaymentReminder() {
    if (!smsStudent) return;
    setSmsSending(true);
    try {
      const res = await sendStudentPaymentReminder(
        smsStudent.id,
        smsMessage.trim() ? { message: smsMessage.trim() } : {}
      );
      const data = res.data;
      if (data?.success === false) {
        showToast(
          data.failure_message ||
            data.reason ||
            "SMS was not accepted by the gateway"
        );
        qc.invalidateQueries({ queryKey: ["sms-logs", "student", smsStudent.id] });
        qc.invalidateQueries({ queryKey: ["sms-logs"] });
        qc.invalidateQueries({ queryKey: ["students"] });
        return;
      }
      showToast("Payment reminder SMS sent");
      qc.invalidateQueries({ queryKey: ["sms-logs", "student", smsStudent.id] });
      qc.invalidateQueries({ queryKey: ["sms-logs"] });
      qc.invalidateQueries({ queryKey: ["students"] });
      setSmsMessage("");
    } catch (e) {
      showToast(
        e.response?.data?.failure_message ||
          e.response?.data?.message ||
          "Failed to send SMS"
      );
    } finally {
      setSmsSending(false);
    }
  }

  async function markActive(id) {
    try {
      await updateStudent(id, { is_active: true });
      showToast('Student marked active');
      qc.invalidateQueries({ queryKey: ['students'] });
    } catch (e) {
      showToast(e.response?.data?.message || 'Failed');
    }
  }

  async function onDeleteStudent(s) {
    const ok = window.confirm(
      `Delete student ${s.full_name} (${s.student_code})? This cannot be undone and removes all payment records.`
    );
    if (!ok) return;
    setDeletingId(s.id);
    try {
      await deleteStudent(s.id);
      showToast('Student deleted');
      qc.invalidateQueries({ queryKey: ['students'] });
      if (smsStudent?.id === s.id) closeSmsModal();
      if (paymentStudentId === s.id) setPaymentStudentId(null);
    } catch (e) {
      showToast(e.response?.data?.message || 'Failed to delete');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <PageHeader
        title="Students"
        action={
          <Link to="/admin/students/new">
            <Button>New student</Button>
          </Link>
        }
      />
      {isLoading ? (
        <p className="text-gray-600">Loading…</p>
      ) : (
        <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Reg (AD)</th>
                <th className="px-4 py-3">Package</th>
                <th className="px-4 py-3">Due</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => (
                <tr key={s.id} className="border-t border-gray-100">
                  <td className="px-4 py-3">
                    <Link
                      className="text-green-700 hover:underline"
                      to={`/admin/students/${s.id}`}
                    >
                      {s.student_code}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{s.full_name}</td>
                  <td className="px-4 py-3">{s.phone}</td>
                  <td className="px-4 py-3">{s.reg_date_en}</td>
                  <td className="px-4 py-3">
                    {s.package_label ? (
                      <div className="flex flex-col gap-1">
                        <span className="text-gray-800">{s.package_label}</span>
                        {s.package_payment_category === 'partial' && (
                          <span className="w-fit rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-900">
                            Partial pay
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {s.due_label ? (
                      <span
                        className={
                          s.due_urgent
                            ? 'font-semibold text-red-600 animate-due-blink'
                            : 'text-gray-700'
                        }
                      >
                        {s.due_label}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {s.is_active ? (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
                        Active
                      </span>
                    ) : (
                      <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex flex-col items-end gap-1.5">
                      {s.has_sent_sms && (
                        <span
                          className="max-w-[11rem] rounded-full bg-slate-100 px-2 py-0.5 text-center text-[10px] font-semibold uppercase leading-tight tracking-wide text-slate-600"
                          title={
                            s.last_sms_sent_at
                              ? `Last successful SMS: ${new Date(s.last_sms_sent_at).toLocaleString()}`
                              : "At least one SMS was logged as sent for this student"
                          }
                        >
                          Already sent
                          {s.last_sms_sent_at ? (
                            <span className="mt-0.5 block font-normal normal-case text-slate-500">
                              {new Date(s.last_sms_sent_at).toLocaleDateString(
                                undefined,
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )}
                            </span>
                          ) : null}
                        </span>
                      )}
                      <div className="flex flex-wrap items-center justify-end gap-1.5">
                      {!s.is_active && (
                        <Button
                          variant="secondary"
                          className="!px-2 !py-1 !text-xs"
                          onClick={() => markActive(s.id)}
                        >
                          Mark active
                        </Button>
                      )}
                      <Button
                        variant="secondary"
                        className="!px-2 !py-1 !text-xs"
                        onClick={() => openSmsModal(s)}
                      >
                        SMS
                      </Button>
                      <Button
                        variant="primary"
                        className="!px-2 !py-1 !text-xs"
                        onClick={() => setPaymentStudentId(s.id)}
                      >
                        Payment
                      </Button>
                      <Button
                        variant="danger"
                        size="md"
                        className="!px-2 !py-1 !text-xs"
                        disabled={deletingId === s.id}
                        onClick={() => onDeleteStudent(s)}
                      >
                        {deletingId === s.id ? "…" : "Delete"}
                      </Button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <StudentPaymentPanel
        studentId={paymentStudentId}
        onClose={() => setPaymentStudentId(null)}
      />

      <Modal
        open={Boolean(smsStudent)}
        title={smsStudent ? `SMS · ${smsStudent.full_name}` : 'SMS'}
        onClose={closeSmsModal}
        footer={
          <>
            <Button variant="secondary" onClick={closeSmsModal}>
              Close
            </Button>
            <Button onClick={submitPaymentReminder} disabled={smsSending}>
              {smsSending ? 'Sending…' : 'Send payment reminder'}
            </Button>
          </>
        }
      >
        {smsStudent && (
          <>
            <p className="text-sm text-gray-600">
              Sends a manual payment reminder to{' '}
              <span className="font-mono font-medium text-gray-900">
                {smsStudent.phone}
              </span>{' '}
              via your configured SMS gateway. Leave the box below empty to use
              the server default, or write your own text (max 720 characters).
            </p>
            <div className="rounded-lg border border-emerald-100 bg-emerald-50/70 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-900">
                Suggested template
              </p>
              <p className="mt-1 text-xs text-emerald-900/85">
                Starts with your academy short name and uses the student&apos;s{' '}
                <span className="font-medium">first name only</span> — easy to
                edit after inserting.
              </p>
              <p className="mt-2 rounded-md border border-emerald-200/90 bg-white px-3 py-2 text-sm leading-relaxed text-gray-800">
                {smsTemplatePreview}
              </p>
              <Button
                type="button"
                variant="secondary"
                className="mt-2 !px-3 !py-1.5 !text-xs"
                onClick={() => setSmsMessage(smsTemplatePreview)}
              >
                Insert template
              </Button>
            </div>
            <Input
              label="Message (optional)"
              rows={4}
              value={smsMessage}
              onChange={(e) => setSmsMessage(e.target.value)}
              placeholder="Leave empty for server default, or tap Insert template above…"
              maxLength={720}
            />
            <div>
              <h3 className="text-sm font-semibold text-gray-800">
                Reminder history (this student)
              </h3>
              <p className="text-xs text-gray-500">
                Recent SMS logged for this student (newest first).
              </p>
              {smsLogsLoading ? (
                <p className="mt-2 text-sm text-gray-500">Loading logs…</p>
              ) : smsLogRows.length === 0 ? (
                <p className="mt-2 text-sm text-gray-500">No SMS logged yet.</p>
              ) : (
                <ul className="mt-2 max-h-52 space-y-2 overflow-y-auto rounded-lg border border-gray-100 bg-gray-50/80 p-3 text-xs">
                  {smsLogRows.map((r) => (
                    <li
                      key={r.id}
                      className="border-b border-gray-200/80 pb-2 last:border-0 last:pb-0"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-1">
                        <span
                          className={
                            r.status === 'sent'
                              ? 'font-medium text-emerald-800'
                              : 'font-medium text-red-700'
                          }
                        >
                          {r.status}
                        </span>
                        <span className="text-gray-500">
                          {r.sent_at
                            ? new Date(r.sent_at).toLocaleString()
                            : '—'}
                        </span>
                      </div>
                      <p className="mt-1 whitespace-pre-wrap text-gray-700">
                        {r.message}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}

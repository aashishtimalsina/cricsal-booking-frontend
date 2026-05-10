import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import { listStudents, updateStudent } from '../../api/students';
import { useToast } from '../../context/ToastContext';

export default function StudentList() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['students'],
    queryFn: async () => (await listStudents({})).data,
  });
  const rows = data?.data ?? [];

  async function markActive(id) {
    try {
      await updateStudent(id, { is_active: true });
      showToast('Student marked active');
      qc.invalidateQueries({ queryKey: ['students'] });
    } catch (e) {
      showToast(e.response?.data?.message || 'Failed');
    }
  }

  return (
    <div>
      <PageHeader title="Students" action={<Link to="/admin/students/new"><Button>New student</Button></Link>} />
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
                <th className="px-4 py-3">Due</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Payment</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => (
                <tr key={s.id} className="border-t border-gray-100">
                  <td className="px-4 py-3">
                    <Link className="text-green-700 hover:underline" to={`/admin/students/${s.id}`}>
                      {s.student_code}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{s.full_name}</td>
                  <td className="px-4 py-3">{s.phone}</td>
                  <td className="px-4 py-3">{s.reg_date_en}</td>
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
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      {!s.is_active && (
                        <Button variant="secondary" className="!px-2 !py-1 !text-xs" onClick={() => markActive(s.id)}>
                          Mark active
                        </Button>
                      )}
                      <Button
                        variant="primary"
                        className="!px-2 !py-1 !text-xs"
                        onClick={() => navigate(`/admin/students/${s.id}?addPayment=1`)}
                      >
                        Payment
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import NepaliDateField from '../../components/ui/NepaliDateField';
import { getStudent, updateStudent } from '../../api/students';
import { useToast } from '../../context/ToastContext';
import { resolveMediaUrl } from '../../utils/resolveMediaUrl';

export default function StudentEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { showToast } = useToast();
  const [regNp, setRegNp] = useState('');
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    guardian_name: '',
    address: '',
    reg_date_en: '',
    admission_charge: 0,
    jersey_charge: 0,
    is_active: true,
  });
  const [photo, setPhoto] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['student', id],
    queryFn: async () => (await getStudent(id)).data,
  });
  const student = data?.data ?? data;

  useEffect(() => {
    if (!student) return;
    setRegNp(student.reg_date_np || '');
    setForm({
      full_name: student.full_name || '',
      phone: student.phone || '',
      guardian_name: student.guardian_name || '',
      address: student.address || '',
      reg_date_en: student.reg_date_en || '',
      admission_charge: student.admission_charge ?? 0,
      jersey_charge: student.jersey_charge ?? 0,
      is_active: Boolean(student.is_active),
    });
  }, [student]);

  async function onSubmit(e) {
    e.preventDefault();
    try {
      if (photo) {
        const fd = new FormData();
        fd.append('full_name', form.full_name);
        fd.append('phone', form.phone);
        fd.append('guardian_name', form.guardian_name || '');
        fd.append('address', form.address || '');
        fd.append('reg_date_np', regNp);
        fd.append('reg_date_en', form.reg_date_en);
        fd.append('admission_charge', String(form.admission_charge));
        fd.append('jersey_charge', String(form.jersey_charge));
        fd.append('is_active', form.is_active ? '1' : '0');
        fd.append('photo', photo);
        await updateStudent(id, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await updateStudent(id, { ...form, reg_date_np: regNp });
      }
      showToast('Student updated');
      qc.invalidateQueries({ queryKey: ['students'] });
      qc.invalidateQueries({ queryKey: ['student', id] });
      navigate(`/admin/students/${id}`);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed');
    }
  }

  if (isLoading || !student) return <p className="text-gray-600">Loading…</p>;

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader
        title="Edit student"
        subtitle={student.student_code}
        action={
          <Button type="button" variant="secondary" onClick={() => navigate(`/admin/students/${id}`)}>
            Back to profile
          </Button>
        }
      />
      <form className="space-y-4 rounded-xl bg-white p-6 shadow-sm" onSubmit={onSubmit}>
        <Input label="Full name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
        <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
        <Input label="Guardian" value={form.guardian_name} onChange={(e) => setForm({ ...form, guardian_name: e.target.value })} />
        <Input label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        <NepaliDateField
          label="Registration date (BS)"
          value={regNp}
          onChange={setRegNp}
          onAdDateChange={(ad) => setForm((prev) => ({ ...prev, reg_date_en: ad }))}
        />
        <Input
          label="Registration date (AD)"
          type="date"
          value={form.reg_date_en}
          onChange={(e) => setForm({ ...form, reg_date_en: e.target.value })}
          required
        />
        <Input
          label="Admission charge"
          type="number"
          min={0}
          step="0.01"
          value={form.admission_charge}
          onChange={(e) => setForm({ ...form, admission_charge: e.target.value })}
          required
        />
        <Input
          label="Jersey charge"
          type="number"
          min={0}
          step="0.01"
          value={form.jersey_charge}
          onChange={(e) => setForm({ ...form, jersey_charge: e.target.value })}
          required
        />
        <label className="flex items-center gap-2 text-sm font-medium text-gray-800">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
          />
          Active student
        </label>
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Photo</p>
          {student.photo_url ? (
            <div className="flex items-start gap-4">
              <img
                src={resolveMediaUrl(student.photo_url)}
                alt=""
                className="h-28 w-28 rounded-xl border border-gray-200 object-cover shadow-sm"
              />
              <p className="text-xs text-gray-500">Current photo on file. Choose a new file below to replace it.</p>
            </div>
          ) : (
            <p className="text-xs text-gray-500">No photo uploaded yet.</p>
          )}
          <label className="block text-sm font-medium text-gray-700">
            Replace photo
            <input type="file" className="mt-1 block w-full text-sm" accept="image/*" onChange={(e) => setPhoto(e.target.files?.[0] || null)} />
          </label>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="secondary" className="flex-1" onClick={() => navigate(`/admin/students/${id}`)}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1">
            Save changes
          </Button>
        </div>
      </form>
    </div>
  );
}

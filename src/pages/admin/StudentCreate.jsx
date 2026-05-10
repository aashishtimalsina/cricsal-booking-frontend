import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import NepaliDateField from '../../components/ui/NepaliDateField';
import { createStudent } from '../../api/students';
import { useToast } from '../../context/ToastContext';

export default function StudentCreate() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [regNp, setRegNp] = useState('');
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    guardian_name: '',
    address: '',
    reg_date_en: '',
    admission_charge: 0,
    jersey_charge: 0,
  });
  const [photo, setPhoto] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    const fd = new FormData();
    Object.entries({ ...form, reg_date_np: regNp }).forEach(([k, v]) => fd.append(k, v));
    if (photo) fd.append('photo', photo);
    try {
      const { data } = await createStudent(fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      const student = data.data ?? data;
      showToast('Student saved');
      navigate(`/admin/students/${student.id}`);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed');
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title="New student" />
      <form className="space-y-4 rounded-xl bg-white p-6 shadow-sm" onSubmit={onSubmit}>
        <Input label="Full name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
        <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
        <Input label="Guardian" value={form.guardian_name} onChange={(e) => setForm({ ...form, guardian_name: e.target.value })} />
        <Input label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        <NepaliDateField label="Registration date (BS)" value={regNp} onChange={setRegNp} />
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
        <label className="text-sm font-medium text-gray-700">
          Photo
          <input type="file" className="mt-1 block w-full text-sm" accept="image/*" onChange={(e) => setPhoto(e.target.files?.[0] || null)} />
        </label>
        <Button type="submit" className="w-full">
          Save
        </Button>
      </form>
    </div>
  );
}

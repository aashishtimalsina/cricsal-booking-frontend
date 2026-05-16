import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { createUser } from '../../api/users';
import { useToast } from '../../context/ToastContext';

export default function UserCreate() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'customer',
  });

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await createUser(form);
      showToast('User created');
      navigate('/admin/users');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <PageHeader title="New user" subtitle="Create an admin or customer account" />
      <form className="space-y-4 rounded-xl bg-white p-6 shadow-sm" onSubmit={onSubmit}>
        <Input
          label="Full name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <Input
          label="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <Input
          label="Phone"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
        <Input
          label="Password"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-gray-700">Role</span>
          <select
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="customer">Customer</option>
            <option value="admin">Admin</option>
          </select>
        </label>
        <div className="flex gap-2 pt-2">
          <Button type="button" variant="secondary" className="flex-1" onClick={() => navigate('/admin/users')}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1" disabled={saving}>
            {saving ? 'Saving…' : 'Create user'}
          </Button>
        </div>
      </form>
    </div>
  );
}

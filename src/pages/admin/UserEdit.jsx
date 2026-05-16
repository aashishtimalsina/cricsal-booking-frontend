import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { getUser, updateUser } from '../../api/users';
import { useToast } from '../../context/ToastContext';

export default function UserEdit() {
  const { id } = useParams();
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

  const { data, isLoading } = useQuery({
    queryKey: ['user', id],
    queryFn: async () => (await getUser(id)).data,
  });
  const user = data?.data ?? data;

  useEffect(() => {
    if (!user) return;
    setForm({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      password: '',
      role: user.role || 'customer',
    });
  }, [user]);

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password;
      await updateUser(id, payload);
      showToast('User updated');
      navigate('/admin/users');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed');
    } finally {
      setSaving(false);
    }
  }

  if (isLoading || !user) return <p className="text-gray-600">Loading…</p>;

  return (
    <div className="mx-auto max-w-lg">
      <PageHeader title="Edit user" subtitle={`User #${user.id}`} />
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
          label="New password"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          placeholder="Leave blank to keep current"
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
            {saving ? 'Saving…' : 'Save changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}

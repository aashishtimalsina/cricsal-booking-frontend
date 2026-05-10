import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { register } from '../../api/auth';
import useAuthStore from '../../store/authStore';
import { useToast } from '../../context/ToastContext';
import { useCompany } from '../../context/CompanyContext';

export default function Register() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { company } = useCompany();
  const setToken = useAuthStore((s) => s.setToken);
  const setUser = useAuthStore((s) => s.setUser);
  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '', phone: '' });
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await register(form);
      setToken(data.token);
      setUser(data.user);
      showToast('Account created');
      navigate('/book');
    } catch (err) {
      const msg = err.response?.data?.message || (err.response?.data?.errors && JSON.stringify(err.response.data.errors));
      showToast(msg || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <p className="text-center text-sm font-semibold text-green-800">{company.name}</p>
        <h1 className="mt-1 text-center text-2xl font-bold text-gray-900">Create customer account</h1>
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
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
          <Input
            label="Confirm password"
            type="password"
            value={form.password_confirmation}
            onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
            required
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Please wait…' : 'Register'}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          <Link className="font-medium text-green-700 hover:underline" to="/login">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}

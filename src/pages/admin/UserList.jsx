import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import { listUsers, deleteUser } from '../../api/users';
import { useToast } from '../../context/ToastContext';

export default function UserList() {
  const { showToast } = useToast();
  const qc = useQueryClient();
  const [role, setRole] = useState('');
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['users', role, search],
    queryFn: async () =>
      (await listUsers({ role: role || undefined, search: search || undefined })).data,
  });
  const rows = data?.data ?? [];

  async function onDelete(id) {
    if (!window.confirm('Delete this user?')) return;
    setDeletingId(id);
    try {
      await deleteUser(id);
      showToast('User deleted');
      qc.invalidateQueries({ queryKey: ['users'] });
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <PageHeader
        title="Users"
        subtitle="Manage admin and customer accounts"
        action={
          <Link to="/admin/users/new">
            <Button>Add user</Button>
          </Link>
        }
      />
      <div className="mb-4 flex flex-wrap gap-3">
        <select
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="">All roles</option>
          <option value="admin">Admin</option>
          <option value="customer">Customer</option>
        </select>
        <input
          type="search"
          placeholder="Search name, email, phone…"
          className="min-w-[12rem] flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      {isLoading ? (
        <p className="text-gray-600">Loading…</p>
      ) : (
        <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => (
                <tr key={u.id} className="border-t border-gray-100">
                  <td className="px-4 py-3 font-mono text-xs">{u.id}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3">{u.phone || '—'}</td>
                  <td className="px-4 py-3 capitalize">{u.role}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        to={`/admin/users/${u.id}/edit`}
                        className="text-sm font-medium text-emerald-700 hover:underline"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        className="text-sm font-medium text-red-600 hover:underline disabled:opacity-50"
                        disabled={deletingId === u.id}
                        onClick={() => onDelete(u.id)}
                      >
                        Delete
                      </button>
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

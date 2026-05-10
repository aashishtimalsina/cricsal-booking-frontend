import { useEffect } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import useAuthStore from '../../store/authStore';
import { me } from '../../api/auth';

export default function AdminLayout() {
  const navigate = useNavigate();
  const { token, user, setUser } = useAuthStore();

  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }
    (async () => {
      try {
        const { data } = await me();
        const u = data.data;
        setUser(u);
        if (u.role !== 'admin') {
          navigate('/book', { replace: true });
        }
      } catch {
        navigate('/login', { replace: true });
      }
    })();
  }, [token, navigate, setUser]);

  if (!token) return <Navigate to="/login" replace />;

  if (user && user.role !== 'admin') {
    return <Navigate to="/book" replace />;
  }

  return (
    <div className="flex min-h-screen font-sans">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Topbar />
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

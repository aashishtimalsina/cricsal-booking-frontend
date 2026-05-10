import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { me } from '../../api/auth';
import CustomerNav from './CustomerNav';

/**
 * Only signed-in customers may access the wrapped route (e.g. book a ground).
 * Admins are sent to the admin dashboard.
 */
export default function RequireCustomer({ children }) {
  const location = useLocation();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [hydrating, setHydrating] = useState(!!token && !user);

  useEffect(() => {
    if (!token || user) {
      setHydrating(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const { data } = await me();
        if (!cancelled) {
          setUser(data.data);
        }
      } catch {
        if (!cancelled) {
          useAuthStore.getState().clear();
        }
      } finally {
        if (!cancelled) setHydrating(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, user, setUser]);

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (hydrating) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 text-gray-600">Loading…</div>
    );
  }

  if (user?.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (user?.role !== 'customer') {
    return <Navigate to="/login" replace />;
  }

  const googleMissingPhone =
    Boolean(user.google_id) && !(typeof user.phone === "string" && user.phone.trim());
  if (googleMissingPhone && location.pathname !== "/complete-profile") {
    return <Navigate to="/complete-profile" replace state={{ from: location.pathname }} />;
  }

  return (
    <>
      <CustomerNav />
      <main>{children}</main>
    </>
  );
}

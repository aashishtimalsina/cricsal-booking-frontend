import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { me } from '../../api/auth';

export default function GoogleCallback() {
  const navigate = useNavigate();
  const setToken = useAuthStore((s) => s.setToken);
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    (async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      if (!token) {
        navigate('/login?error=oauth_failed');
        return;
      }
      setToken(token);
      localStorage.setItem('token', token);
      try {
        const { data } = await me();
        const u = data.data;
        setUser(u);
        const googleMissingPhone =
          u?.role === "customer" &&
          Boolean(u.google_id) &&
          !(typeof u.phone === "string" && u.phone.trim());
        navigate(googleMissingPhone ? "/complete-profile" : "/book", { replace: true });
        return;
      } catch {
        /* ignore */
      }
      navigate("/book", { replace: true });
    })();
  }, [navigate, setToken, setUser]);

  return (
    <div className="flex h-screen items-center justify-center text-gray-600">Logging you in…</div>
  );
}

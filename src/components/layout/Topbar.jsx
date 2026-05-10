import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import useAuthStore from '../../store/authStore';
import { logout as apiLogout } from '../../api/auth';

export default function Topbar() {
  const navigate = useNavigate();
  const clear = useAuthStore((s) => s.clear);

  async function handleLogout() {
    try {
      await apiLogout();
    } catch {
      /* ignore */
    }
    clear();
    navigate('/login');
  }

  return (
    <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6">
      <span className="text-sm text-gray-500">Cricket ground & academy</span>
      <Button variant="ghost" className="!py-1 text-sm" onClick={handleLogout}>
        Log out
      </Button>
    </header>
  );
}

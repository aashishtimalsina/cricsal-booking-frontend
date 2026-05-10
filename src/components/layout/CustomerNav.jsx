import { Link, useNavigate, useLocation } from "react-router-dom";
import { googleRedirectUrl, logout as apiLogout } from "../../api/auth";
import useAuthStore from "../../store/authStore";
import { useToast } from "../../context/ToastContext";
import { useCompany } from "../../context/CompanyContext";

function NavLink({ to, children }) {
  const { pathname } = useLocation();
  const active = pathname === to;
  return (
    <Link
      to={to}
      className={`text-sm ${active ? "font-semibold text-green-800" : "text-gray-700 hover:text-green-800 hover:underline"}`}
    >
      {children}
    </Link>
  );
}

/** Simple light top bar (classic layout). */
export default function CustomerNav() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { company } = useCompany();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clear);

  async function handleLogout() {
    try {
      await apiLogout();
    } catch {
      /* ignore */
    }
    clearAuth();
    showToast("Signed out");
    navigate("/login");
  }

  return (
    <header className="border-b border-gray-200 bg-gray-100">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <Link to="/book" className="text-base font-bold text-gray-900">
          {company.name}
        </Link>
        <nav
          className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm sm:gap-x-5"
          aria-label="Customer"
        >
          <NavLink to="/book">Book ground</NavLink>
          <span className="hidden text-gray-300 sm:inline">|</span>
          <NavLink to="/my-bookings">My bookings</NavLink>
          <span className="hidden text-gray-300 sm:inline">|</span>
          <NavLink to="/my-loyalty">My loyalty</NavLink>
          {!user?.google_id && (
            <>
              <span className="hidden text-gray-300 sm:inline">|</span>
              <a
                href={googleRedirectUrl()}
                className="text-sm text-gray-600 underline hover:text-gray-900"
              >
                Connect Google
              </a>
            </>
          )}
          <span className="hidden text-gray-300 sm:inline">|</span>
          <button
            type="button"
            className="text-sm text-gray-600 hover:text-gray-900 hover:underline"
            onClick={handleLogout}
          >
            Log out
          </button>
        </nav>
      </div>
    </header>
  );
}

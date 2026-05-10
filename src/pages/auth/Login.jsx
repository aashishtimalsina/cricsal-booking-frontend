import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { login } from "../../api/auth";
import useAuthStore from "../../store/authStore";
import { useToast } from "../../context/ToastContext";
import { googleRedirectUrl } from "../../api/auth";
import { useCompany } from "../../context/CompanyContext";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from;
  const { showToast } = useToast();
  const { company } = useCompany();
  const setToken = useAuthStore((s) => s.setToken);
  const setUser = useAuthStore((s) => s.setUser);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await login({ email, password });
      setToken(data.token);
      setUser(data.user);
      const role = data.user?.role;
      const u = data.user;
      showToast("Signed in");
      if (role === "admin") {
        navigate("/admin/dashboard");
      } else {
        const googleMissingPhone =
          Boolean(u.google_id) &&
          !(typeof u.phone === "string" && u.phone.trim());
        const dest =
          typeof from === "string" && from.startsWith("/") ? from : "/book";
        if (googleMissingPhone) {
          navigate("/complete-profile", {
            replace: true,
            state: { from: dest },
          });
        } else {
          navigate(dest);
        }
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-center text-2xl font-bold text-gray-900">
          {company.name}
        </h1>
        {company.tagline ? (
          <p className="mt-1 text-center text-xs text-gray-500">
            {company.tagline}
          </p>
        ) : null}
        <p className="mt-1 text-center text-sm text-gray-600">
          Sign in to your account
        </p>
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button
            type="submit"
            className="w-full py-3 text-base"
            disabled={loading}
          >
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          No account?{" "}
          <Link
            className="font-medium text-green-700 hover:underline"
            to="/register"
          >
            Register
          </Link>
        </p>
        <div className="mt-6">
          <a
            href={googleRedirectUrl()}
            className="flex w-full justify-center rounded-lg border border-gray-300 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Continue with Google
          </a>
        </div>
      </div>
    </div>
  );
}

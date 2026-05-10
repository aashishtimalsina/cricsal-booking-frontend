import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PageHeader from "../../components/ui/PageHeader";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { updateProfile } from "../../api/auth";
import useAuthStore from "../../store/authStore";
import { useToast } from "../../context/ToastContext";
import { useCompany } from "../../context/CompanyContext";

export default function CompletePhone() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from;
  const { showToast } = useToast();
  const { company } = useCompany();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [phone, setPhone] = useState(user?.phone || "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && (!user.google_id || (typeof user.phone === "string" && user.phone.trim()))) {
      navigate("/book", { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user?.phone) setPhone(user.phone);
  }, [user?.phone]);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await updateProfile({ phone });
      setUser(data.data);
      showToast("Phone number saved");
      const dest =
        typeof from === "string" && from.startsWith("/") && from !== "/complete-profile"
          ? from
          : "/book";
      navigate(dest, { replace: true });
    } catch (err) {
      showToast(err.response?.data?.message || "Could not save phone");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <PageHeader
        title="Add your phone number"
        subtitle={`${company.name} needs a contact number for bookings and updates. You signed in with Google, so we could not read a phone from your account.`}
      />
      <form className="mt-6 space-y-4 rounded-lg bg-white p-6 shadow-sm" onSubmit={onSubmit}>
        <Input
          label="Mobile number"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="e.g. 9848000000"
          required
        />
        <Button type="submit" className="w-full py-3 text-base" disabled={loading}>
          {loading ? "Saving…" : "Save and continue"}
        </Button>
      </form>
    </div>
  );
}

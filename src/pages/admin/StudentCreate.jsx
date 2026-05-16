import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import NepaliDateField from "../../components/ui/NepaliDateField";
import { createStudent } from "../../api/students";
import { useToast } from "../../context/ToastContext";

export default function StudentCreate() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [regNp, setRegNp] = useState("");
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    guardian_name: "",
    address: "",
    reg_date_en: "",
    admission_charge: 0,
    jersey_charge: 0,
  });
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const photoPreviewRef = useRef("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    return () => {
      if (photoPreviewRef.current) URL.revokeObjectURL(photoPreviewRef.current);
    };
  }, []);

  function onPhotoChange(e) {
    const file = e.target.files?.[0] || null;
    if (photoPreviewRef.current) URL.revokeObjectURL(photoPreviewRef.current);
    const url = file ? URL.createObjectURL(file) : "";
    photoPreviewRef.current = url;
    setPhotoPreview(url);
    setPhoto(file);
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (
      !form.full_name?.trim() ||
      !form.phone?.trim() ||
      !form.reg_date_en ||
      !regNp
    ) {
      showToast("Name, phone, and both registration dates are required");
      return;
    }

    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries({ ...form, reg_date_np: regNp }).forEach(([k, v]) =>
        fd.append(k, v),
      );
      if (photo) fd.append("photo", photo);
      const { data } = await createStudent(fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const student = data.data ?? data;
      const welcome = data.welcome_sms;
      if (welcome?.success) {
        showToast("Student saved. Welcome SMS sent.");
      } else if (welcome?.reason === "duplicate_same_day") {
        showToast("Student saved. Welcome SMS skipped (already sent today).");
      } else if (welcome?.reason === "skipped" || welcome?.reason === "no_phone") {
        showToast("Student saved");
      } else {
        showToast("Student saved. Welcome SMS could not be sent.");
      }
      navigate(`/admin/students/${student.id}`);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to save student");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="w-full min-w-0 space-y-4">
      <PageHeader
        title="New student"
        subtitle="Register a new student"
        action={
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate("/admin/students")}
          >
            Back to list
          </Button>
        }
      />

      <form
        className="grid w-full grid-cols-1 gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm sm:grid-cols-2 sm:gap-5 sm:p-6 lg:grid-cols-3 lg:gap-x-6 lg:gap-y-5 lg:p-8"
        onSubmit={onSubmit}
      >
        <Input
          label="Full name"
          value={form.full_name}
          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          required
        />
        <Input
          label="Phone"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          required
        />
        <Input
          label="Guardian"
          value={form.guardian_name}
          onChange={(e) => setForm({ ...form, guardian_name: e.target.value })}
        />

        <Input
          label="Address"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
        />

        <NepaliDateField
          label="Registration date (BS)"
          value={regNp}
          onChange={setRegNp}
          onAdDateChange={(ad) =>
            setForm((prev) => ({ ...prev, reg_date_en: ad }))
          }
        />
        <Input
          label="Registration date (AD)"
          type="date"
          value={form.reg_date_en}
          onChange={(e) => setForm({ ...form, reg_date_en: e.target.value })}
          required
        />
        <Input
          label="Admission charge"
          type="number"
          min={0}
          step="0.01"
          value={form.admission_charge}
          onChange={(e) =>
            setForm({ ...form, admission_charge: e.target.value })
          }
          required
        />

        <Input
          label="Jersey charge"
          type="number"
          min={0}
          step="0.01"
          value={form.jersey_charge}
          onChange={(e) => setForm({ ...form, jersey_charge: e.target.value })}
          required
        />
        <div className="flex flex-col gap-2">
          <Input
            label="Photo"
            type="file"
            accept="image/*"
            onChange={onPhotoChange}
          />
          {photoPreview ? (
            <img
              src={photoPreview}
              alt="Selected photo preview"
              className="h-28 w-28 rounded-xl border border-gray-200 object-cover shadow-sm"
            />
          ) : null}
        </div>

        <div className="flex flex-wrap justify-end gap-3 border-t border-gray-100 pt-4 sm:col-span-2 lg:col-span-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate("/admin/students")}
          >
            Cancel
          </Button>
          <Button type="submit" className="min-w-[8rem]" disabled={saving}>
            {saving ? "Saving…" : "Save student"}
          </Button>
        </div>
      </form>
    </div>
  );
}

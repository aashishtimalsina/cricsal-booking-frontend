import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import PageHeader from "../../components/ui/PageHeader";
import Input, { fieldClass } from "../../components/ui/Input";
import { listTimeSlots } from "../../api/timeSlots";
import { customerBooking } from "../../api/bookings";
import useAuthStore from "../../store/authStore";
import { useToast } from "../../context/ToastContext";
import { useCompany } from "../../context/CompanyContext";

const selectClass = `${fieldClass} cursor-pointer appearance-none pr-10 disabled:cursor-not-allowed`;

/** Parse "06:00-07:00" style slot labels from the API */
function parseSlotTimes(label) {
  const m = String(label).match(/^(\d{2}:\d{2})-(\d{2}:\d{2})$/);
  if (!m) return null;
  return { start: m[1], end: m[2] };
}

function formatBlockRange(slots, startIndex, hours) {
  const h = Math.max(1, Math.min(24, Math.floor(Number(hours)) || 1));
  if (startIndex < 0 || startIndex + h > slots.length) return null;
  const first = parseSlotTimes(slots[startIndex].label);
  const last = parseSlotTimes(slots[startIndex + h - 1].label);
  if (!first || !last) return slots[startIndex]?.label ?? "";
  return `${first.start}–${last.end}`;
}

function FormSection({ eyebrow, title, hint, children, className = "" }) {
  return (
    <section className={`px-5 py-6 sm:px-8 sm:py-7 ${className}`}>
      <div className="mb-4">
        {eyebrow && (
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700">
            {eyebrow}
          </p>
        )}
        <h2 className="text-base font-semibold text-gray-900 lg:text-lg">
          {title}
        </h2>
        {hint && (
          <p className="mt-1 text-sm text-gray-500 lg:max-w-md">{hint}</p>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export default function BookingForm() {
  const { showToast } = useToast();
  const { company } = useCompany();
  const user = useAuthStore((s) => s.user);
  const [done, setDone] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    booking_date: "",
    time_slot: "",
    hours: 1,
    payment_status: "pending",
    payment_amount: 0,
    notes: "",
  });
  const [file, setFile] = useState(null);
  /** Set when API returns 422 slot conflict (message + optional conflicts list). */
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    if (!user?.email) return;
    setForm((prev) => ({
      ...prev,
      name: prev.name || user.name || "",
      email: prev.email || user.email || "",
      phone: prev.phone || user.phone || "",
    }));
  }, [user]);

  const { data: slotsRes, isLoading: slotsLoading } = useQuery({
    queryKey: ["time-slots"],
    queryFn: async () => (await listTimeSlots()).data,
  });
  const slots = slotsRes?.data ?? [];

  const mutation = useMutation({
    mutationFn: async () => {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        fd.append(k, v);
      });
      if (file) fd.append("payment_screenshot", file);
      return customerBooking(fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: (res) => {
      const booking = res.data?.data;
      setDone(booking?.id);
      setSubmitError(null);
      showToast("Booking submitted");
    },
    onError: (e) => {
      const data = e.response?.data;
      const message = data?.message || "Failed";
      const conflicts = Array.isArray(data?.conflicts) ? data.conflicts : [];
      setSubmitError({ message, conflicts });
      showToast(message);
    },
  });

  const showScreenshot =
    form.payment_status === "paid" || form.payment_status === "partial";

  const hoursClamped = Math.max(1, Math.min(24, Number(form.hours) || 1));

  const selectedRangePreview = useMemo(() => {
    if (!form.time_slot || !slots.length) return null;
    const idx = slots.findIndex((s) => s.label === form.time_slot);
    if (idx < 0 || idx + hoursClamped > slots.length) return null;
    return formatBlockRange(slots, idx, hoursClamped);
  }, [form.time_slot, hoursClamped, slots]);

  /** If hours grows and current start no longer fits, clear the slot */
  useEffect(() => {
    if (!slots.length || !form.time_slot) return;
    const idx = slots.findIndex((s) => s.label === form.time_slot);
    if (idx < 0 || idx + hoursClamped > slots.length) {
      setForm((prev) => ({ ...prev, time_slot: "" }));
    }
  }, [hoursClamped, slots, form.time_slot]);

  function bookAnother() {
    setDone(null);
    setFile(null);
    setSubmitError(null);
    setForm((prev) => ({
      ...prev,
      booking_date: "",
      time_slot: "",
      hours: 1,
      payment_status: "pending",
      payment_amount: 0,
      notes: "",
    }));
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/60 via-gray-50 to-gray-100 pb-16">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10 lg:max-w-6xl lg:px-10 lg:py-12 xl:max-w-7xl">
        <PageHeader
          className="lg:mb-10"
          eyebrow="Ground booking"
          title="Book a cricket ground"
          subtitle={`Request a slot with ${company.name}. You will receive email updates while your booking is pending and when it is confirmed.`}
        />

        {done ? (
          <div className="relative mx-auto max-w-lg overflow-hidden rounded-2xl bg-white p-10 text-center shadow-xl ring-1 ring-gray-200/80 lg:max-w-xl lg:p-12">
            <div
              className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-emerald-100/90 blur-2xl"
              aria-hidden
            />
            <div
              className="relative mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-2xl text-emerald-700 shadow-inner"
              aria-hidden
            >
              ✓
            </div>
            <p className="text-xl font-bold text-gray-900 lg:text-2xl">
              Request received
            </p>
            <p className="mt-2 text-gray-600">
              Reference{" "}
              <span className="font-mono font-semibold text-emerald-800">
                #{done}
              </span>
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Check your inbox for a pending confirmation from us.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
              <button
                type="button"
                onClick={bookAnother}
                className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-800 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50/50 hover:text-emerald-900"
              >
                Book another session
              </button>
              <Link
                to="/my-bookings"
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-b from-emerald-600 to-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-emerald-900/15 transition hover:from-emerald-500 hover:to-emerald-600"
              >
                View my bookings
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-gray-900/5 lg:rounded-3xl lg:shadow-2xl">
            <div className="border-b border-emerald-100/80 bg-gradient-to-r from-emerald-600/[0.08] via-white to-white px-5 py-4 sm:px-8 lg:px-10 lg:py-5">
              <p className="text-sm font-medium text-emerald-900 lg:text-base">
                New booking request
              </p>
              <p className="mt-0.5 max-w-3xl text-xs text-gray-600 lg:text-sm">
                Account details are locked; edit them in your profile if we add
                that later.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                mutation.mutate();
              }}
            >
              {submitError && (
                <div
                  role="alert"
                  className="border-b border-amber-200 bg-amber-50 px-5 py-4 sm:px-8 lg:px-10"
                >
                  <p className="text-sm font-semibold text-amber-950">
                    {submitError.message}
                  </p>
                  {submitError.conflicts.length > 0 && (
                    <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-amber-900">
                      {submitError.conflicts.map((c) => (
                        <li key={c.id}>
                          <span className="font-medium">{c.name}</span>
                          <span className="text-amber-800/90">
                            {" "}
                            — {c.status}
                            {c.time_slot ? (
                              <>
                                {" "}
                                · slot {c.time_slot}
                                {c.hours > 1 ? ` (${c.hours}h)` : ""}
                              </>
                            ) : null}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
              <div className="lg:grid lg:grid-cols-12 lg:divide-x lg:divide-gray-100">
                {/* Left: profile + session */}
                <div className="divide-y divide-gray-100 lg:col-span-7 lg:divide-y">
                  <FormSection
                    eyebrow="Profile"
                    title="Your contact details"
                    hint="Pulled from your signed-in account — read only on this form."
                  >
                    <div className="rounded-xl border border-gray-200/80 bg-gray-50/90 p-4 sm:p-5 lg:p-6">
                      <div className="grid gap-4 sm:grid-cols-2 lg:gap-5">
                        <Input
                          label="Name"
                          value={form.name}
                          readOnly
                          required
                        />
                        <Input
                          label="Email"
                          type="email"
                          value={form.email}
                          readOnly
                          required
                        />
                      </div>
                      <div className="mt-4 lg:mt-5">
                        <Input
                          label="Phone"
                          value={form.phone}
                          readOnly
                          required
                        />
                      </div>
                    </div>
                  </FormSection>

                  <FormSection
                    eyebrow="Schedule"
                    title="Session"
                    hint="Set hours first if you like. Each row shows the full time window for that start; the API still uses the first hour as the anchor."
                  >
                    <div className="grid gap-4 lg:grid-cols-2 lg:gap-5">
                      <Input
                        label="Booking date"
                        type="date"
                        value={form.booking_date}
                        min={new Date().toISOString().slice(0, 10)}
                        onChange={(e) => {
                          setSubmitError(null);
                          setForm({ ...form, booking_date: e.target.value });
                        }}
                        required
                      />
                      <Input
                        label="Consecutive hours"
                        type="number"
                        min={1}
                        max={24}
                        value={form.hours}
                        onChange={(e) => {
                          setSubmitError(null);
                          setForm({ ...form, hours: Number(e.target.value) });
                        }}
                        required
                      />
                    </div>
                    <label className="mt-4 flex flex-col gap-1.5 text-sm lg:mt-5">
                      <span className="font-medium text-gray-700">
                        Start time ({hoursClamped} consecutive hour
                        {hoursClamped === 1 ? "" : "s"})
                      </span>
                      <p className="text-xs text-gray-500">
                        Options list your full block (e.g. 3h from 06:00 →
                        06:00–09:00). Value sent to the server is still the
                        first one-hour slot.
                      </p>
                      <div className="relative">
                        <select
                          className={selectClass}
                          value={form.time_slot}
                          onChange={(e) => {
                            setSubmitError(null);
                            setForm({ ...form, time_slot: e.target.value });
                          }}
                          required
                          disabled={slotsLoading}
                        >
                          <option value="">
                            {slotsLoading
                              ? "Loading slots…"
                              : "Select start time"}
                          </option>
                          {slots.map((s, i) => {
                            const valid = i + hoursClamped <= slots.length;
                            const display = valid
                              ? formatBlockRange(slots, i, hoursClamped)
                              : `${parseSlotTimes(s.label)?.start ?? s.label} (not enough slots for ${hoursClamped}h)`;
                            return (
                              <option
                                key={s.id}
                                value={s.label}
                                disabled={!valid}
                              >
                                {display}
                              </option>
                            );
                          })}
                        </select>
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                          ▾
                        </span>
                      </div>
                      {selectedRangePreview && (
                        <p className="text-xs font-medium text-emerald-800">
                          Your session:{" "}
                          <span className="font-mono">
                            {selectedRangePreview}
                          </span>
                        </p>
                      )}
                    </label>
                  </FormSection>
                </div>

                {/* Right: payment + notes */}
                <div className="divide-y divide-gray-100 bg-gradient-to-b from-gray-50/50 to-white lg:col-span-5 lg:from-gray-50/70">
                  <FormSection
                    eyebrow="Payment"
                    title="Amount & status"
                    hint="Admins will match this with your transfer or cash record."
                  >
                    <div className="grid grid-cols-3 gap-2 rounded-xl bg-gray-100 p-1.5">
                      {["pending", "paid", "partial"].map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() =>
                            setForm({ ...form, payment_status: v })
                          }
                          className={`rounded-lg py-2.5 text-xs font-semibold capitalize transition sm:text-sm ${
                            form.payment_status === v
                              ? "bg-white text-emerald-900 shadow-sm ring-1 ring-gray-200/90"
                              : "text-gray-600 hover:text-gray-900"
                          }`}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                    <Input
                      label="Payment amount"
                      type="number"
                      min={0}
                      step="0.01"
                      value={form.payment_amount}
                      onChange={(e) =>
                        setForm({ ...form, payment_amount: e.target.value })
                      }
                      required
                    />
                    {showScreenshot && (
                      <div>
                        <label
                          htmlFor="booking-payment-file"
                          className="text-sm font-medium text-gray-700"
                        >
                          Payment screenshot
                        </label>
                        <label
                          htmlFor="booking-payment-file"
                          className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-white/80 px-4 py-8 transition hover:border-emerald-300 hover:bg-emerald-50/40 lg:py-10"
                        >
                          <input
                            id="booking-payment-file"
                            type="file"
                            className="sr-only"
                            accept=".jpg,.jpeg,.png,.pdf"
                            onChange={(e) =>
                              setFile(e.target.files?.[0] || null)
                            }
                          />
                          <span className="text-sm text-gray-600">
                            <span className="font-medium text-emerald-700">
                              Choose file
                            </span>
                            <span className="text-gray-400">
                              {" "}
                              or tap to upload
                            </span>
                          </span>
                          {file && (
                            <p className="mt-2 text-xs font-medium text-emerald-900">
                              {file.name}
                            </p>
                          )}
                        </label>
                      </div>
                    )}
                  </FormSection>

                  <FormSection
                    eyebrow="Optional"
                    title="Notes for staff"
                    hint="Team name, stumps, lights — anything that helps us prepare."
                  >
                    <Input
                      label="Notes"
                      rows={5}
                      placeholder="Optional message to the ground team…"
                      value={form.notes}
                      onChange={(e) =>
                        setForm({ ...form, notes: e.target.value })
                      }
                    />
                  </FormSection>
                </div>
              </div>

              <div className="border-t border-gray-100 bg-gray-50/90 px-5 py-5 sm:px-8 lg:flex lg:items-center lg:justify-between lg:gap-10 lg:px-10 lg:py-6">
                <p className="order-2 mt-3 text-center text-xs text-gray-500 lg:order-1 lg:mt-0 lg:max-w-lg lg:flex-1 lg:text-left lg:text-sm">
                  By submitting you agree we may contact you about this booking.
                </p>
                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="order-1 w-full rounded-xl bg-gradient-to-b from-emerald-600 to-emerald-700 px-6 py-3.5 text-base font-semibold text-white shadow-md shadow-emerald-900/15 transition hover:from-emerald-500 hover:to-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 lg:order-2 lg:w-auto lg:min-w-[200px] lg:shrink-0 xl:min-w-[240px]"
                >
                  {mutation.isPending
                    ? "Submitting…"
                    : "Submit booking request"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import Papa from "papaparse";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { reportBookings, reportAcademy } from "../../api/reports";
import { formatCurrency } from "../../utils/formatCurrency";
import { resourceList } from "../../utils/resourceList";
import {
  academyPackageLabel,
  academyPaymentCategoryLabel,
  academyPaymentTypeLabel,
} from "../../constants/academy";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#16a34a", "#d97706", "#2563eb", "#dc2626"];

const todayStr = () => new Date().toISOString().slice(0, 10);

const PERIODS = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "range", label: "Custom range" },
  { value: "current_month", label: "This month" },
  { value: "this_year", label: "This year" },
];

export default function Reports() {
  const [tab, setTab] = useState("bookings");
  const [period, setPeriod] = useState("daily");
  const [date, setDate] = useState(todayStr());
  const [month, setMonth] = useState(String(new Date().getMonth() + 1));
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [start, setStart] = useState(todayStr());
  const [end, setEnd] = useState(todayStr());

  const [data, setData] = useState(null);

  const reportParams = useMemo(() => {
    if (period === "daily" || period === "weekly") {
      return { type: period, date };
    }
    if (period === "monthly") {
      return { type: "monthly", month: Number(month), year: Number(year) };
    }
    if (period === "range") {
      return { type: "range", start_date: start, end_date: end };
    }
    if (period === "current_month" || period === "this_year") {
      return { type: period };
    }
    return { type: "daily", date: todayStr() };
  }, [period, date, month, year, start, end]);

  const mutation = useMutation({
    mutationFn: async () => {
      const res =
        tab === "bookings"
          ? await reportBookings(reportParams)
          : await reportAcademy(reportParams);
      return res.data;
    },
    onSuccess: (d) => setData(d),
  });

  function exportCsv() {
    if (!data) return;
    let rows =
      tab === "bookings"
        ? resourceList(data.bookings)
        : resourceList(data.payments);
    if (tab === "academy") {
      rows = rows.map((r) => ({
        ...r,
        student_name: r.student?.full_name ?? "",
        student_code: r.student?.student_code ?? "",
        package: r.package_label ?? academyPackageLabel(r.package),
        payment_type:
          r.payment_type_label ?? academyPaymentTypeLabel(r.payment_type),
        payment_category:
          r.payment_category_label ??
          academyPaymentCategoryLabel(r.payment_category),
      }));
    }
    if (tab === "bookings") {
      rows = rows.map((r) => ({
        ...r,
        payer: r.name,
      }));
    }
    const csv = Papa.unparse(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${tab}-report-${period}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const pieByStatus =
    tab === "bookings"
      ? Object.entries(data?.by_status ?? {}).map(([name, value]) => ({
          name,
          value,
        }))
      : Object.entries(data?.by_type ?? {}).map(([name, value]) => ({
          name: academyPaymentTypeLabel(name),
          value,
        }));

  const pieByPayment =
    tab === "bookings"
      ? Object.entries(data?.by_payment_status ?? {}).map(([name, value]) => ({
          name,
          value,
        }))
      : [];

  const pieByPackage =
    tab === "academy"
      ? Object.entries(data?.by_package ?? {}).map(([name, value]) => ({
          name: academyPackageLabel(name),
          value,
        }))
      : [];

  const bookingRows = resourceList(data?.bookings);
  const academyRows = resourceList(data?.payments);

  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle="Bookings and academy income by period. Generate, then review who paid below."
      />
      <div className="mb-4 flex flex-wrap gap-2">
        <Button
          variant={tab === "bookings" ? "primary" : "secondary"}
          onClick={() => {
            setTab("bookings");
            setData(null);
          }}
        >
          Ground bookings
        </Button>
        <Button
          variant={tab === "academy" ? "primary" : "secondary"}
          onClick={() => {
            setTab("academy");
            setData(null);
          }}
        >
          Academy payments
        </Button>
      </div>

      <div className="mb-4 rounded-xl bg-white p-4 shadow-sm">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Period
        </p>
        <div className="flex flex-wrap gap-2">
          {PERIODS.map((p) => (
            <Button
              key={p.value}
              variant={period === p.value ? "primary" : "secondary"}
              className="!px-3 !py-1.5 !text-xs sm:!text-sm"
              onClick={() => setPeriod(p.value)}
            >
              {p.label}
            </Button>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-end gap-3">
          {(period === "daily" || period === "weekly") && (
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-500">
                {period === "weekly"
                  ? "Date (week Mon–Sun containing)"
                  : "Date"}
              </span>
              <input
                type="date"
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          )}
          {period === "monthly" && (
            <>
              <Input
                label=""
                type="number"
                min={1}
                max={12}
                value={month}
                onChange={(e) => setMonth(e.target.value)}
              />
              <Input
                label=""
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              />
            </>
          )}
          {period === "range" && (
            <>
              <Input
                type="date"
                label="From"
                value={start}
                onChange={(e) => setStart(e.target.value)}
              />
              <Input
                type="date"
                label="To"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
              />
            </>
          )}
          {(period === "current_month" || period === "this_year") && (
            <p className="text-sm text-gray-600">
              {period === "current_month"
                ? "Calendar month in progress (local server date)."
                : "January 1 through December 31 of the current year."}
            </p>
          )}
          <Button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="!ml-auto"
          >
            {mutation.isPending ? "Loading…" : "Generate"}
          </Button>
          {data && (
            <Button variant="secondary" onClick={exportCsv}>
              Export CSV
            </Button>
          )}
        </div>
      </div>

      {data && (
        <>
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-xl bg-white p-4 shadow-sm">
              <p className="text-xs text-gray-500">Total revenue (all rows)</p>
              <p className="text-2xl font-semibold">
                {formatCurrency(data.total_revenue)}
              </p>
              {tab === "bookings" && (
                <>
                  <p className="mt-3 text-xs text-gray-500">
                    Active bookings (excl. cancelled / rejected)
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatCurrency(
                      data.total_revenue_active ?? data.total_revenue,
                    )}
                  </p>
                  <p className="mt-3 text-xs text-gray-500">
                    Collected (confirmed + paid or partial)
                  </p>
                  <p className="text-lg font-semibold text-emerald-800">
                    {formatCurrency(data.total_revenue_collected ?? "0")}
                  </p>
                  <p className="mt-3 border-t border-gray-100 pt-2 text-sm text-gray-600">
                    Records: {data.count}
                    {typeof data.count_cancelled === "number" && (
                      <span className="block text-xs text-red-700">
                        Cancelled: {data.count_cancelled}
                      </span>
                    )}
                    {typeof data.count_rejected === "number" &&
                      data.count_rejected > 0 && (
                        <span className="block text-xs text-gray-600">
                          Rejected: {data.count_rejected}
                        </span>
                      )}
                    {typeof data.total_hours_active === "number" && (
                      <span className="block text-xs text-gray-500">
                        Active hours: {data.total_hours_active}
                      </span>
                    )}
                  </p>
                </>
              )}
              {tab !== "bookings" && (
                <p className="mt-2 text-sm text-gray-600">
                  Records: {data.count}
                </p>
              )}
            </div>
            <div className="rounded-xl bg-white p-4 shadow-sm lg:col-span-2">
              <p className="mb-2 text-center text-xs font-medium uppercase tracking-wide text-gray-500">
                {tab === "bookings" ? "By booking status" : "By payment type"}
              </p>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieByStatus}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={80}
                      label
                    >
                      {pieByStatus.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {tab === "bookings" && pieByPayment.length > 0 && (
                <>
                  <p className="mb-2 mt-6 text-center text-xs font-medium uppercase tracking-wide text-gray-500">
                    By payment status
                  </p>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieByPayment}
                          dataKey="value"
                          nameKey="name"
                          outerRadius={80}
                          label
                        >
                          {pieByPayment.map((_, i) => (
                            <Cell
                              key={i}
                              fill={COLORS[(i + 1) % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </>
              )}
              {tab === "academy" && pieByPackage.length > 0 && (
                <>
                  <p className="mb-2 mt-6 text-center text-xs font-medium uppercase tracking-wide text-gray-500">
                    By package
                  </p>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieByPackage}
                          dataKey="value"
                          nameKey="name"
                          outerRadius={80}
                          label
                        >
                          {pieByPackage.map((_, i) => (
                            <Cell
                              key={i}
                              fill={COLORS[(i + 2) % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="mt-8 rounded-xl border border-gray-100 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-4 py-3 sm:px-6">
              <h2 className="text-sm font-semibold text-gray-900">
                {tab === "bookings"
                  ? "Who paid — ground bookings"
                  : "Who paid — academy"}
              </h2>
              <p className="mt-0.5 text-xs text-gray-500">
                {tab === "bookings"
                  ? "Customers with payments in this period (all booking statuses shown)."
                  : "Students with a payment recorded in this period."}
              </p>
            </div>
            <div className="overflow-x-auto">
              {tab === "bookings" ? (
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                    <tr>
                      <th className="px-4 py-2">Customer</th>
                      <th className="px-4 py-2">Phone</th>
                      <th className="px-4 py-2">Email</th>
                      <th className="px-4 py-2">Booking date</th>
                      <th className="px-4 py-2">Amount</th>
                      <th className="px-4 py-2">Pay</th>
                      <th className="px-4 py-2">Booking</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookingRows.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-4 py-6 text-center text-gray-500"
                        >
                          No rows for this period.
                        </td>
                      </tr>
                    ) : (
                      bookingRows.map((b) => (
                        <tr key={b.id} className="border-t border-gray-100">
                          <td className="px-4 py-2 font-medium text-gray-900">
                            {b.name}
                          </td>
                          <td className="px-4 py-2 text-gray-700">{b.phone}</td>
                          <td className="px-4 py-2 text-gray-600">{b.email}</td>
                          <td className="px-4 py-2 text-gray-700">
                            {b.booking_date}
                          </td>
                          <td className="px-4 py-2">
                            {formatCurrency(b.payment_amount)}
                          </td>
                          <td className="px-4 py-2 capitalize text-gray-700">
                            {b.payment_status}
                          </td>
                          <td className="px-4 py-2 capitalize text-gray-700">
                            {b.status}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              ) : (
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                    <tr>
                      <th className="px-4 py-2">Student</th>
                      <th className="px-4 py-2">Code</th>
                      <th className="px-4 py-2">Phone</th>
                      <th className="px-4 py-2">Paid (AD)</th>
                      <th className="px-4 py-2">Paid (BS)</th>
                      <th className="px-4 py-2">Amount</th>
                      <th className="px-4 py-2">Package</th>
                      <th className="px-4 py-2">Channel</th>
                    </tr>
                  </thead>
                  <tbody>
                    {academyRows.length === 0 ? (
                      <tr>
                        <td
                          colSpan={8}
                          className="px-4 py-6 text-center text-gray-500"
                        >
                          No payments for this period.
                        </td>
                      </tr>
                    ) : (
                      academyRows.map((p) => (
                        <tr key={p.id} className="border-t border-gray-100">
                          <td className="px-4 py-2 font-medium text-gray-900">
                            {p.student?.full_name ?? "—"}
                          </td>
                          <td className="px-4 py-2 text-emerald-800">
                            {p.student?.student_code ?? "—"}
                          </td>
                          <td className="px-4 py-2 text-gray-700">
                            {p.student?.phone ?? "—"}
                          </td>
                          <td className="px-4 py-2 text-gray-700">
                            {p.payment_date_en}
                          </td>
                          <td className="px-4 py-2 text-gray-700">
                            {p.payment_date_np}
                          </td>
                          <td className="px-4 py-2">
                            {formatCurrency(p.amount)}
                          </td>
                          <td className="px-4 py-2 text-gray-700">
                            {p.package_label ?? academyPackageLabel(p.package)}
                          </td>
                          <td className="px-4 py-2 text-gray-700">
                            {p.payment_type_label ??
                              academyPaymentTypeLabel(p.payment_type)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

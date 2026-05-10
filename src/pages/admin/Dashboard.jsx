import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import PageHeader from "../../components/ui/PageHeader";
import StatCard from "../../components/ui/StatCard";
import StatusBadge from "../../components/ui/StatusBadge";
import LoyaltyPointsUsed from "../../components/ui/LoyaltyPointsUsed";
import Button from "../../components/ui/Button";
import { dashboardSummary, expiringStudents } from "../../api/dashboard";
import { sendSmsToStudent } from "../../api/sms";
import { formatCurrency } from "../../utils/formatCurrency";
import { resourceList } from "../../utils/resourceList";
import { useToast } from "../../context/ToastContext";
import { useCompany } from "../../context/CompanyContext";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { showToast } = useToast();
  const { company } = useCompany();
  const navigate = useNavigate();

  const { data: summary, isLoading } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: async () => (await dashboardSummary()).data,
  });

  const { data: expiring } = useQuery({
    queryKey: ["expiring-students"],
    queryFn: async () => (await expiringStudents()).data,
  });

  async function sendSms(studentId) {
    try {
      await sendSmsToStudent(studentId);
      showToast("SMS sent");
    } catch (e) {
      showToast(
        e.response?.data?.reason === "duplicate_same_day"
          ? "SMS already sent today"
          : "SMS failed",
      );
    }
  }

  if (isLoading || !summary) {
    return <p className="text-gray-600">Loading dashboard…</p>;
  }

  const recent = resourceList(summary.recent_bookings);
  const snapshots = summary.customer_booking_snapshots ?? [];

  return (
    <div className="space-y-8">
      <PageHeader title="Dashboard" subtitle={`Overview for ${company.name}`} />

      {expiring?.data?.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="font-semibold text-amber-900">
            Packages expiring within 7 days
          </h3>
          <ul className="mt-3 divide-y divide-amber-200">
            {expiring.data.map((row) => (
              <li
                key={`${row.student_id}-${row.package_end_date}`}
                className="flex flex-wrap items-center gap-3 py-2 text-sm"
              >
                <span className="font-medium">{row.full_name}</span>
                <span className="text-gray-600">{row.phone}</span>
                <span>Ends {row.package_end_date}</span>
                <span className="text-gray-600">
                  {row.days_remaining}d left
                </span>
                <Button
                  className="!py-1 !text-xs"
                  disabled={row.sms_sent_today}
                  onClick={() => sendSms(row.student_id)}
                >
                  {row.sms_sent_today ? "SMS sent today" : "Send SMS"}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Bookings today" value={summary.bookings_today} />
        <StatCard
          label="Ground revenue (collected)"
          value={formatCurrency(summary.revenue_this_month)}
          hint={
            summary.revenue_pipeline_this_month != null
              ? `Same month, pending + confirmed (pipeline): ${formatCurrency(summary.revenue_pipeline_this_month)}`
              : undefined
          }
        />
        <StatCard label="Active students" value={summary.active_students} />
        <StatCard
          label="Pending bookings"
          value={summary.pending_bookings}
          onClick={() => navigate("/admin/bookings?status=pending")}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-gray-800">
            Bookings this week
          </h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary.bookings_this_week || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#16a34a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-gray-800">
            Collected ground revenue by day (this month)
          </h3>
          <p className="mb-2 text-xs text-gray-500">
            Confirmed bookings marked paid or partial.
          </p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={summary.revenue_by_day_this_month || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#d97706"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-white p-4 shadow-sm">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-gray-800">Recent bookings</h3>
          <Button variant="secondary" className="!py-1 !text-xs" onClick={() => navigate("/admin/bookings")}>
            View all bookings
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b text-xs uppercase text-gray-500">
                <th className="py-2 pr-4">Date</th>
                <th className="py-2 pr-4">Customer</th>
                <th className="py-2 pr-4">Slot</th>
                <th className="py-2 pr-4">Hrs</th>
                <th className="py-2 pr-4">Amount</th>
                <th className="py-2 pr-4">Pay</th>
                <th className="py-2 pr-4">Pts used</th>
                <th className="py-2 pr-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {recent.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-gray-500">
                    No recent bookings.
                  </td>
                </tr>
              ) : (
                recent.map((b) => (
                  <tr key={b.id} className="border-b border-gray-100">
                    <td className="py-2 pr-4 whitespace-nowrap">{b.booking_date}</td>
                    <td className="py-2 pr-4">
                      <div className="font-medium text-gray-900">{b.name}</div>
                      <div className="text-xs text-gray-500">{b.email}</div>
                    </td>
                    <td className="py-2 pr-4">{b.time_slot}</td>
                    <td className="py-2 pr-4">{b.hours}</td>
                    <td className="py-2 pr-4">{formatCurrency(b.payment_amount)}</td>
                    <td className="py-2 pr-4">
                      <StatusBadge status={b.payment_status} />
                    </td>
                    <td className="py-2 pr-4">
                      <LoyaltyPointsUsed value={b.loyalty_points_used} />
                    </td>
                    <td className="py-2 pr-4">
                      <StatusBadge status={b.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-xl bg-white p-4 shadow-sm">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-gray-800">Customers & their bookings</h3>
            <p className="mt-0.5 text-xs text-gray-500">
              Signed-in accounts with ground bookings, loyalty balance, and points redeemed per booking.
            </p>
          </div>
          <Button variant="secondary" className="!text-xs" onClick={() => navigate("/admin/customers/bookings")}>
            Open customer-wise view
          </Button>
        </div>
        {snapshots.length === 0 ? (
          <p className="text-sm text-gray-500">No customer-linked bookings yet.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {snapshots.map((snap) => (
              <div
                key={snap.user.id}
                className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-2 border-b border-gray-200 pb-3">
                  <div>
                    <p className="font-semibold text-gray-900">{snap.user.name}</p>
                    <p className="text-xs text-gray-600">{snap.user.email}</p>
                    <p className="text-xs text-gray-600">{snap.user.phone || "—"}</p>
                  </div>
                  <Button
                    variant="ghost"
                    className="!px-2 !py-1 !text-xs"
                    onClick={() => navigate(`/admin/customers/bookings/${snap.user.id}`)}
                  >
                    Full view
                  </Button>
                </div>
                <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
                  {snap.loyalty_card ? (
                    <>
                      <div className="rounded-lg bg-white px-2 py-1.5 ring-1 ring-gray-100">
                        <span className="text-gray-500">Card</span>{" "}
                        <span className="font-mono font-medium text-emerald-900">{snap.loyalty_card.card_number}</span>
                      </div>
                      <div className="rounded-lg bg-white px-2 py-1.5 ring-1 ring-gray-100">
                        <span className="text-gray-500">Tier</span>{" "}
                        <span className="capitalize font-medium">{snap.loyalty_card.tier}</span>
                      </div>
                      <div className="rounded-lg bg-white px-2 py-1.5 ring-1 ring-gray-100">
                        <span className="text-gray-500">Total points</span>{" "}
                        <span className="font-semibold">{snap.loyalty_card.total_points}</span>
                      </div>
                      <div className="rounded-lg bg-white px-2 py-1.5 ring-1 ring-gray-100">
                        <span className="text-gray-500">Redeemable</span>{" "}
                        <span className="font-semibold">{snap.loyalty_card.redeemable_points}</span>
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-500 sm:col-span-2">No loyalty card on file.</p>
                  )}
                  <div className="rounded-lg bg-amber-50 px-2 py-1.5 ring-1 ring-amber-100 sm:col-span-2">
                    <span className="text-amber-900/80">Lifetime points redeemed on bookings:</span>{" "}
                    <span className="font-semibold text-amber-950">{snap.total_loyalty_points_redeemed_on_bookings ?? 0}</span>
                  </div>
                </div>
                <div className="mt-3 overflow-x-auto rounded-lg border border-gray-100 bg-white">
                  <table className="min-w-full text-left text-xs">
                    <thead className="bg-gray-50 text-[10px] uppercase text-gray-500">
                      <tr>
                        <th className="px-2 py-1.5">Date</th>
                        <th className="px-2 py-1.5">Slot</th>
                        <th className="px-2 py-1.5">Amt</th>
                        <th className="px-2 py-1.5">Pay</th>
                        <th className="px-2 py-1.5">Pts</th>
                        <th className="px-2 py-1.5">St</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(snap.bookings ?? []).map((b) => (
                        <tr key={b.id} className="border-t border-gray-100">
                          <td className="px-2 py-1.5 whitespace-nowrap">{b.booking_date}</td>
                          <td className="px-2 py-1.5">{b.time_slot}</td>
                          <td className="px-2 py-1.5">{formatCurrency(b.payment_amount)}</td>
                          <td className="px-2 py-1.5">
                            <StatusBadge status={b.payment_status} />
                          </td>
                          <td className="px-2 py-1.5">
                            <LoyaltyPointsUsed value={b.loyalty_points_used} />
                          </td>
                          <td className="px-2 py-1.5">
                            <StatusBadge status={b.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import { NavLink } from "react-router-dom";
import { useCompany } from "../../context/CompanyContext";

function Icon({ children, className = "" }) {
  return (
    <svg
      className={`h-5 w-5 shrink-0 ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      {children}
    </svg>
  );
}

function IconDashboard() {
  return (
    <Icon>
      <path
        d="M3 10.5L12 4l9 6.5V20a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1v-9.5z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </Icon>
  );
}

function IconCalendar() {
  return (
    <Icon>
      <rect
        x="3.5"
        y="5"
        width="17"
        height="15"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M8 3v4M16 3v4M3.5 10h17"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Icon>
  );
}

function IconUsers() {
  return (
    <Icon>
      <circle cx="9" cy="7" r="3" stroke="currentColor" strokeWidth="1.5" />
      <circle
        cx="16.5"
        cy="7.5"
        r="2.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M3 19c0-2.5 3.5-4 6-4s6 1.5 6 4M14 19c0-1.8 2.2-2.8 4.5-3.2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Icon>
  );
}

function IconClock() {
  return (
    <Icon>
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M12 8v5l3 2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Icon>
  );
}

function IconGraduation() {
  return (
    <Icon>
      <path
        d="M4.5 10L12 6l7.5 4L12 14 4.5 10zM12 14v5M4.5 10v4.5c0 1.1 3.4 2.5 7.5 2.5s7.5-1.4 7.5-2.5V10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Icon>
  );
}

function IconSliders() {
  return (
    <Icon>
      <path
        d="M4 7h3M10 7h10M4 12h10M14 12h6M4 17h7M13 17h7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle
        cx="8.5"
        cy="7"
        r="1.5"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      <circle
        cx="12"
        cy="12"
        r="1.5"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      <circle
        cx="10"
        cy="17"
        r="1.5"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
    </Icon>
  );
}

function IconCard() {
  return (
    <Icon>
      <rect
        x="3"
        y="6"
        width="18"
        height="12"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M3 10h18" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M7 15h4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Icon>
  );
}

function IconChart() {
  return (
    <Icon>
      <path
        d="M4 19V5M4 19h16"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M8 16V11M12 16V8M16 16v-5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Icon>
  );
}

function IconMessage() {
  return (
    <Icon>
      <path
        d="M6.75 6.75h10.5a2.25 2.25 0 012.25 2.25v6a2.25 2.25 0 01-2.25 2.25H10.5l-3.75 2.25v-2.25H6.75a2.25 2.25 0 01-2.25-2.25V9a2.25 2.25 0 012.25-2.25z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M8.25 10.5h7.5M8.25 13.5h4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Icon>
  );
}

function IconShield() {
  return (
    <Icon>
      <path
        d="M12 3l7 3v5c0 4.5-2.8 7.5-7 9-4.2-1.5-7-4.5-7-9V6l7-3z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </Icon>
  );
}

function IconHistory() {
  return (
    <Icon>
      <path
        d="M12 8v4l3 2M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Icon>
  );
}

const NAV = [
  { to: "/admin/dashboard", label: "Dashboard", Icon: IconDashboard },
  { to: "/admin/bookings", label: "Bookings", Icon: IconCalendar },
  {
    to: "/admin/customers/bookings",
    label: "Customers & bookings",
    Icon: IconUsers,
  },
  { to: "/admin/students", label: "Students", Icon: IconGraduation },
  { to: "/admin/loyalty/rules", label: "Loyalty rules", Icon: IconSliders },
  { to: "/admin/loyalty/cards", label: "Loyalty cards", Icon: IconCard },
  { to: "/admin/reports", label: "Reports", Icon: IconChart },
  { to: "/admin/users", label: "Users", Icon: IconShield },
  { to: "/admin/activity-logs", label: "Activity logs", Icon: IconHistory },
  { to: "/admin/sms-logs", label: "SMS logs", Icon: IconMessage },
  { to: "/admin/time-slots", label: "Time slots", Icon: IconClock },
];

export default function Sidebar() {
  const { company } = useCompany();

  return (
    <aside className="flex w-64 flex-col border-r border-slate-800/80 bg-slate-950 text-slate-100 shadow-[4px_0_24px_-4px_rgba(0,0,0,0.35)]">
      <div className="relative px-4 pb-6 pt-7">
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-emerald-500/25 to-transparent"
          aria-hidden
        />
        <div className="flex items-center">
          <img
            src="/jca-admin-brand.png"
            alt={company?.name ? `${company.name} admin` : 'JCA Admin'}
            className="h-11 w-auto max-w-[11rem] object-contain object-left"
          />
        </div>
      </div>

      <nav
        className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-2 pb-4 pt-2"
        aria-label="Admin navigation"
      >
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
          Menu
        </p>
        {NAV.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              [
                "group relative flex items-center gap-3 rounded-lg border-l-[3px] py-2.5 pl-3 pr-3 text-[13px] font-medium transition-colors duration-150",
                isActive
                  ? "border-emerald-400 bg-emerald-500/[0.12] text-white shadow-sm ring-1 ring-white/[0.06]"
                  : "border-transparent text-slate-400 hover:bg-slate-800/70 hover:text-slate-100",
              ].join(" ")
            }
          >
            <Icon />
            <span className="min-w-0 leading-snug">{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

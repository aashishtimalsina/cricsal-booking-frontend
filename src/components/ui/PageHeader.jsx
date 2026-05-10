export default function PageHeader({ title, subtitle, action, eyebrow, className = '' }) {
  return (
    <div className={`mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-start sm:justify-between ${className}`}>
      <div>
        {eyebrow && <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-green-700">{eyebrow}</p>}
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl lg:text-4xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-gray-600">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

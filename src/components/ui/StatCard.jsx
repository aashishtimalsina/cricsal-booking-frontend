export default function StatCard({ label, value, onClick, hint }) {
  const Comp = onClick ? 'button' : 'div';
  return (
    <Comp
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`rounded-xl border border-gray-100 bg-white p-4 shadow-sm ${onClick ? 'cursor-pointer text-left hover:border-green-200' : ''}`}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
      {hint ? <p className="mt-1.5 text-xs leading-snug text-gray-500">{hint}</p> : null}
    </Comp>
  );
}

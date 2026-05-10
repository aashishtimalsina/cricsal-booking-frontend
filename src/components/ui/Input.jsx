/** Shared with selects / custom fields */
export const fieldClass =
  'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 disabled:bg-gray-50 read-only:bg-gray-50 read-only:cursor-default read-only:text-gray-800 read-only:focus:border-gray-300 read-only:focus:ring-0';

export default function Input({ label, className = '', id, rows, ...props }) {
  const inputId = id || props.name;
  const Control = rows ? 'textarea' : 'input';

  return (
    <label className="flex flex-col gap-1 text-sm">
      {label && <span className="font-medium text-gray-700">{label}</span>}
      <Control
        id={inputId}
        rows={rows || undefined}
        className={`${fieldClass} ${rows ? 'min-h-[88px] resize-y' : ''} ${className}`}
        {...props}
      />
    </label>
  );
}

export default function Button({ children, className = '', variant = 'primary', size = 'md', type = 'button', ...props }) {
  const base =
    'inline-flex items-center justify-center font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';
  const sizes = {
    md: 'rounded-xl px-4 py-2.5 text-sm',
    lg: 'rounded-xl px-6 py-3.5 text-base shadow-md',
  };
  const variants = {
    primary:
      '!bg-green-600 !text-white shadow-sm ring-1 ring-green-700/30 hover:!bg-green-700 focus:!ring-green-500 focus:ring-offset-2 active:translate-y-[0.5px]',
    secondary: 'rounded-xl border border-stone-200 bg-white text-stone-800 hover:bg-stone-50 focus:ring-stone-400',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    ghost: 'rounded-xl bg-transparent text-stone-600 hover:bg-stone-100 focus:ring-stone-300',
  };
  return (
    <button type={type} className={`${base} ${sizes[size] || sizes.md} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

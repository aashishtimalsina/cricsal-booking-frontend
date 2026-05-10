export function formatCurrency(value) {
  const n = Number(value);
  if (Number.isNaN(n)) return '—';
  return new Intl.NumberFormat('en-NP', { style: 'currency', currency: 'NPR' }).format(n);
}

/**
 * Academy package & payment catalog — keep keys/labels aligned with
 * cricsal-api/config/academy.php
 */

export const ACADEMY_PAYMENT_TYPES = [
  { value: 'qr', label: 'QR / digital' },
  { value: 'cash', label: 'Cash' },
];

export const ACADEMY_PACKAGES = [
  { value: '1_month', label: '1 month' },
  { value: '3_months', label: '3 months' },
  { value: '6_months', label: '6 months' },
  { value: '12_months', label: '12 months' },
];

export const ACADEMY_PAYMENT_CATEGORIES = [
  { value: 'full', label: 'Full payment' },
  { value: 'partial', label: 'Partial payment' },
];

export function academyPaymentTypeLabel(value) {
  return ACADEMY_PAYMENT_TYPES.find((x) => x.value === value)?.label ?? value;
}

export function academyPackageLabel(value) {
  return ACADEMY_PACKAGES.find((x) => x.value === value)?.label ?? value;
}

export function academyPaymentCategoryLabel(value) {
  return ACADEMY_PAYMENT_CATEGORIES.find((x) => x.value === value)?.label ?? value;
}

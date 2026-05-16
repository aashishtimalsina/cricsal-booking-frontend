import { BSToAD } from 'bikram-sambat-js';

const BS_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Convert Bikram Sambat YYYY-MM-DD (English numerals) to Gregorian YYYY-MM-DD.
 * Returns empty string when input is empty or invalid.
 */
export function bsToAdDateString(bsDate) {
  const raw = String(bsDate ?? '').trim();
  if (!raw) return '';
  if (!BS_DATE_PATTERN.test(raw)) return '';

  try {
    return BSToAD(raw);
  } catch {
    return '';
  }
}

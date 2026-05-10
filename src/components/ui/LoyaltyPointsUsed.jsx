/**
 * Shows how many loyalty points were applied to a booking.
 * 0 = explicitly none used (muted). >0 = redeemed (accent). Invalid/missing = em dash.
 */
export default function LoyaltyPointsUsed({ value, className = '' }) {
  const n = Number(value);
  const safe = Number.isFinite(n) ? Math.max(0, Math.floor(n)) : null;

  if (safe === null) {
    return (
      <span className={`text-gray-400 ${className}`} title="Not available">
        —
      </span>
    );
  }

  if (safe === 0) {
    return (
      <span
        className={`tabular-nums text-gray-500 ${className}`}
        title="No loyalty points were applied to this booking"
      >
        0
      </span>
    );
  }

  return (
    <span
      className={`font-medium tabular-nums text-amber-900 ${className}`}
      title={`${safe} loyalty point${safe === 1 ? '' : 's'} redeemed on this booking`}
    >
      {safe}
    </span>
  );
}

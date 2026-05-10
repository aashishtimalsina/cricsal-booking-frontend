import { useQuery } from "@tanstack/react-query";
import { Navigate } from "react-router-dom";
import PageHeader from "../../components/ui/PageHeader";
import { myLoyaltyCard } from "../../api/loyalty";
import useAuthStore from "../../store/authStore";
import { useCompany } from "../../context/CompanyContext";

const tierColors = {
  bronze: "#CD7F32",
  silver: "#C0C0C0",
  gold: "#FFD700",
  platinum: "#E5E4E2",
};

export default function MyLoyaltyCard() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const { company } = useCompany();

  const { data, isLoading } = useQuery({
    queryKey: ["my-loyalty"],
    queryFn: async () => (await myLoyaltyCard()).data,
    enabled: !!token && user?.role === "customer",
  });

  if (!token || user?.role !== "customer")
    return <Navigate to="/login" replace />;

  const card = data?.data ?? data;

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <PageHeader title="My loyalty card" />
      {isLoading || !card ? (
        <p className="text-gray-600">Loading…</p>
      ) : (
        <div
          className="rounded-2xl p-8 text-gray-900 shadow-lg"
          style={{
            background: `linear-gradient(135deg, ${tierColors[card.tier] || "#166534"} 0%, #fff 60%)`,
          }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-green-900">
            {company.short_name || company.name}
          </p>
          <p className="mt-4 text-2xl font-bold">{card.card_number}</p>
          <p className="mt-2 text-sm">Member points: {card.total_points}</p>
          <p className="text-sm">Redeemable: {card.redeemable_points}</p>
          <p className="mt-4 inline-block rounded-full bg-black/80 px-3 py-1 text-xs font-semibold uppercase text-white">
            {card.tier}
          </p>
        </div>
      )}
    </div>
  );
}

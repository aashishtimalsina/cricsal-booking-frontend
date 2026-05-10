import { useQuery } from "@tanstack/react-query";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import StatusBadge from "../../components/ui/StatusBadge";
import { listLoyaltyCards } from "../../api/loyalty";
import api from "../../api/axios";
import { useCompany } from "../../context/CompanyContext";

function slugForFile(shortName) {
  return (shortName || "jca")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export default function LoyaltyCards() {
  const { company } = useCompany();
  const { data, isLoading } = useQuery({
    queryKey: ["loyalty-cards"],
    queryFn: async () => (await listLoyaltyCards()).data,
  });
  const rows = data?.data ?? [];

  async function printPdf(id) {
    const res = await api.get(`/loyalty/cards/${id}/pdf`, {
      responseType: "blob",
    });
    const blob = new Blob([res.data], { type: "application/pdf" });
    const w = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = w;
    a.download = `${slugForFile(company.short_name)}-loyalty-${id}.pdf`;
    a.click();
    window.URL.revokeObjectURL(w);
  }

  return (
    <div>
      <PageHeader title="Loyalty cards" />
      {isLoading ? (
        <p className="text-gray-600">Loading…</p>
      ) : (
        <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Card</th>
                <th className="px-4 py-3">Member</th>
                <th className="px-4 py-3">Tier</th>
                <th className="px-4 py-3">Points</th>
                <th className="px-4 py-3">PDF</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id} className="border-t border-gray-100">
                  <td className="px-4 py-3">{c.card_number}</td>
                  <td className="px-4 py-3">{c.user?.name}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={c.tier} />
                  </td>
                  <td className="px-4 py-3">{c.total_points}</td>
                  <td className="px-4 py-3">
                    <Button
                      className="!py-1 !text-xs"
                      variant="secondary"
                      onClick={() => printPdf(c.id)}
                    >
                      Print
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

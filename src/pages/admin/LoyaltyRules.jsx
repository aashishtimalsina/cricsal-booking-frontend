import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { listLoyaltyRules, updateLoyaltyRule } from '../../api/loyalty';
import { useToast } from '../../context/ToastContext';

export default function LoyaltyRules() {
  const { showToast } = useToast();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['loyalty-rules'],
    queryFn: async () => (await listLoyaltyRules()).data,
  });
  const rules = data?.data ?? [];
  const rule = rules[0];

  const mutation = useMutation({
    mutationFn: (payload) => updateLoyaltyRule(rule.id, payload),
    onSuccess: () => {
      showToast('Saved');
      qc.invalidateQueries({ queryKey: ['loyalty-rules'] });
    },
    onError: () => showToast('Failed'),
  });

  if (isLoading || !rule) return <p className="text-gray-600">Loading…</p>;

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title="Loyalty rules" />
      <form
        className="space-y-3 rounded-xl bg-white p-6 shadow-sm"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.target);
          mutation.mutate({
            name: fd.get('name'),
            description: rule.description,
            points_per_hour: Number(fd.get('points_per_hour')),
            min_booking_hours: Number(fd.get('min_booking_hours')),
            tier_threshold_bronze: rule.tier_threshold_bronze,
            tier_threshold_silver: Number(fd.get('tier_threshold_silver')),
            tier_threshold_gold: Number(fd.get('tier_threshold_gold')),
            tier_threshold_platinum: Number(fd.get('tier_threshold_platinum')),
            is_active: rule.is_active,
          });
        }}
      >
        <Input name="name" label="Name" defaultValue={rule.name} required />
        <Input name="points_per_hour" label="Points / hour" type="number" defaultValue={rule.points_per_hour} required />
        <Input name="min_booking_hours" label="Min hours to earn" type="number" defaultValue={rule.min_booking_hours} required />
        <Input name="tier_threshold_silver" label="Silver threshold" type="number" defaultValue={rule.tier_threshold_silver} required />
        <Input name="tier_threshold_gold" label="Gold threshold" type="number" defaultValue={rule.tier_threshold_gold} required />
        <Input name="tier_threshold_platinum" label="Platinum threshold" type="number" defaultValue={rule.tier_threshold_platinum} required />
        <Button type="submit" className="w-full" disabled={mutation.isPending}>
          Save
        </Button>
      </form>
    </div>
  );
}

import { type LucideIcon } from "lucide-react";

export default function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-2xl border border-pebble bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate">{label}</p>
        <Icon size={18} className="text-forest" />
      </div>
      <p className="mt-3 text-2xl font-medium text-charcoal">{value}</p>
    </div>
  );
}

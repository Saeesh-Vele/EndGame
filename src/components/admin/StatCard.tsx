import { type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

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
    <Card className="p-5 border border-pebble/80 bg-card shadow-xs rounded-2xl flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate">
          {label}
        </p>
        <p className="mt-1.5 text-3xl font-bold text-charcoal">{value}</p>
      </div>
      <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-forest/10 text-forest shrink-0">
        <Icon size={22} />
      </div>
    </Card>
  );
}


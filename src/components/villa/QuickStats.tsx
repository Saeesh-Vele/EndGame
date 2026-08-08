import { Users, DoorOpen, Bath, Bed } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function QuickStats({
  guests,
  bedrooms,
  bathrooms,
  beds,
}: {
  guests: number;
  bedrooms: number;
  bathrooms: number;
  beds: number;
}) {
  const stats = [
    { icon: Users, label: `${guests} Guests` },
    { icon: DoorOpen, label: `${bedrooms} Bedrooms` },
    { icon: Bath, label: `${bathrooms} Bathrooms` },
    { icon: Bed, label: `${beds} Beds` },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 py-8 border-b border-pebble">
      {stats.map((stat) => (
        <Card
          key={stat.label}
          className="p-4 border border-pebble/80 bg-card shadow-xs flex items-center gap-3 rounded-xl"
        >
          <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-forest/10 text-forest shrink-0">
            <stat.icon size={18} />
          </div>
          <span className="text-sm font-semibold text-charcoal">{stat.label}</span>
        </Card>
      ))}
    </div>
  );
}


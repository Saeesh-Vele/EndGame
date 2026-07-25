import { Users, DoorOpen, Bath, Bed } from "lucide-react";

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
    { icon: Users, label: `${guests} guests` },
    { icon: DoorOpen, label: `${bedrooms} bedrooms` },
    { icon: Bath, label: `${bathrooms} bathrooms` },
    { icon: Bed, label: `${beds} beds` },
  ];

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 py-6 border-b border-pebble text-sm text-charcoal">
      {stats.map((stat, i) => (
        <span key={stat.label} className="flex items-center gap-3">
          <span className="flex items-center gap-2">
            <stat.icon size={18} className="text-slate" />
            {stat.label}
          </span>
          {i < stats.length - 1 && (
            <span className="text-pebble" aria-hidden="true">
              ·
            </span>
          )}
        </span>
      ))}
    </div>
  );
}

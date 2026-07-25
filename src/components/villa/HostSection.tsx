import { BadgeCheck } from "lucide-react";

export default function HostSection({
  ownerName,
  hostSince,
  isSuperhost,
}: {
  ownerName: string;
  hostSince?: string;
  isSuperhost: boolean;
}) {
  const initial = ownerName.trim().charAt(0).toUpperCase() || "S";

  return (
    <div className="flex items-center gap-4 py-6 border-b border-pebble">
      <div className="flex items-center justify-center h-14 w-14 rounded-full bg-forest text-white text-lg font-medium shrink-0">
        {initial}
      </div>
      <div>
        <div className="flex items-center gap-2">
          <p className="text-base text-charcoal">Hosted by {ownerName}</p>
          {isSuperhost && (
            <span className="flex items-center gap-1 rounded-lg bg-forest/10 px-2 py-0.5 text-xs font-medium text-forest">
              <BadgeCheck size={13} />
              Superhost
            </span>
          )}
        </div>
        {hostSince && (
          <p className="text-sm text-slate mt-0.5">Hosting since {hostSince}</p>
        )}
      </div>
    </div>
  );
}

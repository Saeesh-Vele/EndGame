import { BadgeCheck, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";

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
    <div className="py-8 border-b border-pebble">
      <Card className="p-6 border border-pebble/80 bg-card shadow-xs rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center h-14 w-14 rounded-full bg-forest text-white text-lg font-semibold shrink-0 shadow-xs">
            {initial}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-charcoal">Hosted by {ownerName}</h3>
              {isSuperhost && (
                <span className="inline-flex items-center gap-1 rounded-full bg-forest/10 px-2.5 py-0.5 text-xs font-semibold text-forest">
                  <BadgeCheck size={13} />
                  Superhost
                </span>
              )}
            </div>
            {hostSince && (
              <p className="text-xs text-slate mt-1 font-medium">
                Verified host · Hosting since {hostSince}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-forest bg-forest/5 border border-forest/15 px-3.5 py-2 rounded-xl self-start sm:self-auto">
          <ShieldCheck size={16} className="shrink-0" />
          <span>100% In-Person Verified StayVilla Host</span>
        </div>
      </Card>
    </div>
  );
}


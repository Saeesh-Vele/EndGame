"use client";

import { useState } from "react";
import {
  Waves,
  Mountain,
  Trees,
  Wifi,
  ChefHat,
  Snowflake,
  Car,
  WashingMachine,
  Tv,
  Laptop,
  Flame,
  ShieldCheck,
  Dog,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const ICONS: Record<string, LucideIcon> = {
  "Private pool": Waves,
  "Rooftop pool": Waves,
  Beachfront: Waves,
  "Sea view": Waves,
  "Lake view": Waves,
  "Valley view": Mountain,
  "Garden view": Trees,
  "Free WiFi": Wifi,
  "Fully-equipped kitchen": ChefHat,
  "Air conditioning": Snowflake,
  "Free parking": Car,
  "Washing machine": WashingMachine,
  "Smart TV": Tv,
  "Dedicated workspace": Laptop,
  "BBQ grill": Flame,
  "24/7 caretaker": ShieldCheck,
  "Pet friendly": Dog,
};

export default function AmenitiesGrid({ amenities }: { amenities: string[] }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? amenities : amenities.slice(0, 8);

  return (
    <div className="py-8 border-b border-pebble">
      <span className="text-xs font-semibold uppercase tracking-widest text-slate">
        Amenities
      </span>
      <h2 className="font-display font-normal text-2xl text-charcoal mt-1 mb-6">
        What this villa offers
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
        {visible.map((amenity) => {
          const Icon = ICONS[amenity] ?? Sparkles;
          return (
            <div
              key={amenity}
              className="flex items-center gap-3.5 text-sm font-medium text-charcoal p-2.5 rounded-xl bg-sandstone/30 border border-pebble/40"
            >
              <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-card border border-pebble/60 text-forest shrink-0">
                <Icon size={16} />
              </div>
              <span>{amenity}</span>
            </div>
          );
        })}
      </div>

      {amenities.length > 8 && (
        <Button
          type="button"
          variant="outline"
          onClick={() => setExpanded((v) => !v)}
          className="mt-6 border-pebble text-charcoal hover:bg-sandstone font-medium"
        >
          {expanded ? "Show less" : `Show all ${amenities.length} amenities`}
        </Button>
      )}
    </div>
  );
}


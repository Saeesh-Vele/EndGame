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
    <div className="py-6 border-b border-pebble">
      <h2 className="text-lg text-charcoal mb-4">What this place offers</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3.5">
        {visible.map((amenity) => {
          const Icon = ICONS[amenity] ?? Sparkles;
          return (
            <span
              key={amenity}
              className="flex items-center gap-3 text-sm text-charcoal"
            >
              <Icon size={18} className="text-slate shrink-0" />
              {amenity}
            </span>
          );
        })}
      </div>
      {amenities.length > 8 && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="cursor-pointer mt-5 rounded-xl border border-charcoal px-5 py-2.5 text-sm font-medium text-charcoal transition-colors duration-200 hover:bg-sandstone"
        >
          {expanded ? "Show less" : `Show all ${amenities.length} amenities`}
        </button>
      )}
    </div>
  );
}

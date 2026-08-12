"use client";

import { useMemo } from "react";
import { MapPin, Calendar, Users, SlidersHorizontal } from "lucide-react";
import DestinationAutocomplete, {
  type DestinationOption,
} from "@/components/shared/DestinationAutocomplete";
import { useTodayISO } from "@/lib/use-today";
import { Destination } from "@/types";
import PriceRangeSlider from "./PriceRangeSlider";

import { Button } from "@/components/ui/button";

export default function SearchFilterBar({
  destinations,
  destinationCounts,
  selectedDestination,
  onDestinationChange,
  checkIn,
  checkOut,
  onCheckInChange,
  onCheckOutChange,
  guests,
  onGuestsChange,
  priceBounds,
  priceRange,
  onPriceRangeChange,
  onOpenMobileFilters,
}: {
  destinations: Destination[];
  /** Live villa counts keyed by destination name. */
  destinationCounts: Record<string, number>;
  /** Slug of the selected destination, or "" for all / more than one. */
  selectedDestination: string;
  onDestinationChange: (slug: string) => void;
  checkIn: string;
  checkOut: string;
  onCheckInChange: (value: string) => void;
  onCheckOutChange: (value: string) => void;
  guests: number;
  onGuestsChange: (value: number) => void;
  priceBounds: [number, number];
  priceRange: [number, number];
  onPriceRangeChange: (value: [number, number]) => void;
  onOpenMobileFilters: () => void;
}) {
  const today = useTodayISO();

  const options = useMemo<DestinationOption[]>(
    () =>
      destinations.map((d) => ({
        id: d.id,
        name: d.name,
        slug: d.slug,
        villaCount: destinationCounts[d.name] ?? 0,
      })),
    [destinations, destinationCounts]
  );

  const handleCheckInChange = (value: string) => {
    onCheckInChange(value);
    if (checkOut && value && checkOut <= value) onCheckOutChange("");
  };

  return (
    <div className="sticky top-18 z-40 bg-linen/95 backdrop-blur-md border-b border-pebble/60 shadow-xs">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-3.5">
        <Button
          type="button"
          variant="outline"
          onClick={onOpenMobileFilters}
          className="lg:hidden w-full gap-2 bg-card text-charcoal"
        >
          <SlidersHorizontal size={16} />
          Search &amp; filter
        </Button>

        <div className="hidden lg:flex lg:items-center lg:gap-5">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <MapPin size={16} className="text-slate shrink-0" />
            <DestinationAutocomplete
              inputId="villas-destination"
              options={options}
              value={selectedDestination}
              onChange={onDestinationChange}
              placeholder="All destinations"
              inputClassName="w-full bg-transparent text-sm text-charcoal outline-none placeholder:text-slate/70"
            />
          </div>

          <div className="w-px h-8 bg-pebble" />

          <label className="flex min-w-0 items-center gap-2">
            <Calendar size={16} className="text-slate shrink-0" />
            <input
              type="date"
              value={checkIn}
              min={today}
              onChange={(e) => handleCheckInChange(e.target.value)}
              aria-label="Check in"
              className="w-full min-w-0 cursor-pointer bg-transparent text-sm text-charcoal outline-none"
            />
          </label>

          <div className="w-px h-8 bg-pebble" />

          <label className="flex min-w-0 items-center gap-2">
            <Calendar size={16} className="text-slate shrink-0" />
            <input
              type="date"
              value={checkOut}
              min={checkIn || today}
              onChange={(e) => onCheckOutChange(e.target.value)}
              aria-label="Check out"
              className="w-full min-w-0 cursor-pointer bg-transparent text-sm text-charcoal outline-none"
            />
          </label>

          <div className="w-px h-8 bg-pebble" />

          <label className="flex min-w-0 items-center gap-2">
            <Users size={16} className="text-slate shrink-0" />
            <input
              type="number"
              min={1}
              value={guests || ""}
              placeholder="Guests"
              onChange={(e) => onGuestsChange(Number(e.target.value) || 0)}
              aria-label="Guests"
              className="w-16 min-w-0 bg-transparent text-sm text-charcoal outline-none placeholder:text-slate/70"
            />
          </label>

          <div className="w-px h-8 bg-pebble" />

          <div className="min-w-0 flex-1 max-w-[220px]">
            <PriceRangeSlider
              min={priceBounds[0]}
              max={priceBounds[1]}
              step={1000}
              value={priceRange}
              onChange={onPriceRangeChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

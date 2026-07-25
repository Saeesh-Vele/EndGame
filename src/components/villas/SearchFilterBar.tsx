"use client";

import { MapPin, Calendar, Users, SlidersHorizontal } from "lucide-react";
import PriceRangeSlider from "./PriceRangeSlider";

export default function SearchFilterBar({
  destinationNames,
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
  destinationNames: string[];
  selectedDestination: string;
  onDestinationChange: (value: string) => void;
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
  return (
    <div className="sticky top-18 z-40 bg-linen/95 backdrop-blur-sm border-b border-pebble">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-4">
        <button
          type="button"
          onClick={onOpenMobileFilters}
          className="md:hidden cursor-pointer flex items-center justify-center gap-2 w-full rounded-xl border border-pebble bg-white px-4 py-3 text-sm text-charcoal transition-colors duration-200 hover:border-forest"
        >
          <SlidersHorizontal size={16} />
          Search &amp; filter
        </button>

        <div className="hidden md:flex md:items-center md:gap-6">
          <label className="flex items-center gap-2 min-w-[150px]">
            <MapPin size={16} className="text-slate shrink-0" />
            <select
              value={selectedDestination}
              onChange={(e) => onDestinationChange(e.target.value)}
              aria-label="Destination"
              className="cursor-pointer w-full bg-transparent text-sm text-charcoal outline-none"
            >
              <option value="">All destinations</option>
              {destinationNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>

          <div className="w-px h-8 bg-pebble" />

          <label className="flex items-center gap-2">
            <Calendar size={16} className="text-slate shrink-0" />
            <input
              type="date"
              value={checkIn}
              onChange={(e) => onCheckInChange(e.target.value)}
              aria-label="Check in"
              className="cursor-pointer bg-transparent text-sm text-charcoal outline-none"
            />
          </label>

          <div className="w-px h-8 bg-pebble" />

          <label className="flex items-center gap-2">
            <Calendar size={16} className="text-slate shrink-0" />
            <input
              type="date"
              value={checkOut}
              onChange={(e) => onCheckOutChange(e.target.value)}
              aria-label="Check out"
              className="cursor-pointer bg-transparent text-sm text-charcoal outline-none"
            />
          </label>

          <div className="w-px h-8 bg-pebble" />

          <label className="flex items-center gap-2">
            <Users size={16} className="text-slate shrink-0" />
            <input
              type="number"
              min={0}
              value={guests || ""}
              placeholder="Guests"
              onChange={(e) => onGuestsChange(Number(e.target.value) || 0)}
              className="w-20 bg-transparent text-sm text-charcoal outline-none placeholder:text-slate/70"
            />
          </label>

          <div className="w-px h-8 bg-pebble" />

          <div className="flex-1 max-w-[220px]">
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

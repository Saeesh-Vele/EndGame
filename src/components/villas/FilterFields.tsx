"use client";

import PriceRangeSlider from "./PriceRangeSlider";
import { Button } from "@/components/ui/button";

const BEDROOM_OPTIONS = [0, 1, 2, 3, 4, 5];

export default function FilterFields({
  destinationNames,
  destinationCounts,
  selectedDestinations,
  onToggleDestination,
  priceBounds,
  priceRange,
  onPriceRangeChange,
  bedroomsMin,
  onBedroomsChange,
  amenityOptions,
  selectedAmenities,
  onToggleAmenity,
}: {
  destinationNames: string[];
  destinationCounts: Record<string, number>;
  selectedDestinations: string[];
  onToggleDestination: (name: string) => void;
  priceBounds: [number, number];
  priceRange: [number, number];
  onPriceRangeChange: (value: [number, number]) => void;
  bedroomsMin: number;
  onBedroomsChange: (value: number) => void;
  amenityOptions: string[];
  selectedAmenities: string[];
  onToggleAmenity: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h3 className="text-xs font-semibold text-charcoal uppercase tracking-wider mb-3">Destination</h3>
        <div className="flex flex-col gap-1">
          {destinationNames.map((name) => (
            <label
              key={name}
              className="flex items-center justify-between cursor-pointer min-h-[36px] px-1 py-1 rounded-lg hover:bg-sandstone/50 transition-colors duration-150"
            >
              <span className="flex items-center gap-2.5 text-sm font-medium text-charcoal">
                <input
                  type="checkbox"
                  checked={selectedDestinations.includes(name)}
                  onChange={() => onToggleDestination(name)}
                  className="h-4 w-4 rounded accent-forest cursor-pointer"
                />
                {name}
              </span>
              <span className="text-xs font-medium text-slate bg-sandstone px-2 py-0.5 rounded-md">
                {destinationCounts[name] ?? 0}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold text-charcoal uppercase tracking-wider mb-3">Price Range</h3>
        <PriceRangeSlider
          min={priceBounds[0]}
          max={priceBounds[1]}
          step={1000}
          value={priceRange}
          onChange={onPriceRangeChange}
        />
      </div>

      <div>
        <h3 className="text-xs font-semibold text-charcoal uppercase tracking-wider mb-3">Bedrooms</h3>
        <div className="flex flex-wrap gap-2">
          {BEDROOM_OPTIONS.map((n) => (
            <Button
              key={n}
              type="button"
              variant={bedroomsMin === n ? "default" : "outline"}
              size="sm"
              onClick={() => onBedroomsChange(n)}
              className="min-w-[44px]"
            >
              {n === 0 ? "Any" : `${n}+`}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold text-charcoal uppercase tracking-wider mb-3">Amenities</h3>
        <div className="flex flex-col gap-1">
          {amenityOptions.map((amenity) => (
            <label
              key={amenity}
              className="flex items-center gap-2.5 cursor-pointer text-sm font-medium text-charcoal min-h-[36px] px-1 py-1 rounded-lg hover:bg-sandstone/50 transition-colors duration-150"
            >
              <input
                type="checkbox"
                checked={selectedAmenities.includes(amenity)}
                onChange={() => onToggleAmenity(amenity)}
                className="h-4 w-4 rounded accent-forest cursor-pointer"
              />
              {amenity}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}


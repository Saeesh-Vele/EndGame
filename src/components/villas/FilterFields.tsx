"use client";

import PriceRangeSlider from "./PriceRangeSlider";

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
        <h3 className="text-sm font-medium text-charcoal mb-3">Destination</h3>
        <div className="flex flex-col gap-2.5">
          {destinationNames.map((name) => (
            <label
              key={name}
              className="flex items-center justify-between cursor-pointer"
            >
              <span className="flex items-center gap-2.5 text-sm text-charcoal">
                <input
                  type="checkbox"
                  checked={selectedDestinations.includes(name)}
                  onChange={() => onToggleDestination(name)}
                  className="h-4 w-4 rounded accent-forest cursor-pointer"
                />
                {name}
              </span>
              <span className="text-xs text-slate">
                {destinationCounts[name] ?? 0}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-charcoal mb-3">Price range</h3>
        <PriceRangeSlider
          min={priceBounds[0]}
          max={priceBounds[1]}
          step={1000}
          value={priceRange}
          onChange={onPriceRangeChange}
        />
      </div>

      <div>
        <h3 className="text-sm font-medium text-charcoal mb-3">Bedrooms</h3>
        <div className="flex flex-wrap gap-2">
          {BEDROOM_OPTIONS.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onBedroomsChange(n)}
              className={`cursor-pointer rounded-xl border px-3.5 py-1.5 text-sm transition-colors duration-200 ${
                bedroomsMin === n
                  ? "border-forest bg-forest text-white"
                  : "border-pebble text-charcoal hover:border-forest"
              }`}
            >
              {n === 0 ? "Any" : `${n}+`}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-charcoal mb-3">Amenities</h3>
        <div className="flex flex-col gap-2.5">
          {amenityOptions.map((amenity) => (
            <label
              key={amenity}
              className="flex items-center gap-2.5 cursor-pointer text-sm text-charcoal"
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

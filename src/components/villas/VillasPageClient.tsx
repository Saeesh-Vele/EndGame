"use client";

import { useMemo, useState } from "react";
import VillaCard from "@/components/home/VillaCard";
import SearchFilterBar from "./SearchFilterBar";
import FilterSidebar from "./FilterSidebar";
import FilterSheet from "./FilterSheet";
import SortDropdown from "./SortDropdown";
import { Villa, Destination } from "@/types";

const AMENITY_OPTIONS = [
  "Private pool",
  "Sea view",
  "Valley view",
  "Rooftop pool",
  "Lake view",
  "Beachfront",
  "Garden view",
];

type SortOption = "recommended" | "price-asc" | "price-desc" | "rating";

export default function VillasPageClient({
  villas,
  destinations,
  initialDestination,
}: {
  villas: Villa[];
  destinations: Destination[];
  initialDestination?: string;
}) {
  const priceBounds = useMemo<[number, number]>(() => {
    const prices = villas.map((v) => v.price_per_night);
    const lo = Math.floor(Math.min(...prices) / 1000) * 1000;
    const hi = Math.ceil(Math.max(...prices) / 1000) * 1000;
    return [lo, hi];
  }, [villas]);

  const [selectedDestinations, setSelectedDestinations] = useState<string[]>(
    initialDestination ? [initialDestination] : []
  );
  const [priceRange, setPriceRange] = useState<[number, number]>(priceBounds);
  const [bedroomsMin, setBedroomsMin] = useState(0);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [guests, setGuests] = useState(0);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [sort, setSort] = useState<SortOption>("recommended");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const destinationNames = useMemo(
    () => destinations.map((d) => d.name),
    [destinations]
  );

  const destinationCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const villa of villas) {
      counts[villa.destination] = (counts[villa.destination] ?? 0) + 1;
    }
    return counts;
  }, [villas]);

  const toggleDestination = (name: string) => {
    setSelectedDestinations((prev) =>
      prev.includes(name) ? prev.filter((d) => d !== name) : [...prev, name]
    );
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity]
    );
  };

  const clearAll = () => {
    setSelectedDestinations([]);
    setPriceRange(priceBounds);
    setBedroomsMin(0);
    setSelectedAmenities([]);
    setGuests(0);
  };

  const filtered = useMemo(() => {
    return villas.filter((villa) => {
      if (
        selectedDestinations.length &&
        !selectedDestinations.includes(villa.destination)
      )
        return false;
      if (
        villa.price_per_night < priceRange[0] ||
        villa.price_per_night > priceRange[1]
      )
        return false;
      if (bedroomsMin > 0 && villa.bedrooms < bedroomsMin) return false;
      if (guests > 0 && villa.max_guests < guests) return false;
      if (
        selectedAmenities.length &&
        !selectedAmenities.some((a) => villa.amenities.includes(a))
      )
        return false;
      return true;
    });
  }, [
    villas,
    selectedDestinations,
    priceRange,
    bedroomsMin,
    guests,
    selectedAmenities,
  ]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    switch (sort) {
      case "price-asc":
        return list.sort((a, b) => a.price_per_night - b.price_per_night);
      case "price-desc":
        return list.sort((a, b) => b.price_per_night - a.price_per_night);
      case "rating":
        return list.sort((a, b) => b.rating - a.rating);
      default:
        return list.sort((a, b) => {
          if (a.is_superhost !== b.is_superhost) return a.is_superhost ? -1 : 1;
          return b.rating - a.rating;
        });
    }
  }, [filtered, sort]);

  const singleDestinationValue =
    selectedDestinations.length === 1 ? selectedDestinations[0] : "";

  const handleDestinationDropdownChange = (value: string) => {
    setSelectedDestinations(value ? [value] : []);
  };

  const headingText = initialDestination
    ? `Villas in ${initialDestination}`
    : "All villas";

  const sharedFieldProps = {
    destinationNames,
    destinationCounts,
    selectedDestinations,
    onToggleDestination: toggleDestination,
    priceBounds,
    priceRange,
    onPriceRangeChange: setPriceRange,
    bedroomsMin,
    onBedroomsChange: setBedroomsMin,
    amenityOptions: AMENITY_OPTIONS,
    selectedAmenities,
    onToggleAmenity: toggleAmenity,
  };

  return (
    <div className="pt-18">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-8 sm:pt-10">
        <h1 className="font-display font-normal text-3xl sm:text-4xl text-charcoal">
          {headingText}
        </h1>
        <p className="mt-2 text-slate">
          Handpicked private villas, verified in person.
        </p>
      </div>

      <SearchFilterBar
        destinationNames={destinationNames}
        selectedDestination={singleDestinationValue}
        onDestinationChange={handleDestinationDropdownChange}
        checkIn={checkIn}
        checkOut={checkOut}
        onCheckInChange={setCheckIn}
        onCheckOutChange={setCheckOut}
        guests={guests}
        onGuestsChange={setGuests}
        priceBounds={priceBounds}
        priceRange={priceRange}
        onPriceRangeChange={setPriceRange}
        onOpenMobileFilters={() => setMobileFiltersOpen(true)}
      />

      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8 sm:py-10">
        <div className="flex gap-10">
          <aside className="hidden lg:block w-72 shrink-0">
            <FilterSidebar {...sharedFieldProps} onClear={clearAll} />
          </aside>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-4 mb-6">
              <p className="text-sm text-slate">
                {sorted.length} {sorted.length === 1 ? "villa" : "villas"} found
              </p>
              <SortDropdown
                value={sort}
                onChange={(v) => setSort(v as SortOption)}
              />
            </div>

            {sorted.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-10">
                {sorted.map((villa) => (
                  <VillaCard key={villa.id} villa={villa} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl bg-white shadow-sm py-16 text-center text-slate">
                No villas match your filters. Try adjusting them.
              </div>
            )}
          </div>
        </div>
      </div>

      <FilterSheet
        {...sharedFieldProps}
        open={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        resultCount={sorted.length}
        onClear={clearAll}
        checkIn={checkIn}
        checkOut={checkOut}
        onCheckInChange={setCheckIn}
        onCheckOutChange={setCheckOut}
        guests={guests}
        onGuestsChange={setGuests}
      />
    </div>
  );
}

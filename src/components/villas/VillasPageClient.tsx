"use client";

import { useEffect, useMemo, useState } from "react";
import { SearchX, X } from "lucide-react";
import VillaCard from "@/components/home/VillaCard";
import SearchFilterBar from "./SearchFilterBar";
import FilterSidebar from "./FilterSidebar";
import FilterSheet from "./FilterSheet";
import SortDropdown from "./SortDropdown";
import Breadcrumb from "@/components/shared/Breadcrumb";
import { Villa, Destination } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
  initialDestinations,
  initialCheckIn,
  initialCheckOut,
  initialGuests,
}: {
  villas: Villa[];
  destinations: Destination[];
  /** Destination *names*, already resolved from the URL's slugs. */
  initialDestinations: string[];
  initialCheckIn: string;
  initialCheckOut: string;
  initialGuests: number;
}) {
  const priceBounds = useMemo<[number, number]>(() => {
    const prices = villas.map((v) => v.price_per_night);
    const lo = Math.floor(Math.min(...prices) / 1000) * 1000;
    const hi = Math.ceil(Math.max(...prices) / 1000) * 1000;
    return [lo, hi];
  }, [villas]);

  const [selectedDestinations, setSelectedDestinations] =
    useState<string[]>(initialDestinations);
  const [priceRange, setPriceRange] = useState<[number, number]>(priceBounds);
  const [bedroomsMin, setBedroomsMin] = useState(0);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [guests, setGuests] = useState(initialGuests);
  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut);
  const [sort, setSort] = useState<SortOption>("recommended");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const destinationNames = useMemo(
    () => destinations.map((d) => d.name),
    [destinations]
  );

  const slugByName = useMemo(() => {
    const map: Record<string, string> = {};
    for (const d of destinations) map[d.name] = d.slug;
    return map;
  }, [destinations]);

  const nameBySlug = useMemo(() => {
    const map: Record<string, string> = {};
    for (const d of destinations) map[d.slug] = d.name;
    return map;
  }, [destinations]);

  const destinationCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const villa of villas) {
      counts[villa.destination] = (counts[villa.destination] ?? 0) + 1;
    }
    return counts;
  }, [villas]);

  const selectedSlugs = useMemo(
    () =>
      selectedDestinations
        .map((name) => slugByName[name])
        .filter(Boolean)
        .join(","),
    [selectedDestinations, slugByName]
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const put = (key: string, value: string) => {
      if (value) params.set(key, value);
      else params.delete(key);
    };

    put("destination", selectedSlugs);
    put("checkIn", checkIn);
    put("checkOut", checkOut);
    put("guests", guests > 0 ? String(guests) : "");

    const query = params.toString();
    const next = `${window.location.pathname}${query ? `?${query}` : ""}`;

    if (next !== `${window.location.pathname}${window.location.search}`) {
      window.history.replaceState(null, "", next);
    }
  }, [selectedSlugs, checkIn, checkOut, guests]);

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

  const hasActiveFilters =
    selectedDestinations.length > 0 ||
    priceRange[0] > priceBounds[0] ||
    priceRange[1] < priceBounds[1] ||
    bedroomsMin > 0 ||
    selectedAmenities.length > 0 ||
    guests > 0;

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

  const singleDestinationSlug =
    selectedDestinations.length === 1
      ? (slugByName[selectedDestinations[0]] ?? "")
      : "";

  const handleDestinationDropdownChange = (slug: string) => {
    const name = nameBySlug[slug];
    setSelectedDestinations(name ? [name] : []);
  };

  const headingText =
    selectedDestinations.length === 1
      ? `Villas in ${selectedDestinations[0]}`
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
      <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-6 sm:pt-8 pb-4">
        <Breadcrumb
          items={[
            { label: "Villas", href: "/villas" },
            ...(selectedDestinations.length === 1
              ? [{ label: selectedDestinations[0] }]
              : []),
          ]}
        />
        <h1 className="font-display font-normal text-3xl sm:text-4xl text-charcoal mt-3">
          {headingText}
        </h1>
        <p className="mt-2 text-slate text-sm sm:text-base">
          Handpicked private villas, verified in person.
        </p>
      </div>

      <SearchFilterBar
        destinations={destinations}
        destinationCounts={destinationCounts}
        selectedDestination={singleDestinationSlug}
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <p className="text-sm font-medium text-slate">
                <span className="text-charcoal font-semibold">{sorted.length}</span>{" "}
                {sorted.length === 1 ? "villa" : "villas"} available
              </p>
              <SortDropdown
                value={sort}
                onChange={(v) => setSort(v as SortOption)}
              />
            </div>

            {/* Active Filter Chips Bar */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 mb-6 p-3 rounded-xl bg-sandstone/40 border border-pebble">
                <span className="text-xs font-semibold text-slate uppercase tracking-wider mr-1">
                  Active Filters:
                </span>
                {selectedDestinations.map((dest) => (
                  <Badge
                    key={dest}
                    variant="secondary"
                    onClick={() => toggleDestination(dest)}
                    className="cursor-pointer gap-1.5 bg-card hover:bg-pebble border border-pebble text-charcoal text-xs px-2.5 py-1"
                  >
                    {dest}
                    <X size={12} className="text-slate hover:text-charcoal" />
                  </Badge>
                ))}
                {(priceRange[0] > priceBounds[0] || priceRange[1] < priceBounds[1]) && (
                  <Badge
                    variant="secondary"
                    onClick={() => setPriceRange(priceBounds)}
                    className="cursor-pointer gap-1.5 bg-card hover:bg-pebble border border-pebble text-charcoal text-xs px-2.5 py-1"
                  >
                    ₹{priceRange[0].toLocaleString("en-IN")} – ₹{priceRange[1].toLocaleString("en-IN")}
                    <X size={12} className="text-slate hover:text-charcoal" />
                  </Badge>
                )}
                {bedroomsMin > 0 && (
                  <Badge
                    variant="secondary"
                    onClick={() => setBedroomsMin(0)}
                    className="cursor-pointer gap-1.5 bg-card hover:bg-pebble border border-pebble text-charcoal text-xs px-2.5 py-1"
                  >
                    {bedroomsMin}+ Bedrooms
                    <X size={12} className="text-slate hover:text-charcoal" />
                  </Badge>
                )}
                {guests > 0 && (
                  <Badge
                    variant="secondary"
                    onClick={() => setGuests(0)}
                    className="cursor-pointer gap-1.5 bg-card hover:bg-pebble border border-pebble text-charcoal text-xs px-2.5 py-1"
                  >
                    {guests}+ Guests
                    <X size={12} className="text-slate hover:text-charcoal" />
                  </Badge>
                )}
                {selectedAmenities.map((amenity) => (
                  <Badge
                    key={amenity}
                    variant="secondary"
                    onClick={() => toggleAmenity(amenity)}
                    className="cursor-pointer gap-1.5 bg-card hover:bg-pebble border border-pebble text-charcoal text-xs px-2.5 py-1"
                  >
                    {amenity}
                    <X size={12} className="text-slate hover:text-charcoal" />
                  </Badge>
                ))}
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  onClick={clearAll}
                  className="text-xs text-forest hover:text-forest-light ml-auto"
                >
                  Clear all
                </Button>
              </div>
            )}

            {sorted.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
                {sorted.map((villa) => (
                  <VillaCard key={villa.id} villa={villa} />
                ))}
              </div>
            ) : (
              <Card className="py-16 sm:py-20 px-6 text-center border-pebble bg-card shadow-xs rounded-2xl">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-forest/10 text-forest mb-4">
                  <SearchX size={28} />
                </div>
                <h3 className="font-display font-normal text-2xl text-charcoal">
                  No villas match your filters
                </h3>
                <p className="mt-2 text-sm text-slate max-w-md mx-auto leading-relaxed">
                  Try adjusting your price range, clearing specific amenity filters, 
                  or exploring other destinations across India.
                </p>
                <Button
                  type="button"
                  variant="default"
                  onClick={clearAll}
                  className="mt-6"
                >
                  Clear all filters
                </Button>
              </Card>
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


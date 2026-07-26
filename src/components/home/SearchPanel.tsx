"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Calendar, Users, Search } from "lucide-react";
import DestinationAutocomplete, {
  type DestinationOption,
} from "@/components/shared/DestinationAutocomplete";
import { useTodayISO } from "@/lib/use-today";
import { Destination } from "@/types";

export default function SearchPanel({
  destinations,
}: {
  destinations: Destination[];
}) {
  const router = useRouter();
  const today = useTodayISO();

  const [destination, setDestination] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("");

  const options = useMemo<DestinationOption[]>(
    () =>
      destinations.map((d) => ({
        id: d.id,
        name: d.name,
        slug: d.slug,
        villaCount: d.villa_count,
      })),
    [destinations]
  );

  const handleCheckInChange = (value: string) => {
    setCheckIn(value);
    // A check-out that's now in the past relative to check-in is nonsense —
    // drop it rather than carrying it into the URL.
    if (checkOut && value && checkOut <= value) setCheckOut("");
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const params = new URLSearchParams();
    if (destination) params.set("destination", destination);
    if (checkIn) params.set("checkIn", checkIn);
    if (checkOut) params.set("checkOut", checkOut);

    const guestCount = Number.parseInt(guests, 10);
    if (Number.isFinite(guestCount) && guestCount > 0) {
      params.set("guests", String(guestCount));
    }

    const query = params.toString();
    router.push(query ? `/villas?${query}` : "/villas");
  };

  return (
    <div className="relative z-10 -mt-20 sm:-mt-12 max-w-5xl mx-auto px-5 sm:px-8">
      <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-3">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-0"
        >
          <div className="flex-1 flex items-center gap-3 px-3 py-2 sm:px-5">
            <MapPin size={18} className="text-slate shrink-0" />
            <span className="flex flex-col w-full">
              <label htmlFor="search-where" className="text-xs text-slate">
                Where
              </label>
              <DestinationAutocomplete
                inputId="search-where"
                options={options}
                value={destination}
                onChange={setDestination}
                placeholder="Search destinations"
                inputClassName="text-sm text-charcoal placeholder:text-slate/70 bg-transparent outline-none w-full"
              />
            </span>
          </div>

          <div className="hidden sm:block w-px h-10 bg-pebble" />

          <label className="flex-1 flex items-center gap-3 px-3 py-2 sm:px-5">
            <Calendar size={18} className="text-slate shrink-0" />
            <span className="flex flex-col w-full">
              <span className="text-xs text-slate">Check in</span>
              <input
                type="date"
                value={checkIn}
                min={today}
                onChange={(e) => handleCheckInChange(e.target.value)}
                className="text-sm text-charcoal bg-transparent outline-none w-full cursor-pointer"
              />
            </span>
          </label>

          <div className="hidden sm:block w-px h-10 bg-pebble" />

          <label className="flex-1 flex items-center gap-3 px-3 py-2 sm:px-5">
            <Calendar size={18} className="text-slate shrink-0" />
            <span className="flex flex-col w-full">
              <span className="text-xs text-slate">Check out</span>
              <input
                type="date"
                value={checkOut}
                min={checkIn || today}
                onChange={(e) => setCheckOut(e.target.value)}
                className="text-sm text-charcoal bg-transparent outline-none w-full cursor-pointer"
              />
            </span>
          </label>

          <div className="hidden sm:block w-px h-10 bg-pebble" />

          <label className="flex-1 flex items-center gap-3 px-3 py-2 sm:px-5">
            <Users size={18} className="text-slate shrink-0" />
            <span className="flex flex-col w-full">
              <span className="text-xs text-slate">Guests</span>
              <input
                type="number"
                min={1}
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                placeholder="Add guests"
                className="text-sm text-charcoal placeholder:text-slate/70 bg-transparent outline-none w-full"
              />
            </span>
          </label>

          <button
            type="submit"
            className="cursor-pointer shrink-0 flex items-center justify-center gap-2 rounded-xl bg-forest hover:bg-forest-light active:bg-forest-dark text-white text-sm font-medium px-6 py-3.5 sm:py-3 transition-colors duration-200"
          >
            <Search size={17} />
            <span className="sm:hidden">Search</span>
          </button>
        </form>
      </div>
    </div>
  );
}

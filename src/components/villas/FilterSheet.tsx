"use client";

import { X } from "lucide-react";
import FilterFields from "./FilterFields";

type FilterFieldsProps = React.ComponentProps<typeof FilterFields>;

export default function FilterSheet({
  open,
  onClose,
  resultCount,
  onClear,
  checkIn,
  checkOut,
  onCheckInChange,
  onCheckOutChange,
  guests,
  onGuestsChange,
  ...fieldProps
}: FilterFieldsProps & {
  open: boolean;
  onClose: () => void;
  resultCount: number;
  onClear: () => void;
  checkIn: string;
  checkOut: string;
  onCheckInChange: (value: string) => void;
  onCheckOutChange: (value: string) => void;
  guests: number;
  onGuestsChange: (value: number) => void;
}) {
  return (
    <div
      className={`md:hidden fixed inset-0 z-50 transition-opacity duration-300 ${
        open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
      aria-hidden={!open}
    >
      <div className="absolute inset-0 bg-charcoal/40" onClick={onClose} />

      <div
        className={`absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-linen transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="sticky top-0 bg-linen border-b border-pebble px-5 py-4 flex items-center justify-between">
          <h2 className="text-base text-charcoal">Filters</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close filters"
            className="cursor-pointer p-1 text-charcoal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-5 py-6 flex flex-col gap-8">
          <div>
            <h3 className="text-sm font-medium text-charcoal mb-3">Dates</h3>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="date"
                value={checkIn}
                onChange={(e) => onCheckInChange(e.target.value)}
                aria-label="Check in"
                className="rounded-xl border border-pebble px-3 py-2.5 text-sm text-charcoal outline-none cursor-pointer"
              />
              <input
                type="date"
                value={checkOut}
                onChange={(e) => onCheckOutChange(e.target.value)}
                aria-label="Check out"
                className="rounded-xl border border-pebble px-3 py-2.5 text-sm text-charcoal outline-none cursor-pointer"
              />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-charcoal mb-3">Guests</h3>
            <input
              type="number"
              min={0}
              value={guests || ""}
              placeholder="Any"
              onChange={(e) => onGuestsChange(Number(e.target.value) || 0)}
              className="w-full rounded-xl border border-pebble px-3 py-2.5 text-sm text-charcoal outline-none placeholder:text-slate/70"
            />
          </div>

          <FilterFields {...fieldProps} />
        </div>

        <div className="sticky bottom-0 bg-linen border-t border-pebble px-5 py-4 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onClear}
            className="cursor-pointer text-sm font-medium text-forest hover:text-forest-light transition-colors duration-200"
          >
            Clear all
          </button>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer flex-1 rounded-xl bg-forest hover:bg-forest-light active:bg-forest-dark text-white text-sm font-medium px-6 py-3 transition-colors duration-200"
          >
            Show {resultCount} {resultCount === 1 ? "villa" : "villas"}
          </button>
        </div>
      </div>
    </div>
  );
}

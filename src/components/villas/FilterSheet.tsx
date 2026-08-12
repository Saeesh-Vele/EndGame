"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import FilterFields from "./FilterFields";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  return (
    <div
      className={`lg:hidden fixed inset-0 z-50 transition-opacity duration-300 ${
        open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
      aria-hidden={!open}
    >
      <div className="absolute inset-0 bg-charcoal/50 backdrop-blur-xs" onClick={onClose} />

      <div
        className={`absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-linen shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="sticky top-0 bg-linen/95 backdrop-blur-md z-10 border-b border-pebble px-5 py-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-charcoal">Filters</h2>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            aria-label="Close filters"
            className="rounded-full min-h-[36px] min-w-[36px]"
          >
            <X size={18} />
          </Button>
        </div>

        <div className="px-5 py-6 flex flex-col gap-8">
          <div>
            <h3 className="text-sm font-medium text-charcoal mb-3">Dates</h3>
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="date"
                value={checkIn}
                onChange={(e) => onCheckInChange(e.target.value)}
                aria-label="Check in"
                className="cursor-pointer"
              />
              <Input
                type="date"
                value={checkOut}
                onChange={(e) => onCheckOutChange(e.target.value)}
                aria-label="Check out"
                className="cursor-pointer"
              />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-charcoal mb-3">Guests</h3>
            <Input
              type="number"
              min={0}
              value={guests || ""}
              placeholder="Any"
              onChange={(e) => onGuestsChange(Number(e.target.value) || 0)}
            />
          </div>

          <FilterFields {...fieldProps} />
        </div>

        <div className="sticky bottom-0 bg-linen/95 backdrop-blur-md border-t border-pebble px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] flex items-center justify-between gap-4">
          <Button
            type="button"
            variant="link"
            size="sm"
            onClick={onClear}
            className="text-forest hover:text-forest-light"
          >
            Clear all
          </Button>
          <Button
            type="button"
            onClick={onClose}
            size="lg"
            className="flex-1"
          >
            Show {resultCount} {resultCount === 1 ? "villa" : "villas"}
          </Button>
        </div>
      </div>
    </div>
  );
}


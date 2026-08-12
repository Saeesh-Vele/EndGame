"use client";

import { useEffect, useState } from "react";
import { CalendarIcon, X } from "lucide-react";
import { type DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

function formatDate(date: Date) {
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

/**
 * Two months only fit side by side from `md` up — the Calendar's `months`
 * class is `flex-col md:flex-row`, so below that a second month stacks
 * *vertically* and roughly doubles the popover's height. On a phone that made
 * the popover taller than the viewport, and because Radix positions it
 * `fixed`, the overflow could not be scrolled to. One month with the
 * prev/next nav is the right shape on small screens.
 *
 * Starts at 1 so the server render and the first client render agree, then
 * upgrades once the media query can actually be read.
 */
function useMonthCount() {
  const [count, setCount] = useState(1);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 768px)");
    const sync = () => setCount(query.matches ? 2 : 1);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  return count;
}

export default function DateRangeFilter({
  range,
  onChange,
}: {
  range: DateRange | undefined;
  onChange: (range: DateRange | undefined) => void;
}) {
  const numberOfMonths = useMonthCount();

  const label =
    range?.from && range?.to
      ? `${formatDate(range.from)} – ${formatDate(range.to)}`
      : range?.from
        ? formatDate(range.from)
        : "Check-in date range";

  return (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="justify-start gap-2 font-normal">
            <CalendarIcon size={15} className="text-slate" />
            {label}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          {/* A month grid is seven 44px touch targets wide (308px) plus the
              calendar's own padding, which does not fit a 320px phone. Below
              360px the cells step down to 40px — still well past the 24px
              WCAG target-size minimum — so the full week is reachable. */}
          <Calendar
            className="p-2 max-[359px]:p-1 max-[359px]:[&_[data-day]]:size-10 max-[359px]:[&_[data-day]]:min-w-10"
            mode="range"
            selected={range}
            onSelect={onChange}
            numberOfMonths={numberOfMonths}
          />
        </PopoverContent>
      </Popover>

      {range?.from && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onChange(undefined)}
          aria-label="Clear date filter"
        >
          <X size={15} />
        </Button>
      )}
    </div>
  );
}

"use client";

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

export default function DateRangeFilter({
  range,
  onChange,
}: {
  range: DateRange | undefined;
  onChange: (range: DateRange | undefined) => void;
}) {
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
          <Calendar
            mode="range"
            selected={range}
            onSelect={onChange}
            numberOfMonths={2}
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

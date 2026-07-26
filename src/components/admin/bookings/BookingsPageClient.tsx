"use client";

import { useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { type DateRange } from "react-day-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import BookingsTable from "@/components/admin/bookings/BookingsTable";
import DateRangeFilter from "@/components/admin/bookings/DateRangeFilter";
import { BookingRequestWithVilla, BookingRequest } from "@/types";

const STATUS_OPTIONS: {
  value: BookingRequest["status"] | "all";
  label: string;
}[] = [
  { value: "all", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "completed", label: "Completed" },
];

/**
 * Status and date filtering for the bookings screen. Rows come from the
 * server component in src/app/admin/bookings/page.tsx.
 */
export default function BookingsPageClient({
  bookings,
}: {
  bookings: BookingRequestWithVilla[];
}) {
  const [statusFilter, setStatusFilter] = useState<
    BookingRequest["status"] | "all"
  >("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    return bookings.filter((booking) => {
      if (statusFilter !== "all" && booking.status !== statusFilter) {
        return false;
      }

      if (dateRange?.from) {
        const checkIn = new Date(booking.check_in);
        if (checkIn < dateRange.from) return false;
        if (dateRange.to && checkIn > dateRange.to) return false;
      }

      return true;
    });
  }, [bookings, statusFilter, dateRange]);

  const filterControls = (
    <>
      <Select
        value={statusFilter}
        onValueChange={(v) =>
          setStatusFilter(v as BookingRequest["status"] | "all")
        }
      >
        <SelectTrigger className="w-full sm:w-44">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <DateRangeFilter range={dateRange} onChange={setDateRange} />
    </>
  );

  return (
    <>
      <div className="mt-6 hidden sm:flex items-center gap-3">
        {filterControls}
      </div>

      <div className="mt-6 sm:hidden">
        <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full justify-center gap-2">
              <SlidersHorizontal size={15} />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom">
            <SheetHeader>
              <SheetTitle>Filter bookings</SheetTitle>
            </SheetHeader>
            <div className="px-4 pb-4 flex flex-col gap-3">
              {filterControls}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <p className="mt-4 text-sm text-slate">
        {filtered.length} {filtered.length === 1 ? "booking" : "bookings"}
      </p>

      <div className="mt-3">
        <BookingsTable bookings={filtered} />
      </div>
    </>
  );
}

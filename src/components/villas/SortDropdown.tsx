"use client";

import { ArrowUpDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const options = [
  { value: "recommended", label: "Recommended" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
];

export default function SortDropdown({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="hidden sm:inline-block text-xs font-medium text-slate uppercase tracking-wider">
        Sort:
      </span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-[180px] sm:w-[200px] h-10 min-h-[40px] bg-card border-pebble rounded-xl text-xs font-semibold text-charcoal shadow-xs">
          <div className="flex items-center gap-2 truncate">
            <ArrowUpDown size={14} className="text-slate shrink-0" />
            <SelectValue placeholder="Sort villas" />
          </div>
        </SelectTrigger>
        <SelectContent align="end" className="rounded-xl border-pebble bg-card shadow-md">
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value} className="text-xs font-medium cursor-pointer">
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}


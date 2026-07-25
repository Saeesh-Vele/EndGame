"use client";

import { ChevronDown } from "lucide-react";

const options = [
  { value: "recommended", label: "Recommended" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Rating" },
];

export default function SortDropdown({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative inline-block shrink-0">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Sort villas"
        className="cursor-pointer appearance-none rounded-xl border border-pebble bg-white pl-4 pr-9 py-2.5 text-sm text-charcoal transition-colors duration-200 hover:border-forest"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate"
      />
    </div>
  );
}

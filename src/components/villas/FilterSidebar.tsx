"use client";

import FilterFields from "./FilterFields";

type FilterFieldsProps = React.ComponentProps<typeof FilterFields>;

export default function FilterSidebar({
  onClear,
  ...fieldProps
}: FilterFieldsProps & { onClear: () => void }) {
  return (
    <div className="sticky top-36 rounded-2xl bg-white shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-base text-charcoal">Filters</h2>
        <button
          type="button"
          onClick={onClear}
          className="cursor-pointer text-xs font-medium text-forest hover:text-forest-light transition-colors duration-200"
        >
          Clear all
        </button>
      </div>
      <FilterFields {...fieldProps} />
    </div>
  );
}

"use client";

import FilterFields from "./FilterFields";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type FilterFieldsProps = React.ComponentProps<typeof FilterFields>;

export default function FilterSidebar({
  onClear,
  ...fieldProps
}: FilterFieldsProps & { onClear: () => void }) {
  return (
    <Card className="sticky top-36 p-6 max-h-[calc(100vh-10rem)] overflow-y-auto pr-2">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-base font-medium text-charcoal">Filters</h2>
        <Button
          type="button"
          variant="link"
          size="sm"
          onClick={onClear}
          className="text-xs text-forest hover:text-forest-light"
        >
          Clear all
        </Button>
      </div>
      <FilterFields {...fieldProps} />
    </Card>
  );
}


import { Card } from "@/components/ui/card";

export default function VillaCardSkeleton() {
  return (
    <Card className="border-none shadow-none bg-transparent overflow-hidden">
      <div className="relative aspect-[4/3] rounded-2xl bg-pebble/40 animate-pulse" />
      <div className="mt-4 flex flex-col gap-2">
        <div className="flex items-center justify-between gap-4">
          <div className="h-5 w-2/3 rounded-md bg-pebble/40 animate-pulse" />
          <div className="h-5 w-12 rounded-md bg-pebble/40 animate-pulse" />
        </div>
        <div className="h-4 w-1/3 rounded-md bg-pebble/30 animate-pulse" />
        <div className="mt-2 flex gap-3">
          <div className="h-4 w-16 rounded-md bg-pebble/30 animate-pulse" />
          <div className="h-4 w-16 rounded-md bg-pebble/30 animate-pulse" />
        </div>
        <div className="mt-2 h-5 w-24 rounded-md bg-pebble/40 animate-pulse" />
      </div>
    </Card>
  );
}

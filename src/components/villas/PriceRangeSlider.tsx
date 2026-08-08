"use client";

export default function PriceRangeSlider({
  min,
  max,
  step = 1000,
  value,
  onChange,
}: {
  min: number;
  max: number;
  step?: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
}) {
  const [lo, hi] = value;

  const handleLo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = Math.min(Number(e.target.value), hi - step);
    onChange([next, hi]);
  };

  const handleHi = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = Math.max(Number(e.target.value), lo + step);
    onChange([lo, next]);
  };

  const loPct = Math.max(0, Math.min(100, ((lo - min) / (max - min)) * 100));
  const hiPct = Math.max(0, Math.min(100, ((hi - min) / (max - min)) * 100));

  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs font-semibold text-charcoal mb-3">
        <span className="bg-sandstone/80 px-2.5 py-1 rounded-md border border-pebble">
          ₹{lo.toLocaleString("en-IN")}
        </span>
        <span className="bg-sandstone/80 px-2.5 py-1 rounded-md border border-pebble">
          ₹{hi.toLocaleString("en-IN")}
        </span>
      </div>
      <div className="relative h-4 flex items-center">
        <div className="absolute inset-x-0 h-1.5 rounded-full bg-pebble" />
        <div
          className="absolute h-1.5 rounded-full bg-forest"
          style={{ left: `${loPct}%`, right: `${100 - hiPct}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={lo}
          onChange={handleLo}
          aria-label="Minimum price"
          className="range-thumb absolute inset-x-0 w-full appearance-none bg-transparent pointer-events-none cursor-pointer"
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={hi}
          onChange={handleHi}
          aria-label="Maximum price"
          className="range-thumb absolute inset-x-0 w-full appearance-none bg-transparent pointer-events-none cursor-pointer"
        />
      </div>
    </div>
  );
}


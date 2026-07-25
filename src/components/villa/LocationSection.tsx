import { MapPin } from "lucide-react";

export default function LocationSection({
  location,
  description,
}: {
  location: string;
  description?: string;
}) {
  return (
    <div className="py-6">
      <h2 className="text-lg text-charcoal mb-3">Where you&apos;ll be</h2>
      <p className="flex items-center gap-2 text-sm text-charcoal mb-3">
        <MapPin size={16} className="text-slate" />
        {location}
      </p>
      {description && (
        <p className="text-sm text-slate leading-relaxed">{description}</p>
      )}
    </div>
  );
}

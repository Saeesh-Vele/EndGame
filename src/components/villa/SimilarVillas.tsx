import VillaCard from "@/components/home/VillaCard";
import { Villa } from "@/types";

export default function SimilarVillas({
  villas,
  destination,
}: {
  villas: Villa[];
  destination: string;
}) {
  if (villas.length === 0) return null;

  return (
    <div className="py-8 border-t border-pebble">
      <h2 className="text-lg text-charcoal mb-5">
        More villas in {destination}
      </h2>
      <div className="flex gap-6 overflow-x-auto pb-2 -mx-5 px-5 sm:mx-0 sm:px-0">
        {villas.map((villa) => (
          <div key={villa.id} className="shrink-0 w-[280px] sm:w-[320px]">
            <VillaCard villa={villa} />
          </div>
        ))}
      </div>
    </div>
  );
}

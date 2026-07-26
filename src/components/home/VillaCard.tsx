"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Star, Users, BedDouble, Waves } from "lucide-react";
import { useSession } from "@/components/shared/SessionProvider";
import { Villa } from "@/types";

const amenityIcon = (label: string) => {
  if (/guest/i.test(label)) return Users;
  if (/bedroom/i.test(label)) return BedDouble;
  return Waves;
};

export default function VillaCard({ villa }: { villa: Villa }) {
  const { isSaved, toggleSaved } = useSession();
  const saved = isSaved(villa.id);

  return (
    <Link href={`/villas/${villa.slug}`} className="group block cursor-pointer">
      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
        <Image
          src={villa.images[0]}
          alt={villa.name}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
        />

        {villa.is_superhost && (
          <span className="absolute top-3 left-3 rounded-xl bg-white/95 px-3 py-1 text-xs font-medium text-charcoal">
            Superhost
          </span>
        )}

        <button
          type="button"
          onClick={(e) => {
            // The whole card is a <Link>; without this the click navigates.
            e.preventDefault();
            e.stopPropagation();
            toggleSaved(villa.id);
          }}
          aria-label={saved ? "Remove from saved" : "Save villa"}
          aria-pressed={saved}
          // A saved villa keeps its heart visible — otherwise the state is
          // invisible until you happen to hover the card.
          className={`cursor-pointer absolute top-3 right-3 flex items-center justify-center h-9 w-9 rounded-full bg-white/0 transition-opacity duration-200 focus-visible:opacity-100 group-hover:opacity-100 ${
            saved ? "opacity-100" : "opacity-0"
          }`}
        >
          <Heart
            size={20}
            className={
              saved
                ? "fill-forest text-forest"
                : "fill-charcoal/30 text-white"
            }
          />
        </button>
      </div>

      <div className="mt-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base text-charcoal">{villa.name}</h3>
          <div className="flex items-center gap-1 shrink-0 pt-0.5">
            <Star size={14} className="fill-driftwood text-driftwood" />
            <span className="text-sm text-charcoal">{villa.rating}</span>
          </div>
        </div>

        <p className="mt-1 text-sm text-slate">{villa.location}</p>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
          {villa.amenities.map((amenity) => {
            const Icon = amenityIcon(amenity);
            return (
              <span
                key={amenity}
                className="flex items-center gap-1.5 text-xs text-slate"
              >
                <Icon size={14} />
                {amenity}
              </span>
            );
          })}
        </div>

        <p className="mt-3 text-sm text-charcoal">
          <span className="font-medium">
            ₹{villa.price_per_night.toLocaleString("en-IN")}
          </span>{" "}
          <span className="text-slate">/ night</span>
        </p>
      </div>
    </Link>
  );
}

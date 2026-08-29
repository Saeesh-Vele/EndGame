"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Star, Users, BedDouble, Waves } from "lucide-react";
import { useSession } from "@/components/shared/SessionProvider";
import { Villa } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-sandstone">
        {villa.images[0] ? (
          <Image
            src={villa.images[0]}
            alt={villa.name}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 ease-out-smooth group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs font-medium text-slate">
            No photo yet
          </div>
        )}

        {villa.is_superhost && (
          <Badge className="absolute top-3 left-3 bg-charcoal/80 text-white backdrop-blur-md border border-white/20 font-medium shadow-xs text-xs px-2.5 py-1">
            Superhost
          </Badge>
        )}

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleSaved(villa.id);
          }}
          aria-label={saved ? "Remove from saved" : "Save villa"}
          aria-pressed={saved}
          className={`absolute top-3 right-3 rounded-full bg-white/90 backdrop-blur-md shadow-xs min-h-[44px] min-w-[44px] hover:bg-white transition-all duration-200 ${
            saved ? "opacity-100" : "opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
          }`}
        >
          <Heart
            size={18}
            className={
              saved
                ? "fill-forest text-forest"
                : "fill-charcoal/20 text-charcoal/70"
            }
          />
        </Button>
      </div>

      <div className="mt-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-semibold text-charcoal leading-snug group-hover:text-forest transition-colors duration-150">
            {villa.name}
          </h3>
          <div className="flex items-center gap-1 shrink-0 pt-0.5">
            <Star size={14} className="fill-amber-500 text-amber-500" />
            <span className="text-sm font-semibold text-charcoal">{villa.rating}</span>
          </div>
        </div>

        <p className="mt-1 text-sm text-slate">{villa.location}</p>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
          {villa.amenities.map((amenity) => {
            const Icon = amenityIcon(amenity);
            return (
              <span
                key={amenity}
                className="flex items-center gap-1.5 text-xs font-medium text-slate"
              >
                <Icon size={14} />
                {amenity}
              </span>
            );
          })}
        </div>

        <p className="mt-3 text-base text-charcoal">
          <span className="font-bold text-charcoal">
            ₹{villa.price_per_night.toLocaleString("en-IN")}
          </span>{" "}
          <span className="text-xs text-slate">/ night</span>
        </p>
      </div>
    </Link>
  );
}



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
        <Image
          src={villa.images[0]}
          alt={villa.name}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
        />

        {villa.is_superhost && (
          <Badge className="absolute top-3 left-3 bg-white/90 text-charcoal backdrop-blur-xs border-none font-medium shadow-xs">
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
          className={`absolute top-3 right-3 rounded-full bg-white/80 backdrop-blur-xs shadow-xs min-h-[44px] min-w-[44px] hover:bg-white transition-all duration-200 ${
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
          <h3 className="text-base font-medium text-charcoal leading-snug">{villa.name}</h3>
          <div className="flex items-center gap-1 shrink-0 pt-0.5">
            <Star size={14} className="fill-driftwood text-driftwood" />
            <span className="text-sm font-medium text-charcoal">{villa.rating}</span>
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

        <p className="mt-3 text-base text-charcoal">
          <span className="font-semibold text-charcoal">
            ₹{villa.price_per_night.toLocaleString("en-IN")}
          </span>{" "}
          <span className="text-xs text-slate">/ night</span>
        </p>
      </div>
    </Link>
  );
}


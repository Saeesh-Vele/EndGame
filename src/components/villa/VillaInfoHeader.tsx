"use client";

import { useState } from "react";
import { MapPin, Star, Share2, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VillaInfoHeader({
  name,
  location,
  rating,
  reviewCount,
}: {
  name: string;
  location: string;
  rating: number;
  reviewCount: number;
}) {
  const [saved, setSaved] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: name, url: window.location.href });
      } catch {
        // user dismissed the native share sheet
      }
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 sm:gap-6">
      <div>
        <h1 className="font-display font-normal text-3xl sm:text-5xl text-charcoal leading-tight">
          {name}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate">
          <span className="flex items-center gap-1.5 font-medium text-charcoal">
            <MapPin size={16} className="text-forest shrink-0" />
            {location}
          </span>
          <span className="flex items-center gap-1.5 font-semibold text-charcoal bg-sandstone/80 px-2.5 py-1 rounded-md border border-pebble">
            <Star size={15} className="fill-amber-500 text-amber-500 shrink-0" />
            {rating.toFixed(2)}
            <span className="text-slate font-normal">({reviewCount} reviews)</span>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleShare}
          className="gap-2 border-pebble text-charcoal hover:bg-sandstone"
        >
          <Share2 size={16} />
          <span className="hidden sm:inline">Share</span>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setSaved((v) => !v)}
          className="gap-2 border-pebble text-charcoal hover:bg-sandstone"
        >
          <Heart size={16} className={saved ? "fill-forest text-forest" : ""} />
          <span className="hidden sm:inline">{saved ? "Saved" : "Save"}</span>
        </Button>
      </div>
    </div>
  );
}


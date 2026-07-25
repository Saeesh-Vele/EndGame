"use client";

import { useState } from "react";
import { MapPin, Star, Share2, Heart } from "lucide-react";

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
    <div className="flex items-start justify-between gap-6">
      <div>
        <h1 className="font-display font-normal text-3xl sm:text-4xl text-charcoal">
          {name}
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-slate">
          <span className="flex items-center gap-1.5">
            <MapPin size={15} />
            {location}
          </span>
          <span className="flex items-center gap-1.5 text-charcoal">
            <Star size={15} className="fill-driftwood text-driftwood" />
            {rating.toFixed(2)}
            <span className="text-slate">({reviewCount} reviews)</span>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={handleShare}
          className="cursor-pointer flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm text-charcoal transition-colors duration-200 hover:bg-sandstone"
        >
          <Share2 size={16} />
          <span className="hidden sm:inline">Share</span>
        </button>
        <button
          type="button"
          onClick={() => setSaved((v) => !v)}
          className="cursor-pointer flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm text-charcoal transition-colors duration-200 hover:bg-sandstone"
        >
          <Heart size={16} className={saved ? "fill-forest text-forest" : ""} />
          <span className="hidden sm:inline">Save</span>
        </button>
      </div>
    </div>
  );
}

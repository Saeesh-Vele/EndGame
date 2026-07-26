"use client";

import Link from "next/link";
import VillaCard from "@/components/home/VillaCard";
import { useSession } from "@/components/shared/SessionProvider";
import { Villa } from "@/types";

/**
 * The saved-villa grid. Rows are fetched on the server; this wrapper exists so
 * that un-hearting a card removes it immediately instead of leaving a dead
 * tile until the next refresh.
 */
export default function SavedVillasGrid({ villas }: { villas: Villa[] }) {
  const { savedReady, isSaved } = useSession();

  // Until the client knows which villas are saved, trust the server list —
  // filtering on an empty set would flash "nothing saved" on every load.
  const visible = savedReady ? villas.filter((v) => isSaved(v.id)) : villas;

  if (visible.length === 0) {
    return (
      <div className="rounded-2xl bg-white shadow-sm py-14 text-center">
        <p className="text-sm text-slate">
          Nothing saved yet. Tap the heart on any villa to keep it here.
        </p>
        <Link
          href="/villas"
          className="cursor-pointer inline-block mt-5 rounded-xl bg-forest px-6 py-3 text-sm font-medium text-white transition-colors duration-200 hover:bg-forest-light"
        >
          Browse villas
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
      {visible.map((villa) => (
        <VillaCard key={villa.id} villa={villa} />
      ))}
    </div>
  );
}

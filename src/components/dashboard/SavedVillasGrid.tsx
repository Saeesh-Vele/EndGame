"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import VillaCard from "@/components/home/VillaCard";
import { useSession } from "@/components/shared/SessionProvider";
import { Villa } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SavedVillasGrid({ villas }: { villas: Villa[] }) {
  const { savedReady, isSaved } = useSession();

  const visible = savedReady ? villas.filter((v) => isSaved(v.id)) : villas;

  if (visible.length === 0) {
    return (
      <Card className="py-14 px-6 text-center border-pebble bg-card shadow-xs rounded-2xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-forest/10 text-forest mb-4">
          <Heart size={28} />
        </div>
        <h3 className="font-display font-normal text-2xl text-charcoal">
          No saved villas yet
        </h3>
        <p className="mt-2 text-sm text-slate max-w-md mx-auto leading-relaxed">
          Tap the heart icon on any villa while browsing to bookmark your favorite sanctuaries here.
        </p>
        <Button size="lg" asChild className="mt-6 font-medium">
          <Link href="/villas">Browse Villas</Link>
        </Button>
      </Card>
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


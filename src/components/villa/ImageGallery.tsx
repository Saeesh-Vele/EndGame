"use client";

import { useState } from "react";
import Image from "next/image";
import { Images } from "lucide-react";
import GalleryModal from "./GalleryModal";
import { Button } from "@/components/ui/button";

export default function ImageGallery({
  images,
  villaName,
}: {
  images: string[];
  villaName: string;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [startIndex, setStartIndex] = useState(0);
  const [openSession, setOpenSession] = useState(0);

  const openModal = (index: number) => {
    setStartIndex(index);
    setModalOpen(true);
    setOpenSession((s) => s + 1);
  };

  const [hero, ...rest] = images;
  const gridImages = rest.slice(0, 4);

  // Publishing requires at least one photo, so this only shows for a listing
  // whose images were removed directly in the database. Rendering the grid
  // regardless would hand next/image an undefined `src`.
  if (images.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-6">
        <div className="flex h-56 sm:h-[480px] items-center justify-center rounded-2xl border border-pebble bg-sandstone text-sm font-medium text-slate">
          Photos of this villa are coming soon.
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-6">
        {/* Mobile Horizontal Carousel */}
        <div className="sm:hidden -mx-5 px-5 flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2">
          {images.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => openModal(i)}
              className="group cursor-pointer relative shrink-0 w-[88vw] aspect-[4/3] snap-start rounded-2xl overflow-hidden shadow-xs"
            >
              <Image
                src={src}
                alt={`${villaName} photo ${i + 1}`}
                fill
                sizes="88vw"
                className="object-cover"
                priority={i === 0}
              />
              <span className="absolute bottom-3 right-3 bg-charcoal/80 text-white text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-md border border-white/20">
                {i + 1} / {images.length}
              </span>
            </button>
          ))}
        </div>

        {/* Desktop 5-Photo Grid */}
        <div className="hidden sm:grid relative grid-cols-4 grid-rows-2 gap-3 h-[480px]">
          <button
            type="button"
            onClick={() => openModal(0)}
            className="group cursor-pointer relative col-span-2 row-span-2 rounded-2xl overflow-hidden bg-sandstone"
          >
            <Image
              src={hero}
              alt={`${villaName} main photo`}
              fill
              sizes="50vw"
              priority
              className="object-cover transition-transform duration-500 ease-out-smooth group-hover:scale-[1.03]"
            />
          </button>

          {gridImages.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => openModal(i + 1)}
              className="group cursor-pointer relative col-span-1 row-span-1 rounded-2xl overflow-hidden bg-sandstone"
            >
              <Image
                src={src}
                alt={`${villaName} photo ${i + 2}`}
                fill
                sizes="25vw"
                className="object-cover transition-transform duration-500 ease-out-smooth group-hover:scale-[1.04]"
              />
            </button>
          ))}

          <Button
            type="button"
            onClick={() => openModal(0)}
            className="absolute bottom-4 right-4 bg-charcoal/85 text-white hover:bg-charcoal backdrop-blur-md border border-white/20 font-medium shadow-md gap-2 rounded-xl text-xs px-4 py-2.5"
          >
            <Images size={16} />
            Show all {images.length} photos
          </Button>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => openModal(0)}
          className="sm:hidden mt-3 w-full gap-2 border-pebble"
        >
          <Images size={16} />
          Show all {images.length} photos
        </Button>
      </div>

      <GalleryModal
        key={openSession}
        images={images}
        villaName={villaName}
        open={modalOpen}
        startIndex={startIndex}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}


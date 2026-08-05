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

  return (
    <>
      <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-6">
        <div className="sm:hidden -mx-5 px-5 flex gap-3 overflow-x-auto snap-x snap-mandatory">
          {images.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => openModal(i)}
              className="cursor-pointer relative shrink-0 w-[85vw] aspect-[4/3] snap-start rounded-2xl overflow-hidden"
            >
              <Image
                src={src}
                alt={`${villaName} photo ${i + 1}`}
                fill
                sizes="85vw"
                className="object-cover"
                priority={i === 0}
              />
            </button>
          ))}
        </div>

        <div className="hidden sm:grid relative grid-cols-4 grid-rows-2 gap-2 h-[480px]">
          <button
            type="button"
            onClick={() => openModal(0)}
            className="cursor-pointer relative col-span-2 row-span-2 rounded-2xl overflow-hidden"
          >
            <Image
              src={hero}
              alt={`${villaName} main photo`}
              fill
              sizes="50vw"
              priority
              className="object-cover"
            />
          </button>

          {gridImages.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => openModal(i + 1)}
              className="cursor-pointer relative col-span-1 row-span-1 rounded-2xl overflow-hidden"
            >
              <Image
                src={src}
                alt={`${villaName} photo ${i + 2}`}
                fill
                sizes="25vw"
                className="object-cover"
              />
            </button>
          ))}

          <Button
            type="button"
            variant="secondary"
            onClick={() => openModal(0)}
            className="absolute bottom-4 right-4 bg-white/90 hover:bg-white text-charcoal backdrop-blur-xs font-medium shadow-sm gap-2"
          >
            <Images size={16} />
            Show all photos
          </Button>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => openModal(0)}
          className="sm:hidden mt-3 w-full gap-2"
        >
          <Images size={16} />
          Show all photos
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

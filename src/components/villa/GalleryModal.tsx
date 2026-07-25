"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export default function GalleryModal({
  images,
  villaName,
  open,
  startIndex,
  onClose,
}: {
  images: string[];
  villaName: string;
  open: boolean;
  startIndex: number;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(startIndex);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setIndex((i) => (i + 1) % images.length);
      if (e.key === "ArrowLeft")
        setIndex((i) => (i - 1 + images.length) % images.length);
    };

    window.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, images.length, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-charcoal/95 flex flex-col">
      <div className="flex items-center justify-between px-5 sm:px-8 py-4">
        <span className="text-sm text-white/80">
          {index + 1} / {images.length}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close gallery"
          className="cursor-pointer text-white p-1"
        >
          <X size={24} />
        </button>
      </div>

      <div className="relative flex-1 flex items-center justify-center px-4 pb-4">
        <button
          type="button"
          onClick={() =>
            setIndex((i) => (i - 1 + images.length) % images.length)
          }
          aria-label="Previous photo"
          className="cursor-pointer absolute left-2 sm:left-6 z-10 flex items-center justify-center h-10 w-10 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors duration-200"
        >
          <ChevronLeft size={22} />
        </button>

        <div className="relative w-full h-full max-w-5xl">
          <Image
            src={images[index]}
            alt={`${villaName} photo ${index + 1}`}
            fill
            sizes="100vw"
            className="object-contain"
          />
        </div>

        <button
          type="button"
          onClick={() => setIndex((i) => (i + 1) % images.length)}
          aria-label="Next photo"
          className="cursor-pointer absolute right-2 sm:right-6 z-10 flex items-center justify-center h-10 w-10 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors duration-200"
        >
          <ChevronRight size={22} />
        </button>
      </div>
    </div>
  );
}

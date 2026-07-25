"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, X } from "lucide-react";

export default function ImageUploadZone({
  images,
  onChange,
}: {
  images: string[];
  onChange: (images: string[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const addFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const urls = Array.from(files)
      .filter((file) => file.type.startsWith("image/"))
      .map((file) => URL.createObjectURL(file));
    onChange([...images, ...urls]);
  };

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          addFiles(e.dataTransfer.files);
        }}
        className={`cursor-pointer flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors duration-200 ${
          dragOver
            ? "border-forest bg-forest/5"
            : "border-pebble hover:border-forest"
        }`}
      >
        <ImagePlus size={22} className="text-slate" />
        <p className="text-sm text-charcoal">
          Drag photos here, or click to browse
        </p>
        <p className="text-xs text-slate">PNG or JPG, up to 10 photos</p>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => {
          addFiles(e.target.files);
          e.target.value = "";
        }}
        className="hidden"
      />

      {images.length > 0 && (
        <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 gap-3">
          {images.map((src, i) => (
            <div
              key={`${src}-${i}`}
              className="relative aspect-square rounded-lg overflow-hidden bg-sandstone"
            >
              <Image
                src={src}
                alt={`Villa photo ${i + 1}`}
                fill
                sizes="120px"
                className="object-cover"
                unoptimized={src.startsWith("blob:")}
              />
              <button
                type="button"
                onClick={() => removeImage(i)}
                aria-label="Remove photo"
                className="cursor-pointer absolute top-1.5 right-1.5 flex items-center justify-center h-6 w-6 rounded-full bg-charcoal/70 text-white hover:bg-charcoal transition-colors duration-200"
              >
                <X size={13} />
              </button>
              {i === 0 && (
                <span className="absolute bottom-1.5 left-1.5 rounded-md bg-white/95 px-1.5 py-0.5 text-[10px] font-medium text-charcoal">
                  Cover
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { uploadVillaImage } from "@/lib/supabase/storage";
import { describeUploadError } from "@/lib/errors";

const MAX_IMAGES = 10;
const MAX_FILE_BYTES = 10 * 1024 * 1024;

export default function ImageUploadZone({
  images,
  onChange,
  onUploadingChange,
}: {
  images: string[];
  onChange: (images: string[]) => void;
  onUploadingChange?: (uploading: boolean) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);

  const setUploading = (count: number) => {
    setUploadingCount(count);
    onUploadingChange?.(count > 0);
  };

  /**
   * Uploads straight to Supabase Storage from the browser and stores the
   * returned CDN URL. The bucket's RLS policies only accept writes from an
   * admin session, so this can't be driven by a signed-out visitor.
   */
  const addFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const chosen = Array.from(fileList);
    const candidates = chosen.filter((file) => file.type.startsWith("image/"));

    // Dropping a PDF or a .mov used to do nothing at all, which reads as the
    // uploader being broken.
    const notImages = chosen.length - candidates.length;
    if (notImages > 0) {
      toast.error(
        notImages === 1
          ? "That file isn't an image — upload a JPG, PNG, or WebP."
          : `${notImages} files weren't images and were skipped. Upload JPG, PNG, or WebP.`
      );
    }

    const tooLarge = candidates.filter((file) => file.size > MAX_FILE_BYTES);
    if (tooLarge.length > 0) {
      toast.error(
        tooLarge.length === 1
          ? `${tooLarge[0].name} is over 10MB. Compress it and try again.`
          : `${tooLarge.length} photos are over 10MB and were skipped. Compress them and try again.`
      );
    }

    const withinLimits = candidates.filter(
      (file) => file.size <= MAX_FILE_BYTES
    );
    const room = MAX_IMAGES - images.length;
    const files = withinLimits.slice(0, room);

    // Say what happened to the ones that didn't fit, rather than uploading a
    // subset silently.
    if (withinLimits.length > files.length) {
      toast.error(
        `Only ${room} more ${room === 1 ? "photo fits" : "photos fit"} — this villa is capped at ${MAX_IMAGES}. The rest were skipped.`
      );
    }

    if (files.length === 0) {
      if (images.length >= MAX_IMAGES) {
        toast.error(
          `This villa already has the maximum of ${MAX_IMAGES} photos. Remove one to add another.`
        );
      }
      return;
    }

    setUploading(files.length);
    const supabase = createClient();

    const results = await Promise.allSettled(
      files.map((file) => uploadVillaImage(supabase, file))
    );

    const uploaded = results
      .filter(
        (result): result is PromiseFulfilledResult<string> =>
          result.status === "fulfilled"
      )
      .map((result) => result.value);

    // "3 photos failed to upload" doesn't tell an admin whether to retry,
    // sign in again, or pick a different file. Name the file and the reason.
    results.forEach((result, index) => {
      if (result.status === "rejected") {
        toast.error(describeUploadError(result.reason, files[index].name));
      }
    });

    if (uploaded.length > 0) onChange([...images, ...uploaded]);
    setUploading(0);
  };

  const removeImage = (index: number) => {
    // Only drops the URL from the form. The villa's Server Action reconciles
    // Storage on save, so a removal that's never saved leaves the file intact.
    onChange(images.filter((_, i) => i !== index));
  };

  const busy = uploadingCount > 0;
  const atLimit = images.length >= MAX_IMAGES;

  return (
    <div>
      <button
        type="button"
        disabled={busy || atLimit}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (!busy && !atLimit) void addFiles(e.dataTransfer.files);
        }}
        className={`cursor-pointer flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${
          dragOver
            ? "border-forest bg-forest/5"
            : "border-pebble hover:border-forest"
        }`}
      >
        {busy ? (
          <Loader2 size={22} className="text-slate animate-spin" />
        ) : (
          <ImagePlus size={22} className="text-slate" />
        )}
        <p className="text-sm text-charcoal">
          {busy
            ? `Uploading ${uploadingCount} ${
                uploadingCount === 1 ? "photo" : "photos"
              }…`
            : atLimit
              ? `You've added the maximum of ${MAX_IMAGES} photos`
              : "Drag photos here, or click to browse"}
        </p>
        <p className="text-xs text-slate">
          PNG or JPG, up to {MAX_IMAGES} photos, 10MB each
        </p>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => {
          void addFiles(e.target.files);
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
                quality={60}
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(i)}
                aria-label={`Remove photo ${i + 1}`}
                className="cursor-pointer absolute top-1.5 right-1.5 flex items-center justify-center h-6 w-6 rounded-full bg-charcoal/70 text-white hover:bg-charcoal transition-colors duration-200"
              >
                <X size={13} />
              </button>
              {i === 0 && (
                <span className="absolute bottom-1.5 left-1.5 rounded-md bg-white/95 px-1.5 py-0.5 text-xs font-semibold text-charcoal shadow-xs">
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

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AlertCircle, Loader2, Pencil, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createDestination, updateDestination } from "@/app/admin/actions";
import { Destination } from "@/types";
import { slugify } from "@/lib/slugify";

type DestinationField = "name" | "slug" | "image";

/** Message under a single input. Renders nothing when the field is fine. */
function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;

  return (
    <p
      id={id}
      role="alert"
      className="flex items-start gap-1.5 text-xs font-medium text-destructive"
    >
      <AlertCircle size={13} className="mt-px shrink-0" />
      <span>{message}</span>
    </p>
  );
}

export default function DestinationDialog({
  destination,
}: {
  destination?: Destination;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const isEditing = Boolean(destination);

  const [open, setOpen] = useState(false);
  const [name, setName] = useState(destination?.name ?? "");
  const [slug, setSlug] = useState(destination?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEditing);
  const [image, setImage] = useState(destination?.image ?? "");
  const [metaTitle, setMetaTitle] = useState(destination?.meta_title ?? "");
  const [metaDescription, setMetaDescription] = useState(
    destination?.meta_description ?? ""
  );
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<DestinationField, string>>
  >({});

  const clearFieldError = (field: DestinationField) =>
    setFieldErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));

  const handleNameChange = (value: string) => {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const problems: Partial<Record<DestinationField, string>> = {};

    if (!name.trim()) problems.name = "Give the destination a name.";
    if (!slug.trim()) problems.slug = "A slug is required — it's the URL segment.";

    if (!image.trim()) {
      problems.image = "Paste the URL of the hero image for this destination.";
    } else if (!/^https?:\/\/\S+$/i.test(image.trim())) {
      problems.image = "That doesn't look like a URL. It should start with https://";
    }

    const firstInvalid = (["name", "slug", "image"] as const).find(
      (field) => problems[field]
    );

    if (firstInvalid) {
      setFieldErrors(problems);
      document.getElementById(`dest-${firstInvalid}`)?.focus();
      return;
    }

    setFieldErrors({});

    const values = {
      name: name.trim(),
      slug: slug || slugify(name),
      image_url: image.trim(),
      meta_title: metaTitle.trim() || undefined,
      meta_description: metaDescription.trim() || undefined,
    };

    startTransition(async () => {
      const result =
        isEditing && destination
          ? await updateDestination(destination.id, values)
          : await createDestination(values);

      if (!result.success) {
        const message = result.error ?? "Couldn't save the destination.";
        // A name/slug clash is fixed in the form, so show it there too.
        if (message.toLowerCase().includes("slug")) {
          setFieldErrors({ slug: message });
        }
        toast.error(message);
        return;
      }

      toast.success(`${values.name} ${isEditing ? "updated" : "added"}`);
      setOpen(false);
      router.refresh();
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEditing ? (
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Edit ${destination?.name}`}
          >
            <Pencil size={15} />
          </Button>
        ) : (
          <Button>
            <Plus size={16} />
            Add destination
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? `Edit ${destination?.name}` : "Add destination"}
            </DialogTitle>
            <DialogDescription>
              Destinations group villas and power the SEO metadata for their
              listing pages.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="dest-name">Name</Label>
                <Input
                  id="dest-name"
                  value={name}
                  onChange={(e) => {
                    handleNameChange(e.target.value);
                    clearFieldError("name");
                  }}
                  placeholder="Goa"
                  aria-invalid={Boolean(fieldErrors.name)}
                  aria-describedby={
                    fieldErrors.name ? "dest-name-error" : undefined
                  }
                  required
                />
                <FieldError id="dest-name-error" message={fieldErrors.name} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="dest-slug">Slug</Label>
                <Input
                  id="dest-slug"
                  value={slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setSlug(slugify(e.target.value));
                    clearFieldError("slug");
                  }}
                  placeholder="goa"
                  aria-invalid={Boolean(fieldErrors.slug)}
                  aria-describedby={
                    fieldErrors.slug ? "dest-slug-error" : undefined
                  }
                  required
                />
                <FieldError id="dest-slug-error" message={fieldErrors.slug} />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="dest-image">Image URL</Label>
              <Input
                id="dest-image"
                value={image}
                onChange={(e) => {
                  setImage(e.target.value);
                  clearFieldError("image");
                }}
                placeholder="https://images.unsplash.com/..."
                aria-invalid={Boolean(fieldErrors.image)}
                aria-describedby={
                  fieldErrors.image ? "dest-image-error" : undefined
                }
                required
              />
              <FieldError id="dest-image-error" message={fieldErrors.image} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="dest-meta-title">Meta title</Label>
              <Input
                id="dest-meta-title"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder="Private Villas in Goa | StayVilla"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="dest-meta-description">Meta description</Label>
              <Textarea
                id="dest-meta-description"
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="A short description used for search results..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 size={16} className="animate-spin" />}
              {pending
                ? "Saving…"
                : isEditing
                  ? "Save changes"
                  : "Add destination"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

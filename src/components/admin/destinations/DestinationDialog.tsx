"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Pencil, Plus } from "lucide-react";
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

  const handleNameChange = (value: string) => {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !image.trim()) {
      toast.error("Please fill in the destination name and image URL.");
      return;
    }

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
        toast.error(result.error ?? "Couldn't save the destination.");
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
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Goa"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="dest-slug">Slug</Label>
                <Input
                  id="dest-slug"
                  value={slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setSlug(slugify(e.target.value));
                  }}
                  placeholder="goa"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="dest-image">Image URL</Label>
              <Input
                id="dest-image"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                required
              />
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

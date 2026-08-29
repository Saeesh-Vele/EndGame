"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AlertCircle, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ImageUploadZone from "./ImageUploadZone";
import { createVilla, updateVilla } from "@/app/admin/actions";
import { Destination, Villa } from "@/types";
import { slugify } from "@/lib/slugify";
import { FEATURE_AMENITIES, ALL_AMENITIES } from "@/lib/amenities";

export default function VillaForm({
  villa,
  destinations,
}: {
  villa?: Villa;
  destinations: Destination[];
}) {
  const router = useRouter();
  const [saving, startSaving] = useTransition();
  const [uploading, setUploading] = useState(false);
  const isEditing = Boolean(villa);

  const [name, setName] = useState(villa?.name ?? "");
  const [slug, setSlug] = useState(villa?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEditing);
  // The DB stores a destination_id FK; the picker works in ids so an edit
  // doesn't depend on matching destination names back to rows.
  const [destinationId, setDestinationId] = useState(
    villa?.destination_id ?? destinations[0]?.id ?? ""
  );
  const [location, setLocation] = useState(villa?.location ?? "");
  const [description, setDescription] = useState(villa?.description ?? "");
  const [pricePerNight, setPricePerNight] = useState(
    villa ? String(villa.price_per_night) : ""
  );
  const [weekendPrice, setWeekendPrice] = useState(
    villa?.weekend_price ? String(villa.weekend_price) : ""
  );
  const [seasonalPrice, setSeasonalPrice] = useState(
    villa?.seasonal_price ? String(villa.seasonal_price) : ""
  );
  const [maxGuests, setMaxGuests] = useState(
    villa ? String(villa.max_guests) : "2"
  );
  const [bedrooms, setBedrooms] = useState(
    villa ? String(villa.bedrooms) : "1"
  );
  const [bathrooms, setBathrooms] = useState(
    villa ? String(villa.bathrooms) : "1"
  );
  const [beds, setBeds] = useState(
    villa ? String(villa.beds ?? villa.bedrooms) : "1"
  );
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
    villa?.full_amenities ?? []
  );
  const [images, setImages] = useState<string[]>(villa?.images ?? []);
  const [ownerName, setOwnerName] = useState(villa?.owner_name ?? "");
  const [ownerWhatsapp, setOwnerWhatsapp] = useState(
    villa?.owner_whatsapp ?? ""
  );
  const [ownerEmail, setOwnerEmail] = useState(villa?.owner_email ?? "");
  const [isActive, setIsActive] = useState(villa?.is_active ?? true);
  const [photoError, setPhotoError] = useState(false);

  /**
   * A draft may legitimately have no photos yet — an admin can start a listing
   * and come back to it. Publishing is the point where at least one is
   * required, because `is_active` is exactly what the public queries filter on,
   * so an active villa with no images would render an empty card and gallery.
   */
  const needsPhotoToPublish = isActive && images.length === 0;

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity]
    );
  };

  const handleNameChange = (value: string) => {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (uploading) {
      toast.error("Wait for the photos to finish uploading.");
      return;
    }

    if (!name.trim() || !destinationId || !pricePerNight) {
      toast.error("Please fill in the villa name, destination, and price.");
      return;
    }

    if (needsPhotoToPublish) {
      setPhotoError(true);
      toast.error("Add at least one photo before publishing this villa.");
      document
        .getElementById("villa-photos")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setPhotoError(false);

    const destinationName =
      destinations.find((d) => d.id === destinationId)?.name ?? "";

    const featureAmenities = selectedAmenities.filter((a) =>
      FEATURE_AMENITIES.includes(a)
    );

    // The compact list is what villa cards render; full_amenities is the
    // complete set shown on the detail page.
    const compactAmenities = [
      `${maxGuests} guests`,
      `${bedrooms} bedrooms`,
      ...featureAmenities.slice(0, 2),
    ];

    const values = {
      name: name.trim(),
      slug: slug || slugify(name),
      destination_id: destinationId,
      location: location.trim() || destinationName,
      description: description.trim(),
      price_per_night: Number(pricePerNight) || 0,
      weekend_price: weekendPrice ? Number(weekendPrice) : undefined,
      seasonal_price: seasonalPrice ? Number(seasonalPrice) : undefined,
      max_guests: Number(maxGuests) || 1,
      bedrooms: Number(bedrooms) || 1,
      bathrooms: Number(bathrooms) || 1,
      beds: Number(beds) || Number(bedrooms) || 1,
      amenities: compactAmenities,
      full_amenities: selectedAmenities,
      images,
      owner_whatsapp: ownerWhatsapp.trim(),
      owner_name: ownerName.trim(),
      owner_email: ownerEmail.trim(),
      is_active: isActive,
    };

    startSaving(async () => {
      const result =
        isEditing && villa
          ? await updateVilla(villa.id, values)
          : await createVilla(values);

      if (!result.success) {
        toast.error(result.error ?? "Couldn't save the villa.");
        return;
      }

      toast.success(`${values.name} ${isEditing ? "updated" : "created"}`);
      router.push("/admin/villas");
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl pb-16">
      <div className="rounded-2xl border border-pebble bg-white p-6">
        <h2 className="text-base font-medium text-charcoal mb-5">
          Basic info
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Villa name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Casa Bela"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(slugify(e.target.value));
              }}
              placeholder="casa-bela-candolim"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="destination">Destination</Label>
            <Select value={destinationId} onValueChange={setDestinationId}>
              <SelectTrigger id="destination" className="w-full">
                <SelectValue placeholder="Select a destination" />
              </SelectTrigger>
              <SelectContent>
                {destinations.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {destinations.length === 0 && (
              <p className="text-xs text-destructive">
                Add a destination first — villas have to belong to one.
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Candolim, Goa"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5 mt-5">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="A whitewashed Portuguese-era villa with a private pool..."
            rows={5}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-pebble bg-white p-6 mt-6">
        <h2 className="text-base font-medium text-charcoal mb-5">Pricing</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="price">Base price / night (₹)</Label>
            <Input
              id="price"
              type="number"
              min={0}
              value={pricePerNight}
              onChange={(e) => setPricePerNight(e.target.value)}
              placeholder="18500"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="weekend-price">Weekend price (₹)</Label>
            <Input
              id="weekend-price"
              type="number"
              min={0}
              value={weekendPrice}
              onChange={(e) => setWeekendPrice(e.target.value)}
              placeholder="Optional"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="seasonal-price">Seasonal price (₹)</Label>
            <Input
              id="seasonal-price"
              type="number"
              min={0}
              value={seasonalPrice}
              onChange={(e) => setSeasonalPrice(e.target.value)}
              placeholder="Optional"
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-pebble bg-white p-6 mt-6">
        <h2 className="text-base font-medium text-charcoal mb-5">Capacity</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="guests">Guests</Label>
            <Input
              id="guests"
              type="number"
              min={1}
              value={maxGuests}
              onChange={(e) => setMaxGuests(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="bedrooms">Bedrooms</Label>
            <Input
              id="bedrooms"
              type="number"
              min={1}
              value={bedrooms}
              onChange={(e) => setBedrooms(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="bathrooms">Bathrooms</Label>
            <Input
              id="bathrooms"
              type="number"
              min={1}
              value={bathrooms}
              onChange={(e) => setBathrooms(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="beds">Beds</Label>
            <Input
              id="beds"
              type="number"
              min={1}
              value={beds}
              onChange={(e) => setBeds(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-pebble bg-white p-6 mt-6">
        <h2 className="text-base font-medium text-charcoal mb-1">
          Amenities
        </h2>
        <p className="text-sm text-slate mb-5">
          Choose everything this villa offers.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
          {ALL_AMENITIES.map((amenity) => (
            <label
              key={amenity}
              className="flex items-center gap-2.5 cursor-pointer text-sm text-charcoal"
            >
              <Checkbox
                checked={selectedAmenities.includes(amenity)}
                onCheckedChange={() => toggleAmenity(amenity)}
              />
              {amenity}
            </label>
          ))}
        </div>
      </div>

      <div
        id="villa-photos"
        className={`rounded-2xl border bg-white p-6 mt-6 ${
          photoError ? "border-destructive" : "border-pebble"
        }`}
      >
        <h2 className="text-base font-medium text-charcoal mb-1">Photos</h2>
        <p className="text-sm text-slate mb-5">
          At least one photo is required to publish. A draft can be saved
          without any.
        </p>
        <ImageUploadZone
          images={images}
          onChange={(next) => {
            setImages(next);
            if (next.length > 0) setPhotoError(false);
          }}
          onUploadingChange={setUploading}
        />

        {photoError && (
          <p
            role="alert"
            className="mt-3.5 flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/10 px-3.5 py-3 text-xs font-semibold text-destructive"
          >
            <AlertCircle size={15} className="shrink-0" />
            Add at least one photo, or turn off &ldquo;Active&rdquo; below to
            save this villa as a draft.
          </p>
        )}
      </div>

      <div className="rounded-2xl border border-pebble bg-white p-6 mt-6">
        <h2 className="text-base font-medium text-charcoal mb-5">
          Contact &amp; status
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="owner-name">Owner name</Label>
            <Input
              id="owner-name"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              placeholder="Meera Fernandes"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="owner-whatsapp">WhatsApp number</Label>
            <Input
              id="owner-whatsapp"
              value={ownerWhatsapp}
              onChange={(e) => setOwnerWhatsapp(e.target.value)}
              placeholder="+919876543210"
            />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="owner-email">Owner email</Label>
            <Input
              id="owner-email"
              type="email"
              value={ownerEmail}
              onChange={(e) => setOwnerEmail(e.target.value)}
              placeholder="owner@example.com"
            />
            <p className="text-xs text-slate">
              Optional. When set, the owner is emailed about new inquiries as
              well as getting the WhatsApp message.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between mt-5 rounded-xl border border-pebble px-4 py-3.5">
          <div>
            <p className="text-sm text-charcoal">Active</p>
            <p className="text-xs text-slate">
              Listed publicly on the site when on.
            </p>
          </div>
          <Switch
            checked={isActive}
            onCheckedChange={(checked) => {
              setIsActive(checked);
              if (!checked) setPhotoError(false);
            }}
            aria-describedby={
              needsPhotoToPublish ? "villa-active-hint" : undefined
            }
          />
        </div>

        {needsPhotoToPublish && (
          <p
            id="villa-active-hint"
            className="mt-2.5 text-xs font-medium text-destructive"
          >
            This villa has no photos yet. Add one before saving, or turn
            &ldquo;Active&rdquo; off to keep it as a draft.
          </p>
        )}
      </div>

      <div className="flex items-center gap-3 mt-6">
        <Button type="submit" disabled={saving || uploading}>
          {saving && <Loader2 size={16} className="animate-spin" />}
          {saving
            ? "Saving…"
            : isEditing
              ? "Save changes"
              : "Create villa"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={saving}
          onClick={() => router.push("/admin/villas")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

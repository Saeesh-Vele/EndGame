"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
import { useAdminData } from "@/components/admin/AdminDataProvider";
import { Villa } from "@/types";
import { slugify } from "@/lib/slugify";
import { FEATURE_AMENITIES, ALL_AMENITIES } from "@/lib/amenities";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1400&auto=format&fit=crop";

export default function VillaForm({ villa }: { villa?: Villa }) {
  const router = useRouter();
  const { destinations, addVilla, updateVilla } = useAdminData();
  const isEditing = Boolean(villa);

  const [name, setName] = useState(villa?.name ?? "");
  const [slug, setSlug] = useState(villa?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEditing);
  const [destination, setDestination] = useState(
    villa?.destination ?? destinations[0]?.name ?? ""
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
  const [isActive, setIsActive] = useState(villa?.is_active ?? true);

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

    if (!name.trim() || !destination || !pricePerNight) {
      toast.error("Please fill in the villa name, destination, and price.");
      return;
    }

    const featureAmenities = selectedAmenities.filter((a) =>
      FEATURE_AMENITIES.includes(a)
    );

    const compactAmenities = [
      `${maxGuests} guests`,
      `${bedrooms} bedrooms`,
      ...featureAmenities.slice(0, 2),
    ];

    const payload = {
      name: name.trim(),
      slug: slug || slugify(name),
      location: location.trim() || destination,
      destination,
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
      images: images.length > 0 ? images : [PLACEHOLDER_IMAGE],
      is_superhost: villa?.is_superhost ?? false,
      owner_whatsapp: ownerWhatsapp.trim(),
      owner_name: ownerName.trim() || undefined,
      host_since: villa?.host_since,
      is_active: isActive,
      reviews: villa?.reviews,
    };

    if (isEditing && villa) {
      updateVilla(villa.id, payload);
      toast.success(`${payload.name} updated`);
    } else {
      const newVilla: Villa = {
        ...payload,
        id: `v-${Date.now()}`,
        rating: 0,
        review_count: 0,
        created_at: new Date().toISOString(),
      };
      addVilla(newVilla);
      toast.success(`${newVilla.name} created`);
    }

    router.push("/admin/villas");
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
            <Select value={destination} onValueChange={setDestination}>
              <SelectTrigger id="destination" className="w-full">
                <SelectValue placeholder="Select a destination" />
              </SelectTrigger>
              <SelectContent>
                {destinations.map((d) => (
                  <SelectItem key={d.id} value={d.name}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

      <div className="rounded-2xl border border-pebble bg-white p-6 mt-6">
        <h2 className="text-base font-medium text-charcoal mb-5">Photos</h2>
        <ImageUploadZone images={images} onChange={setImages} />
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
        </div>

        <div className="flex items-center justify-between mt-5 rounded-xl border border-pebble px-4 py-3.5">
          <div>
            <p className="text-sm text-charcoal">Active</p>
            <p className="text-xs text-slate">
              Listed publicly on the site when on.
            </p>
          </div>
          <Switch checked={isActive} onCheckedChange={setIsActive} />
        </div>
      </div>

      <div className="flex items-center gap-3 mt-6">
        <Button type="submit">
          {isEditing ? "Save changes" : "Create villa"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/villas")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

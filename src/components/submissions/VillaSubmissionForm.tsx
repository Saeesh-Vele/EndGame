"use client";

import { useEffect, useState, useTransition } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";
import {
  submitVillaListing,
  type VillaSubmissionFormValues,
} from "@/app/list-your-villa/actions";
import { FEATURE_AMENITIES, UNIVERSAL_AMENITIES } from "@/lib/amenities";
import { Destination } from "@/types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const OTHER = "__other__";

/** Seconds the submit button stays disabled after an attempt. */
const COOLDOWN_SECONDS = 30;

const EMPTY: VillaSubmissionFormValues = {
  ownerName: "",
  ownerEmail: "",
  ownerPhone: "",
  villaName: "",
  location: "",
  destination: "",
  bedrooms: "",
  bathrooms: "",
  maxGuests: "",
  description: "",
  amenities: [],
  pricePerNight: "",
  weekendPrice: "",
  message: "",
};

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="p-6 sm:p-7 border border-pebble bg-card">
      <h2 className="text-base font-medium text-charcoal">{title}</h2>
      {hint && <p className="mt-1 text-sm text-slate">{hint}</p>}
      <div className="mt-5">{children}</div>
    </Card>
  );
}

function Field({
  label,
  htmlFor,
  optional,
  children,
}: {
  label: string;
  htmlFor: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-charcoal">
        {label}
        {optional && <span className="ml-1.5 text-xs text-slate font-normal">optional</span>}
      </label>
      {children}
    </div>
  );
}

export default function VillaSubmissionForm({
  destinations,
}: {
  destinations: Destination[];
}) {
  const [values, setValues] = useState<VillaSubmissionFormValues>(EMPTY);
  const [destinationChoice, setDestinationChoice] = useState("");
  const [otherDestination, setOtherDestination] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((n) => n - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const set = <K extends keyof VillaSubmissionFormValues>(
    key: K,
    value: VillaSubmissionFormValues[K]
  ) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setError(null);
  };

  const toggleAmenity = (amenity: string) => {
    setValues((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (pending || cooldown > 0) return;

    const destination =
      destinationChoice === OTHER ? otherDestination.trim() : destinationChoice;

    setError(null);

    startTransition(async () => {
      const result = await submitVillaListing({ ...values, destination });

      if (result.success) {
        setCooldown(COOLDOWN_SECONDS);
        setSubmitted(true);
        return;
      }

      setError(result.error ?? "Couldn't send your submission.");
    });
  };

  if (submitted) {
    return (
      <Card className="p-8 sm:p-10 text-center shadow-sm">
        <CheckCircle2 size={40} className="mx-auto text-forest" />
        <h2 className="mt-4 font-display text-3xl text-charcoal">
          Thanks! We&apos;ll review your property and get back within 48 hours.
        </h2>
        <p className="mt-3 text-sm text-slate leading-relaxed max-w-md mx-auto">
          We&apos;ve got your details for{" "}
          <span className="text-charcoal font-medium">{values.villaName}</span>. Someone
          from the team will reach out on {values.ownerPhone} to arrange a
          property visit.
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setValues(EMPTY);
            setDestinationChoice("");
            setOtherDestination("");
            setSubmitted(false);
          }}
          disabled={cooldown > 0}
          className="mt-7"
        >
          {cooldown > 0
            ? `List another property in ${cooldown}s`
            : "List another property"}
        </Button>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Section title="Your details" hint="So we know who to talk to.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Full name" htmlFor="owner-name">
            <Input
              id="owner-name"
              value={values.ownerName}
              onChange={(e) => set("ownerName", e.target.value)}
              placeholder="Rhea Menon"
              autoComplete="name"
              required
            />
          </Field>
          <Field label="Email" htmlFor="owner-email">
            <Input
              id="owner-email"
              type="email"
              value={values.ownerEmail}
              onChange={(e) => set("ownerEmail", e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Phone (WhatsApp)" htmlFor="owner-phone">
              <Input
                id="owner-phone"
                type="tel"
                value={values.ownerPhone}
                onChange={(e) => set("ownerPhone", e.target.value)}
                placeholder="+91 98765 43210"
                autoComplete="tel"
                required
              />
            </Field>
          </div>
        </div>
      </Section>

      <Section
        title="The property"
        hint="A rough idea is fine — we confirm everything on the visit."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Villa name" htmlFor="villa-name">
            <Input
              id="villa-name"
              value={values.villaName}
              onChange={(e) => set("villaName", e.target.value)}
              placeholder="Casa Alma"
              required
            />
          </Field>
          <Field label="Location (city or area)" htmlFor="villa-location">
            <Input
              id="villa-location"
              value={values.location}
              onChange={(e) => set("location", e.target.value)}
              placeholder="Assagao, North Goa"
              required
            />
          </Field>

          <div className="sm:col-span-2">
            <Field label="Destination" htmlFor="villa-destination" optional>
              <select
                id="villa-destination"
                value={destinationChoice}
                onChange={(e) => setDestinationChoice(e.target.value)}
                className="h-11 min-h-[44px] w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm text-charcoal outline-none cursor-pointer focus-visible:border-forest focus-visible:ring-2 focus-visible:ring-forest/20"
              >
                <option value="">Select a destination</option>
                {destinations.map((destination) => (
                  <option key={destination.id} value={destination.name}>
                    {destination.name}
                  </option>
                ))}
                <option value={OTHER}>Other / not listed</option>
              </select>
            </Field>
            {destinationChoice === OTHER && (
              <Input
                value={otherDestination}
                onChange={(e) => setOtherDestination(e.target.value)}
                placeholder="Which destination?"
                aria-label="Other destination"
                className="mt-2.5"
              />
            )}
          </div>

          <Field label="Bedrooms" htmlFor="villa-bedrooms" optional>
            <Input
              id="villa-bedrooms"
              type="number"
              min={1}
              value={values.bedrooms}
              onChange={(e) => set("bedrooms", e.target.value)}
              placeholder="4"
            />
          </Field>
          <Field label="Bathrooms" htmlFor="villa-bathrooms" optional>
            <Input
              id="villa-bathrooms"
              type="number"
              min={1}
              value={values.bathrooms}
              onChange={(e) => set("bathrooms", e.target.value)}
              placeholder="4"
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Maximum guests" htmlFor="villa-guests" optional>
              <Input
                id="villa-guests"
                type="number"
                min={1}
                value={values.maxGuests}
                onChange={(e) => set("maxGuests", e.target.value)}
                placeholder="10"
              />
            </Field>
          </div>
        </div>
      </Section>

      <Section
        title="Describe the place"
        hint="What makes it worth the drive? A few sentences is plenty."
      >
        <Textarea
          id="villa-description"
          value={values.description}
          onChange={(e) => set("description", e.target.value)}
          rows={5}
          placeholder="Four-bedroom villa set back from the road, with a 12-metre pool, mango trees, and a cook who comes in the mornings…"
          aria-label="Property description"
          className="resize-y"
        />
      </Section>

      <Section
        title="Amenities"
        hint="Tick everything the property already has."
      >
        <div className="flex flex-col gap-6">
          <div>
            <h3 className="text-sm font-medium text-charcoal mb-3">
              Standout features
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
              {FEATURE_AMENITIES.map((amenity) => (
                <label
                  key={amenity}
                  className="flex items-center gap-2.5 cursor-pointer text-sm text-charcoal"
                >
                  <input
                    type="checkbox"
                    checked={values.amenities.includes(amenity)}
                    onChange={() => toggleAmenity(amenity)}
                    className="h-4 w-4 rounded accent-forest cursor-pointer"
                  />
                  {amenity}
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-charcoal mb-3">
              Comforts
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
              {UNIVERSAL_AMENITIES.map((amenity) => (
                <label
                  key={amenity}
                  className="flex items-center gap-2.5 cursor-pointer text-sm text-charcoal"
                >
                  <input
                    type="checkbox"
                    checked={values.amenities.includes(amenity)}
                    onChange={() => toggleAmenity(amenity)}
                    className="h-4 w-4 rounded accent-forest cursor-pointer"
                  />
                  {amenity}
                </label>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section
        title="Pricing"
        hint="What you'd want to charge. Nothing is locked in — we'll talk it through."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Price per night (₹)" htmlFor="villa-price" optional>
            <Input
              id="villa-price"
              type="number"
              min={0}
              value={values.pricePerNight}
              onChange={(e) => set("pricePerNight", e.target.value)}
              placeholder="24000"
            />
          </Field>
          <Field label="Weekend price (₹)" htmlFor="villa-weekend" optional>
            <Input
              id="villa-weekend"
              type="number"
              min={0}
              value={values.weekendPrice}
              onChange={(e) => set("weekendPrice", e.target.value)}
              placeholder="30000"
            />
          </Field>
        </div>
      </Section>

      <Section title="Photos">
        <p className="text-sm text-slate leading-relaxed">
          We&apos;ll collect photos during our property visit. Every villa on
          StayVilla is shot by us — no stock images, no listings we
          haven&apos;t stood inside.
        </p>
      </Section>

      <Section title="Anything else?" hint="Optional, but it helps.">
        <Textarea
          id="villa-message"
          value={values.message}
          onChange={(e) => set("message", e.target.value)}
          rows={4}
          placeholder="The property is managed by a caretaker who lives on site, and we block out December for family…"
          aria-label="Anything else you'd like to share"
          className="resize-y"
        />
      </Section>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3.5 text-sm text-destructive"
        >
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Button
          type="submit"
          loading={pending}
          disabled={cooldown > 0}
          size="lg"
        >
          {cooldown > 0
            ? `Try again in ${cooldown}s`
            : "Submit property"}
        </Button>
        <p className="text-xs text-slate leading-relaxed">
          No commission on inquiries. We&apos;ll only share your number with
          guests once you&apos;re live.
        </p>
      </div>
    </form>
  );
}


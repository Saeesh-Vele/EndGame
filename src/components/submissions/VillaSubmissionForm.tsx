"use client";

import { useEffect, useState, useTransition } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";
import {
  submitVillaListing,
  type SubmissionField,
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
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  optional?: boolean;
  /** Rendered under the input, and announced when it appears. */
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-charcoal">
        {label}
        {optional && <span className="ml-1.5 text-xs text-slate font-normal">optional</span>}
      </label>
      {children}
      {error && (
        <p
          id={`${htmlFor}-error`}
          role="alert"
          className="flex items-start gap-1.5 text-xs font-medium text-destructive"
        >
          <AlertCircle size={13} className="mt-px shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Where each field lives in the DOM. The form is taller than a screen, so a
 * rejection has to take the owner to the input rather than leaving a message
 * somewhere they'd have to scroll to find.
 */
const FIELD_INPUT_ID: Partial<Record<SubmissionField, string>> = {
  ownerName: "owner-name",
  ownerEmail: "owner-email",
  ownerPhone: "owner-phone",
  villaName: "villa-name",
  location: "villa-location",
  destination: "villa-destination",
  bedrooms: "villa-bedrooms",
  bathrooms: "villa-bathrooms",
  maxGuests: "villa-guests",
  description: "villa-description",
  pricePerNight: "villa-price",
  weekendPrice: "villa-weekend",
  message: "villa-message",
};

export default function VillaSubmissionForm({
  destinations,
}: {
  destinations: Destination[];
}) {
  const [values, setValues] = useState<VillaSubmissionFormValues>(EMPTY);
  const [destinationChoice, setDestinationChoice] = useState("");
  const [otherDestination, setOtherDestination] = useState("");
  /** Failures that belong to one input, rendered under it. */
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<SubmissionField, string>>
  >({});
  /** Failures that don't — a rejected insert, a dropped connection. */
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
    // Clear only this field's error — the others are still true.
    setFieldErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  };

  /** Puts the cursor on the field that was rejected and scrolls it into view. */
  const focusField = (field: SubmissionField) => {
    const id = FIELD_INPUT_ID[field];
    const el = id ? document.getElementById(id) : null;
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    (el as HTMLElement | null)?.focus({ preventScroll: true });
  };

  const toggleAmenity = (amenity: string) => {
    setValues((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  /** The required-field rules the Server Action applies, run first so the
   *  owner gets them without a round trip. The action still decides. */
  const validate = (): Partial<Record<SubmissionField, string>> => {
    const problems: Partial<Record<SubmissionField, string>> = {};

    if (!values.ownerName.trim()) problems.ownerName = "Tell us who to talk to.";

    const email = values.ownerEmail.trim();
    if (!email) problems.ownerEmail = "We need an email address to reply to.";
    else if (!EMAIL.test(email))
      problems.ownerEmail = "That email doesn't look right — check for a typo.";

    const phoneDigits = values.ownerPhone.replace(/\D/g, "");
    if (!phoneDigits)
      problems.ownerPhone =
        "Add a WhatsApp number — it's how we arrange the property visit.";
    else if (phoneDigits.length < 8 || phoneDigits.length > 15)
      problems.ownerPhone =
        "That number looks short. Include the country code.";

    if (!values.villaName.trim())
      problems.villaName = "What's the property called? A working name is fine.";

    if (!values.location.trim())
      problems.location = "Where is it? A city or area is enough.";

    // "Other" with nothing typed would submit a blank destination and silently
    // lose what the owner meant to tell us.
    if (destinationChoice === OTHER && !otherDestination.trim())
      problems.destination =
        "Type the destination, or pick one from the list instead.";

    return problems;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (pending || cooldown > 0) return;

    const destination =
      destinationChoice === OTHER ? otherDestination.trim() : destinationChoice;

    setError(null);

    const problems = validate();
    const order: SubmissionField[] = [
      "ownerName",
      "ownerEmail",
      "ownerPhone",
      "villaName",
      "location",
      "destination",
    ];
    const firstInvalid = order.find((field) => problems[field]);

    if (firstInvalid) {
      setFieldErrors(problems);
      focusField(firstInvalid);
      return;
    }

    setFieldErrors({});

    startTransition(async () => {
      const result = await submitVillaListing({ ...values, destination });

      if (result.success) {
        setCooldown(COOLDOWN_SECONDS);
        setSubmitted(true);
        return;
      }

      if (result.field) {
        setFieldErrors({ [result.field]: result.error });
        focusField(result.field);
        return;
      }

      setError(result.error);
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
          <Field label="Full name" htmlFor="owner-name" error={fieldErrors.ownerName}>
            <Input
              id="owner-name"
              aria-invalid={Boolean(fieldErrors.ownerName)}
              aria-describedby={
                fieldErrors.ownerName ? "owner-name-error" : undefined
              }
              value={values.ownerName}
              onChange={(e) => set("ownerName", e.target.value)}
              placeholder="Rhea Menon"
              autoComplete="name"
              required
            />
          </Field>
          <Field label="Email" htmlFor="owner-email" error={fieldErrors.ownerEmail}>
            <Input
              id="owner-email"
              aria-invalid={Boolean(fieldErrors.ownerEmail)}
              aria-describedby={fieldErrors.ownerEmail ? "owner-email-error" : undefined}
              type="email"
              value={values.ownerEmail}
              onChange={(e) => set("ownerEmail", e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Phone (WhatsApp)" htmlFor="owner-phone" error={fieldErrors.ownerPhone}>
              <Input
                id="owner-phone"
              aria-invalid={Boolean(fieldErrors.ownerPhone)}
              aria-describedby={fieldErrors.ownerPhone ? "owner-phone-error" : undefined}
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
          <Field label="Villa name" htmlFor="villa-name" error={fieldErrors.villaName}>
            <Input
              id="villa-name"
              aria-invalid={Boolean(fieldErrors.villaName)}
              aria-describedby={
                fieldErrors.villaName ? "villa-name-error" : undefined
              }
              value={values.villaName}
              onChange={(e) => set("villaName", e.target.value)}
              placeholder="Casa Alma"
              required
            />
          </Field>
          <Field label="Location (city or area)" htmlFor="villa-location" error={fieldErrors.location}>
            <Input
              id="villa-location"
              aria-invalid={Boolean(fieldErrors.location)}
              aria-describedby={
                fieldErrors.location ? "villa-location-error" : undefined
              }
              value={values.location}
              onChange={(e) => set("location", e.target.value)}
              placeholder="Assagao, North Goa"
              required
            />
          </Field>

          <div className="sm:col-span-2">
            <Field label="Destination" htmlFor="villa-destination" optional error={fieldErrors.destination}>
              <select
                id="villa-destination"
                aria-invalid={Boolean(fieldErrors.destination)}
                aria-describedby={
                  fieldErrors.destination ? "villa-destination-error" : undefined
                }
                value={destinationChoice}
                onChange={(e) => {
                  setDestinationChoice(e.target.value);
                  setFieldErrors((prev) =>
                    prev.destination ? { ...prev, destination: undefined } : prev
                  );
                }}
                className={`h-11 min-h-[44px] w-full rounded-xl border bg-card px-4 py-2.5 text-sm text-charcoal outline-none cursor-pointer focus-visible:border-forest focus-visible:ring-2 focus-visible:ring-forest/20 ${
                  fieldErrors.destination ? "border-destructive" : "border-input"
                }`}
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
                onChange={(e) => {
                  setOtherDestination(e.target.value);
                  setFieldErrors((prev) =>
                    prev.destination ? { ...prev, destination: undefined } : prev
                  );
                }}
                placeholder="Which destination?"
                aria-label="Other destination"
                aria-invalid={Boolean(fieldErrors.destination)}
                className="mt-2.5"
              />
            )}
          </div>

          <Field label="Bedrooms" htmlFor="villa-bedrooms" optional error={fieldErrors.bedrooms}>
            <Input
              id="villa-bedrooms"
              aria-invalid={Boolean(fieldErrors.bedrooms)}
              aria-describedby={fieldErrors.bedrooms ? "villa-bedrooms-error" : undefined}
              type="number"
              min={1}
              value={values.bedrooms}
              onChange={(e) => set("bedrooms", e.target.value)}
              placeholder="4"
            />
          </Field>
          <Field label="Bathrooms" htmlFor="villa-bathrooms" optional error={fieldErrors.bathrooms}>
            <Input
              id="villa-bathrooms"
              aria-invalid={Boolean(fieldErrors.bathrooms)}
              aria-describedby={fieldErrors.bathrooms ? "villa-bathrooms-error" : undefined}
              type="number"
              min={1}
              value={values.bathrooms}
              onChange={(e) => set("bathrooms", e.target.value)}
              placeholder="4"
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Maximum guests" htmlFor="villa-guests" optional error={fieldErrors.maxGuests}>
              <Input
                id="villa-guests"
              aria-invalid={Boolean(fieldErrors.maxGuests)}
              aria-describedby={fieldErrors.maxGuests ? "villa-guests-error" : undefined}
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
          <Field label="Price per night (₹)" htmlFor="villa-price" optional error={fieldErrors.pricePerNight}>
            <Input
              id="villa-price"
              aria-invalid={Boolean(fieldErrors.pricePerNight)}
              aria-describedby={fieldErrors.pricePerNight ? "villa-price-error" : undefined}
              type="number"
              min={0}
              value={values.pricePerNight}
              onChange={(e) => set("pricePerNight", e.target.value)}
              placeholder="24000"
            />
          </Field>
          <Field label="Weekend price (₹)" htmlFor="villa-weekend" optional error={fieldErrors.weekendPrice}>
            <Input
              id="villa-weekend"
              aria-invalid={Boolean(fieldErrors.weekendPrice)}
              aria-describedby={fieldErrors.weekendPrice ? "villa-weekend-error" : undefined}
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


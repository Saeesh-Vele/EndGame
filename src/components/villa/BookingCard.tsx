"use client";

import { useMemo, useState, useTransition } from "react";
import { MessageCircle, Minus, Plus, ShieldCheck, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import {
  logWhatsappInquiry,
  submitBookingRequest,
} from "@/app/villas/[slug]/actions";
import { useSession } from "@/components/shared/SessionProvider";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function formatINR(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

function formatDisplayDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function calcPricing(
  checkIn: string,
  checkOut: string,
  basePrice: number,
  weekendPrice?: number
) {
  if (!checkIn || !checkOut) return null;

  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const nights = Math.round((end.getTime() - start.getTime()) / 86_400_000);
  if (nights <= 0) return null;

  let weekendNights = 0;
  if (weekendPrice) {
    for (let i = 0; i < nights; i++) {
      const day = new Date(start.getTime() + i * 86_400_000).getDay();
      if (day === 5 || day === 6) weekendNights++;
    }
  }

  const baseSubtotal = nights * basePrice;
  const weekendSurcharge = weekendPrice
    ? weekendNights * (weekendPrice - basePrice)
    : 0;

  return {
    nights,
    weekendNights,
    baseSubtotal,
    weekendSurcharge,
    total: baseSubtotal + weekendSurcharge,
  };
}

export default function BookingCard({
  villaId,
  villaName,
  pricePerNight,
  weekendPrice,
  maxGuests,
  ownerName,
  ownerWhatsapp,
}: {
  villaId: string;
  villaName: string;
  pricePerNight: number;
  weekendPrice?: number;
  maxGuests: number;
  ownerName?: string;
  ownerWhatsapp: string;
}) {
  const todayIso = useMemo(() => new Date().toISOString().split("T")[0], []);

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [guestNameInput, setGuestName] = useState<string | null>(null);
  const [guestEmailInput, setGuestEmail] = useState<string | null>(null);
  const [guestPhone, setGuestPhone] = useState("");
  const [requestSent, setRequestSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    name?: boolean;
    email?: boolean;
    phone?: boolean;
  }>({});
  const [isPending, startTransition] = useTransition();

  const { user } = useSession();

  const prefillName =
    typeof user?.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : "";

  const guestName = guestNameInput ?? prefillName;
  const guestEmail = guestEmailInput ?? user?.email ?? "";

  const pricing = useMemo(
    () => calcPricing(checkIn, checkOut, pricePerNight, weekendPrice),
    [checkIn, checkOut, pricePerNight, weekendPrice]
  );

  const whatsappHref = useMemo(() => {
    const lines = [`Hi! I'm interested in booking ${villaName} on StayVilla.`];
    if (checkIn && checkOut) {
      lines.push(
        `Dates: ${formatDisplayDate(checkIn)} – ${formatDisplayDate(checkOut)}`
      );
    }
    lines.push(`Guests: ${guests}`);
    const phone = ownerWhatsapp.replace(/[^\d]/g, "");
    return `https://wa.me/${phone}?text=${encodeURIComponent(lines.join("\n"))}`;
  }, [villaName, checkIn, checkOut, guests, ownerWhatsapp]);

  const canRequest = Boolean(pricing);

  const resetRequestState = () => {
    setRequestSent(false);
    setErrorMessage(null);
    setFieldErrors({});
  };

  const handleCheckInChange = (val: string) => {
    setCheckIn(val);
    if (checkOut && val && checkOut <= val) {
      const nextDay = new Date(new Date(val).getTime() + 86_400_000)
        .toISOString()
        .split("T")[0];
      setCheckOut(nextDay);
    }
    resetRequestState();
  };

  const handleRequest = () => {
    if (!pricing) return;

    const errors: { name?: boolean; email?: boolean; phone?: boolean } = {};
    if (!guestName.trim()) errors.name = true;
    if (!guestEmail.trim() || !guestEmail.includes("@")) errors.email = true;
    if (!guestPhone.trim() || guestPhone.trim().length < 8) errors.phone = true;

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setErrorMessage("Please complete all required guest information correctly.");
      return;
    }

    setErrorMessage(null);
    setFieldErrors({});

    startTransition(async () => {
      const result = await submitBookingRequest({
        villaId,
        checkIn,
        checkOut,
        guests,
        totalPrice: pricing.total,
        guestName: guestName.trim(),
        guestEmail: guestEmail.trim(),
        guestPhone: guestPhone.trim(),
      });

      if (result.success) {
        setRequestSent(true);
      } else {
        setErrorMessage(result.error ?? "Something went wrong. Please try again.");
      }
    });
  };

  const scrollToCard = () => {
    const cardEl = document.getElementById("booking-card");
    if (cardEl) {
      cardEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <Card
        id="booking-card"
        className="lg:sticky lg:top-24 self-start p-6 sm:p-8 shadow-md border-pebble bg-card rounded-2xl"
      >
        <div className="flex items-baseline justify-between gap-2 border-b border-pebble pb-4">
          <div>
            <span className="text-2xl sm:text-3xl font-bold text-charcoal">
              {formatINR(pricePerNight)}
            </span>
            <span className="text-xs text-slate ml-1">/ night</span>
          </div>
          <span className="flex items-center gap-1 text-xs font-semibold text-forest bg-forest/10 px-2.5 py-1 rounded-full">
            <Sparkles size={13} />
            Direct Rate
          </span>
        </div>

        {/* Date & Guest Input Block */}
        <div className="mt-5 rounded-xl border border-pebble overflow-hidden bg-card shadow-xs">
          <div className="grid grid-cols-2">
            <label className="flex min-w-0 flex-col gap-1 px-4 py-3 border-r border-pebble cursor-pointer hover:bg-sandstone/30 transition-colors">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate">
                Check in
              </span>
              <input
                type="date"
                min={todayIso}
                value={checkIn}
                onChange={(e) => handleCheckInChange(e.target.value)}
                aria-label="Check-in date"
                className="w-full min-w-0 cursor-pointer bg-transparent text-sm font-medium text-charcoal outline-none"
              />
            </label>
            <label className="flex min-w-0 flex-col gap-1 px-4 py-3 cursor-pointer hover:bg-sandstone/30 transition-colors">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate">
                Check out
              </span>
              <input
                type="date"
                min={checkIn || todayIso}
                value={checkOut}
                onChange={(e) => {
                  setCheckOut(e.target.value);
                  resetRequestState();
                }}
                aria-label="Check-out date"
                className="w-full min-w-0 cursor-pointer bg-transparent text-sm font-medium text-charcoal outline-none"
              />
            </label>
          </div>
          <div className="flex items-center justify-between px-4 py-3 border-t border-pebble bg-sandstone/20">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate">
              Guests
            </span>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                onClick={() => setGuests((g) => Math.max(1, g - 1))}
                disabled={guests <= 1}
                aria-label="Decrease guests"
                className="rounded-full min-h-[36px] min-w-[36px] border-pebble"
              >
                <Minus size={14} />
              </Button>
              <span className="text-sm font-semibold text-charcoal w-4 text-center">
                {guests}
              </span>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                onClick={() => setGuests((g) => Math.min(maxGuests, g + 1))}
                disabled={guests >= maxGuests}
                aria-label="Increase guests"
                className="rounded-full min-h-[36px] min-w-[36px] border-pebble"
              >
                <Plus size={14} />
              </Button>
            </div>
          </div>
        </div>

        {/* Guest Information Inputs (Visible when dates selected) */}
        {canRequest && !requestSent && (
          <div className="mt-4 flex flex-col gap-2.5">
            <div className="relative">
              <Input
                type="text"
                value={guestName}
                onChange={(e) => {
                  setGuestName(e.target.value);
                  resetRequestState();
                }}
                placeholder="Full name *"
                aria-invalid={fieldErrors.name}
                aria-label="Full name"
                className={fieldErrors.name ? "border-destructive focus-visible:ring-destructive" : ""}
              />
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <Input
                type="email"
                value={guestEmail}
                onChange={(e) => {
                  setGuestEmail(e.target.value);
                  resetRequestState();
                }}
                placeholder="Email *"
                aria-invalid={fieldErrors.email}
                aria-label="Email address"
                className={fieldErrors.email ? "border-destructive focus-visible:ring-destructive" : ""}
              />
              <Input
                type="tel"
                value={guestPhone}
                onChange={(e) => {
                  setGuestPhone(e.target.value);
                  resetRequestState();
                }}
                placeholder="Phone *"
                aria-invalid={fieldErrors.phone}
                aria-label="Phone number"
                className={fieldErrors.phone ? "border-destructive focus-visible:ring-destructive" : ""}
              />
            </div>
          </div>
        )}

        {/* Actionable Error Feedback */}
        {errorMessage && (
          <div
            role="alert"
            aria-live="polite"
            className="mt-3.5 flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-xs font-semibold text-destructive"
          >
            <AlertCircle size={15} className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Confirmation State Card */}
        {requestSent ? (
          <Card className="mt-5 p-5 bg-forest/10 border border-forest/20 rounded-xl flex flex-col gap-3">
            <div className="flex items-center gap-2 text-forest font-semibold text-sm">
              <CheckCircle2 size={18} className="shrink-0 text-forest" />
              <span>Booking Request Received</span>
            </div>
            <p className="text-xs text-charcoal leading-relaxed font-normal">
              Your request for <strong className="font-semibold">{villaName}</strong> ({formatDisplayDate(checkIn)} – {formatDisplayDate(checkOut)}) has been sent. {ownerName ?? "The host"} usually confirms availability within 4 hours.
            </p>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center justify-center gap-2 text-xs font-semibold text-white bg-forest hover:bg-forest-light transition-colors py-2.5 px-4 rounded-xl shadow-xs"
            >
              <MessageCircle size={15} />
              Follow up instantly on WhatsApp
            </a>
          </Card>
        ) : (
          <Button
            type="button"
            onClick={handleRequest}
            loading={isPending}
            disabled={!canRequest}
            className="mt-5 w-full font-semibold shadow-xs"
            size="lg"
          >
            {canRequest ? "Request to book" : "Select dates to check availability"}
          </Button>
        )}

        {/* Transparent Price Breakdown */}
        {pricing && (
          <div className="mt-5 flex flex-col gap-2.5 text-sm text-charcoal bg-sandstone/40 p-4 rounded-xl border border-pebble">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-slate">
                {formatINR(pricePerNight)} × {pricing.nights}{" "}
                {pricing.nights === 1 ? "night" : "nights"}
              </span>
              <span className="font-medium">{formatINR(pricing.baseSubtotal)}</span>
            </div>
            {pricing.weekendSurcharge > 0 && (
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-slate">
                  Weekend surcharge · {pricing.weekendNights}{" "}
                  {pricing.weekendNights === 1 ? "night" : "nights"}
                </span>
                <span className="font-medium">+{formatINR(pricing.weekendSurcharge)}</span>
              </div>
            )}
            <div className="flex items-center justify-between pt-2.5 border-t border-pebble font-semibold">
              <span className="text-charcoal">Total (INR)</span>
              <span className="font-bold text-lg text-charcoal">{formatINR(pricing.total)}</span>
            </div>
          </div>
        )}

        <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-slate">
          <ShieldCheck size={14} className="text-forest shrink-0" />
          <span>Zero hidden fees · Direct booking with host</span>
        </div>

        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            void logWhatsappInquiry(villaId);
          }}
          className="cursor-pointer mt-4 flex items-center justify-center gap-2 text-xs font-semibold text-forest hover:text-forest-light transition-colors py-2.5 rounded-xl bg-forest/5 hover:bg-forest/10 border border-forest/15"
        >
          <MessageCircle size={15} />
          Or message host directly on WhatsApp
        </a>
      </Card>

      {/* Mobile Fixed Bottom Booking Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-pebble p-4 shadow-xl flex items-center justify-between gap-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div>
          <span className="text-xl font-bold text-charcoal">
            {formatINR(pricePerNight)}
          </span>
          <span className="text-xs text-slate ml-1">/ night</span>
          {pricing && (
            <p className="text-xs font-semibold text-forest mt-0.5">
              Total: {formatINR(pricing.total)} ({pricing.nights}n)
            </p>
          )}
        </div>

        <Button
          type="button"
          size="lg"
          onClick={scrollToCard}
          className="px-6 font-semibold shadow-sm min-h-[44px]"
        >
          {canRequest ? "Request to book" : "Check dates"}
        </Button>
      </div>
    </>
  );
}




"use client";

import { useMemo, useState, useTransition } from "react";
import { MessageCircle, Minus, Plus } from "lucide-react";
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
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [guestNameInput, setGuestName] = useState<string | null>(null);
  const [guestEmailInput, setGuestEmail] = useState<string | null>(null);
  const [guestPhone, setGuestPhone] = useState("");
  const [requestSent, setRequestSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
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
  };

  const handleRequest = () => {
    if (!pricing) return;
    if (!guestName.trim() || !guestEmail.trim() || !guestPhone.trim()) {
      setErrorMessage("Please fill in your name, email, and phone number.");
      return;
    }

    setErrorMessage(null);
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

  return (
    <Card className="lg:sticky lg:top-24 self-start p-6 shadow-sm">
      <div className="flex items-baseline gap-1.5">
        <span className="text-xl font-semibold text-charcoal">
          {formatINR(pricePerNight)}
        </span>
        <span className="text-sm text-slate">/ night</span>
      </div>

      <div className="mt-4 rounded-xl border border-pebble overflow-hidden bg-card">
        <div className="grid grid-cols-2">
          <label className="flex flex-col gap-1 px-4 py-3 border-r border-pebble cursor-pointer">
            <span className="text-xs font-medium text-charcoal">Check in</span>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => {
                setCheckIn(e.target.value);
                resetRequestState();
              }}
              className="cursor-pointer bg-transparent text-sm text-charcoal outline-none"
            />
          </label>
          <label className="flex flex-col gap-1 px-4 py-3 cursor-pointer">
            <span className="text-xs font-medium text-charcoal">
              Check out
            </span>
            <input
              type="date"
              value={checkOut}
              onChange={(e) => {
                setCheckOut(e.target.value);
                resetRequestState();
              }}
              className="cursor-pointer bg-transparent text-sm text-charcoal outline-none"
            />
          </label>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-pebble">
          <span className="text-xs font-medium text-charcoal">Guests</span>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              onClick={() => setGuests((g) => Math.max(1, g - 1))}
              disabled={guests <= 1}
              aria-label="Decrease guests"
              className="rounded-full min-h-[36px] min-w-[36px]"
            >
              <Minus size={14} />
            </Button>
            <span className="text-sm font-medium text-charcoal w-4 text-center">
              {guests}
            </span>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              onClick={() => setGuests((g) => Math.min(maxGuests, g + 1))}
              disabled={guests >= maxGuests}
              aria-label="Increase guests"
              className="rounded-full min-h-[36px] min-w-[36px]"
            >
              <Plus size={14} />
            </Button>
          </div>
        </div>
      </div>

      {canRequest && !requestSent && (
        <div className="mt-4 flex flex-col gap-2.5">
          <Input
            type="text"
            value={guestName}
            onChange={(e) => {
              setGuestName(e.target.value);
              resetRequestState();
            }}
            placeholder="Full name"
          />
          <div className="grid grid-cols-2 gap-2.5">
            <Input
              type="email"
              value={guestEmail}
              onChange={(e) => {
                setGuestEmail(e.target.value);
                resetRequestState();
              }}
              placeholder="Email"
            />
            <Input
              type="tel"
              value={guestPhone}
              onChange={(e) => {
                setGuestPhone(e.target.value);
                resetRequestState();
              }}
              placeholder="Phone"
            />
          </div>
        </div>
      )}

      {errorMessage && (
        <div
          role="alert"
          aria-live="polite"
          className="mt-3 text-sm text-destructive"
        >
          {errorMessage}
        </div>
      )}

      {requestSent ? (
        <div className="mt-4 rounded-xl bg-forest/10 px-4 py-3.5 text-sm text-forest font-medium">
          Request sent — {ownerName ?? "the host"} usually responds within a
          few hours.
        </div>
      ) : (
        <Button
          type="button"
          onClick={handleRequest}
          loading={isPending}
          disabled={!canRequest}
          className="mt-4 w-full"
          size="lg"
        >
          {canRequest ? "Request to book" : "Check availability"}
        </Button>
      )}

      {pricing && (
        <div className="mt-5 flex flex-col gap-2.5 text-sm text-charcoal">
          <div className="flex items-center justify-between">
            <span className="text-slate">
              {formatINR(pricePerNight)} × {pricing.nights}{" "}
              {pricing.nights === 1 ? "night" : "nights"}
            </span>
            <span>{formatINR(pricing.baseSubtotal)}</span>
          </div>
          {pricing.weekendSurcharge > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-slate">
                Weekend surcharge · {pricing.weekendNights}{" "}
                {pricing.weekendNights === 1 ? "night" : "nights"}
              </span>
              <span>+{formatINR(pricing.weekendSurcharge)}</span>
            </div>
          )}
          <div className="flex items-center justify-between pt-2.5 border-t border-pebble font-medium">
            <span>Total</span>
            <span className="font-semibold text-base">{formatINR(pricing.total)}</span>
          </div>
        </div>
      )}

      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => {
          void logWhatsappInquiry(villaId);
        }}
        className="cursor-pointer mt-4 flex items-center justify-center gap-2 text-sm text-forest hover:text-forest-light transition-colors duration-200"
      >
        <MessageCircle size={16} />
        or message on WhatsApp
      </a>
    </Card>
  );
}


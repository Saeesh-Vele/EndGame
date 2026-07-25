"use client";

import { useMemo, useState } from "react";
import { MessageCircle, Minus, Plus } from "lucide-react";

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
  villaName,
  pricePerNight,
  weekendPrice,
  maxGuests,
  ownerName,
  ownerWhatsapp,
}: {
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
  const [requestSent, setRequestSent] = useState(false);

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

  return (
    <div className="lg:sticky lg:top-24 self-start rounded-2xl bg-white shadow-sm p-6">
      <div className="flex items-baseline gap-1.5">
        <span className="text-xl text-charcoal">
          {formatINR(pricePerNight)}
        </span>
        <span className="text-sm text-slate">/ night</span>
      </div>

      <div className="mt-4 rounded-xl border border-pebble overflow-hidden">
        <div className="grid grid-cols-2">
          <label className="flex flex-col gap-1 px-4 py-3 border-r border-pebble">
            <span className="text-xs font-medium text-charcoal">Check in</span>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => {
                setCheckIn(e.target.value);
                setRequestSent(false);
              }}
              className="cursor-pointer bg-transparent text-sm text-charcoal outline-none"
            />
          </label>
          <label className="flex flex-col gap-1 px-4 py-3">
            <span className="text-xs font-medium text-charcoal">
              Check out
            </span>
            <input
              type="date"
              value={checkOut}
              onChange={(e) => {
                setCheckOut(e.target.value);
                setRequestSent(false);
              }}
              className="cursor-pointer bg-transparent text-sm text-charcoal outline-none"
            />
          </label>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-pebble">
          <span className="text-xs font-medium text-charcoal">Guests</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setGuests((g) => Math.max(1, g - 1))}
              disabled={guests <= 1}
              aria-label="Decrease guests"
              className="cursor-pointer flex items-center justify-center h-7 w-7 rounded-full border border-pebble text-charcoal disabled:opacity-40 disabled:cursor-not-allowed hover:border-forest transition-colors duration-200"
            >
              <Minus size={14} />
            </button>
            <span className="text-sm text-charcoal w-4 text-center">
              {guests}
            </span>
            <button
              type="button"
              onClick={() => setGuests((g) => Math.min(maxGuests, g + 1))}
              disabled={guests >= maxGuests}
              aria-label="Increase guests"
              className="cursor-pointer flex items-center justify-center h-7 w-7 rounded-full border border-pebble text-charcoal disabled:opacity-40 disabled:cursor-not-allowed hover:border-forest transition-colors duration-200"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
      </div>

      {requestSent ? (
        <div className="mt-4 rounded-xl bg-forest/10 px-4 py-3.5 text-sm text-forest">
          Request sent — {ownerName ?? "the host"} usually responds within a
          few hours.
        </div>
      ) : (
        <button
          type="button"
          onClick={() => canRequest && setRequestSent(true)}
          disabled={!canRequest}
          className="cursor-pointer mt-4 w-full rounded-xl bg-forest hover:bg-forest-light active:bg-forest-dark disabled:bg-pebble disabled:cursor-not-allowed text-white text-sm font-medium px-6 py-3.5 transition-colors duration-200"
        >
          {canRequest ? "Request to book" : "Check availability"}
        </button>
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
            <span>{formatINR(pricing.total)}</span>
          </div>
        </div>
      )}

      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        className="cursor-pointer mt-4 flex items-center justify-center gap-2 text-sm text-forest hover:text-forest-light transition-colors duration-200"
      >
        <MessageCircle size={16} />
        or message on WhatsApp
      </a>
    </div>
  );
}

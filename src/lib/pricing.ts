/**
 * What a stay costs. One implementation, used by both sides.
 *
 * The booking card renders this breakdown and the Server Action stores the
 * total it produces, so the two can't drift: the price a guest agreed to is
 * arithmetically the price on the record. The client's own number is never
 * sent — see submitBookingRequest.
 *
 * The schema has no fee or tax columns (and `pricing_rules` / `blocked_dates`
 * are unused by the app), so the whole model is: a nightly rate, plus an
 * optional weekend rate that applies to Friday and Saturday nights.
 */

/** The rate columns a quote needs. Matches villas.price_per_night etc. */
export interface VillaRates {
  price_per_night: number;
  weekend_price?: number;
}

export interface StayQuote {
  nights: number;
  weekendNights: number;
  baseSubtotal: number;
  /** Extra charged for weekend nights. Negative if the weekend rate is lower. */
  weekendSurcharge: number;
  total: number;
}

const DAY_MS = 86_400_000;

/**
 * Nights between two `YYYY-MM-DD` dates, or null if the range is unusable.
 *
 * Both dates are read as UTC — which is what `new Date("2026-01-01")` gives —
 * and the weekday is read in UTC too. Using the local weekday would mean a
 * browser in Los Angeles and a server in UTC disagreeing about whether a
 * Saturday is a Saturday, which is exactly the kind of drift this module
 * exists to prevent.
 */
export function quoteStay(
  checkIn: string,
  checkOut: string,
  rates: VillaRates
): StayQuote | null {
  if (!checkIn || !checkOut) return null;

  const start = Date.parse(`${checkIn}T00:00:00Z`);
  const end = Date.parse(`${checkOut}T00:00:00Z`);
  if (!Number.isFinite(start) || !Number.isFinite(end)) return null;

  const nights = Math.round((end - start) / DAY_MS);
  if (nights <= 0) return null;

  const basePrice = rates.price_per_night;
  if (!Number.isFinite(basePrice) || basePrice < 0) return null;

  const weekendPrice =
    rates.weekend_price && Number.isFinite(rates.weekend_price)
      ? rates.weekend_price
      : undefined;

  let weekendNights = 0;
  if (weekendPrice) {
    for (let i = 0; i < nights; i++) {
      const day = new Date(start + i * DAY_MS).getUTCDay();
      if (day === 5 || day === 6) weekendNights++;
    }
  }

  const baseSubtotal = nights * basePrice;
  const weekendSurcharge = weekendPrice
    ? weekendNights * (weekendPrice - basePrice)
    : 0;

  // numeric(10, 2) in Postgres — round here so the stored value and the
  // rendered one are the same number rather than differing in the cents.
  const round = (amount: number) => Math.round(amount * 100) / 100;

  return {
    nights,
    weekendNights,
    baseSubtotal: round(baseSubtotal),
    weekendSurcharge: round(weekendSurcharge),
    total: round(baseSubtotal + weekendSurcharge),
  };
}

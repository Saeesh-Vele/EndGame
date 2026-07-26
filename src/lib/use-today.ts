"use client";

import { useSyncExternalStore } from "react";

/** Nothing to subscribe to — the value only needs to differ per environment. */
const subscribe = () => () => {};

// en-CA formats as YYYY-MM-DD, which is what <input type="date"> wants.
const getSnapshot = () => new Date().toLocaleDateString("en-CA");

const getServerSnapshot = () => "";

/**
 * Today's date as YYYY-MM-DD in the *viewer's* timezone, for the `min`
 * attribute on date inputs.
 *
 * Read through useSyncExternalStore so the server and the hydration pass both
 * see "" and only the client ever computes a date. Formatting during render
 * instead would produce a different string on a server in another timezone,
 * which React reports as a hydration mismatch. Browsers treat an empty `min`
 * as no minimum, so the pre-hydration markup is still valid.
 */
export function useTodayISO(): string {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

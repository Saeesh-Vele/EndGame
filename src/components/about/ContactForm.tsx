"use client";

import { useEffect, useState, useTransition } from "react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import {
  submitContactMessage,
  type ContactFormValues,
} from "@/app/about/actions";

/** Seconds the form stays locked after a successful send. */
const COOLDOWN_SECONDS = 30;

const EMPTY: ContactFormValues = { name: "", email: "", message: "" };

const inputClass =
  "w-full rounded-xl border border-pebble bg-white px-3.5 py-2.5 text-sm text-charcoal outline-none transition-colors duration-200 placeholder:text-slate/70 focus:border-forest";

export default function ContactForm() {
  const [values, setValues] = useState<ContactFormValues>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [pending, startTransition] = useTransition();

  // Cheap anti-spam, same approach as the villa submission form: a lock after
  // a successful send. It stops double-taps and casual repeat submissions —
  // it's client-side, so the server-side validation is what actually holds.
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((n) => n - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const set = (key: keyof ContactFormValues, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setError(null);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (pending || cooldown > 0) return;

    setError(null);

    startTransition(async () => {
      const result = await submitContactMessage(values);

      if (result.success) {
        setValues(EMPTY);
        setSent(true);
        setCooldown(COOLDOWN_SECONDS);
        return;
      }

      // No cooldown on a rejection — a typo shouldn't cost half a minute.
      setError(result.error ?? "Couldn't send your message.");
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {sent && (
        <div className="flex items-start gap-2.5 rounded-xl border border-forest/25 bg-forest/5 px-4 py-3.5 text-sm text-forest">
          <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
          <span>Thanks! We&apos;ll get back to you within 24 hours.</span>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-700"
        >
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="contact-name" className="text-sm text-charcoal">
            Name
          </label>
          <input
            id="contact-name"
            value={values.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Rhea Menon"
            autoComplete="name"
            required
            disabled={pending}
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="contact-email" className="text-sm text-charcoal">
            Email
          </label>
          <input
            id="contact-email"
            type="email"
            value={values.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            required
            disabled={pending}
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="contact-message" className="text-sm text-charcoal">
          Message
        </label>
        <textarea
          id="contact-message"
          value={values.message}
          onChange={(e) => set("message", e.target.value)}
          rows={5}
          placeholder="We're four people looking for somewhere in North Goa over New Year…"
          required
          disabled={pending}
          className={`${inputClass} resize-y`}
        />
      </div>

      <button
        type="submit"
        disabled={pending || cooldown > 0}
        className="cursor-pointer inline-flex items-center justify-center gap-2 self-start rounded-xl bg-forest px-7 py-3.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-forest-light active:bg-forest-dark disabled:cursor-not-allowed disabled:bg-pebble"
      >
        {pending && <Loader2 size={16} className="animate-spin" />}
        {pending
          ? "Sending…"
          : cooldown > 0
            ? `Send another in ${cooldown}s`
            : "Send message"}
      </button>
    </form>
  );
}

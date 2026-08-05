"use client";

import { useEffect, useState, useTransition } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import {
  submitContactMessage,
  type ContactFormValues,
} from "@/app/about/actions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

/** Seconds the form stays locked after a successful send. */
const COOLDOWN_SECONDS = 30;

const EMPTY: ContactFormValues = { name: "", email: "", message: "" };

export default function ContactForm() {
  const [values, setValues] = useState<ContactFormValues>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [pending, startTransition] = useTransition();

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

      setError(result.error ?? "Couldn't send your message.");
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {sent && (
        <div className="flex items-start gap-2.5 rounded-xl border border-forest/25 bg-forest/5 px-4 py-3.5 text-sm text-forest font-medium">
          <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
          <span>Thanks! We&apos;ll get back to you within 24 hours.</span>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3.5 text-sm text-destructive"
        >
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="contact-name" className="text-sm font-medium text-charcoal">
            Name
          </label>
          <Input
            id="contact-name"
            value={values.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Rhea Menon"
            autoComplete="name"
            required
            disabled={pending}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="contact-email" className="text-sm font-medium text-charcoal">
            Email
          </label>
          <Input
            id="contact-email"
            type="email"
            value={values.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            required
            disabled={pending}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="contact-message" className="text-sm font-medium text-charcoal">
          Message
        </label>
        <Textarea
          id="contact-message"
          value={values.message}
          onChange={(e) => set("message", e.target.value)}
          rows={5}
          placeholder="We're four people looking for somewhere in North Goa over New Year…"
          required
          disabled={pending}
          className="resize-y"
        />
      </div>

      <Button
        type="submit"
        loading={pending}
        disabled={cooldown > 0}
        size="lg"
        className="self-start"
      >
        {cooldown > 0
          ? `Send another in ${cooldown}s`
          : "Send message"}
      </Button>
    </form>
  );
}


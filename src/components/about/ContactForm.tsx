"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import {
  submitContactMessage,
  type ContactField,
  type ContactFormValues,
} from "@/app/about/actions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

/** Seconds the form stays locked after a successful send. */
const COOLDOWN_SECONDS = 30;

const EMPTY: ContactFormValues = { name: "", email: "", message: "" };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Message under a single input. Renders nothing when the field is fine. */
function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;

  return (
    <p
      id={id}
      role="alert"
      className="flex items-start gap-1.5 text-xs font-medium text-destructive"
    >
      <AlertCircle size={13} className="mt-px shrink-0" />
      <span>{message}</span>
    </p>
  );
}

export default function ContactForm() {
  const [values, setValues] = useState<ContactFormValues>(EMPTY);
  /** Failures that belong to one input, shown under it. */
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<ContactField, string>>
  >({});
  /** Failures that don't — a rejected insert, a dropped connection. */
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  /** The address we confirmed to — the form itself is cleared on success. */
  const [sentTo, setSentTo] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [pending, startTransition] = useTransition();

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  const refs: Record<ContactField, React.RefObject<HTMLElement | null>> = {
    name: nameRef,
    email: emailRef,
    message: messageRef,
  };

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((n) => n - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const set = (key: ContactField, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setError(null);
    // The confirmation is about the message that was sent, not the one being
    // typed now — leaving it up makes the next draft look already delivered.
    setSent(false);
    // Clear only this field's error — the others are still true.
    setFieldErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  };

  /** The same rules the Server Action applies, run first so the sender gets
   *  them without a round trip. The action is still the one that decides. */
  const validate = (): Partial<Record<ContactField, string>> => {
    const problems: Partial<Record<ContactField, string>> = {};

    if (!values.name.trim()) problems.name = "Tell us who to reply to.";

    const email = values.email.trim();
    if (!email) problems.email = "We need an email address to reply to.";
    else if (!EMAIL.test(email))
      problems.email = "That email doesn't look right — check for a typo.";

    const message = values.message.trim();
    if (!message)
      problems.message = "Add a message — tell us what you're looking for.";
    else if (message.length < 10)
      problems.message = "Could you add a little more detail? At least a sentence.";

    return problems;
  };

  const showFieldError = (field: ContactField, message: string) => {
    setFieldErrors({ [field]: message });
    refs[field].current?.focus();
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (pending || cooldown > 0) return;

    setError(null);

    const problems = validate();
    const firstInvalid = (["name", "email", "message"] as const).find(
      (field) => problems[field]
    );

    if (firstInvalid) {
      setFieldErrors(problems);
      refs[firstInvalid].current?.focus();
      return;
    }

    setFieldErrors({});

    startTransition(async () => {
      const result = await submitContactMessage(values);

      if (result.success) {
        setSentTo(values.email.trim());
        setValues(EMPTY);
        setSent(true);
        setCooldown(COOLDOWN_SECONDS);
        return;
      }

      if (result.field) {
        showFieldError(result.field, result.error);
        return;
      }

      setError(result.error);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {sent && (
        <div
          role="status"
          className="flex items-start gap-2.5 rounded-xl border border-forest/25 bg-forest/5 px-4 py-3.5 text-sm text-forest font-medium"
        >
          <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
          <span>
            Message sent — thanks! We&apos;ll reply to{" "}
            <span className="text-charcoal">{sentTo}</span> within 24 hours.
          </span>
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
            ref={nameRef}
            id="contact-name"
            value={values.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Rhea Menon"
            autoComplete="name"
            aria-invalid={Boolean(fieldErrors.name)}
            aria-describedby={fieldErrors.name ? "contact-name-error" : undefined}
            required
            disabled={pending}
          />
          <FieldError id="contact-name-error" message={fieldErrors.name} />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="contact-email" className="text-sm font-medium text-charcoal">
            Email
          </label>
          <Input
            ref={emailRef}
            id="contact-email"
            type="email"
            value={values.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={
              fieldErrors.email ? "contact-email-error" : undefined
            }
            required
            disabled={pending}
          />
          <FieldError id="contact-email-error" message={fieldErrors.email} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="contact-message" className="text-sm font-medium text-charcoal">
          Message
        </label>
        <Textarea
          ref={messageRef}
          id="contact-message"
          value={values.message}
          onChange={(e) => set("message", e.target.value)}
          rows={5}
          placeholder="We're four people looking for somewhere in North Goa over New Year…"
          aria-invalid={Boolean(fieldErrors.message)}
          aria-describedby={
            fieldErrors.message ? "contact-message-error" : undefined
          }
          required
          disabled={pending}
          className="resize-y"
        />
        <FieldError id="contact-message-error" message={fieldErrors.message} />
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


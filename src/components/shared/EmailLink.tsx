import { cn } from "@/lib/utils";

/**
 * A displayed email address is only useful if you can act on it, so every
 * address rendered in the UI goes through here rather than being interpolated
 * as bare text.
 *
 * The guard matters: some callers pass a value that is not an address at all.
 * `AdminShell` is handed `user.email ?? "Signed in"`, and a booking or
 * submission row can carry an empty string. Linking those blindly would
 * produce `mailto:Signed in`, so anything that doesn't look like an address
 * falls back to plain text.
 */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function EmailLink({
  email,
  className,
  title,
}: {
  email: string | null | undefined;
  className?: string;
  title?: string;
}) {
  const value = (email ?? "").trim();

  if (!EMAIL_PATTERN.test(value)) {
    return <>{value}</>;
  }

  return (
    <a
      href={`mailto:${value}`}
      title={title}
      // Inherits colour and size from the surrounding text so linking an
      // address doesn't restyle the block it sits in.
      className={cn("cursor-pointer hover:underline", className)}
    >
      {value}
    </a>
  );
}

/**
 * Shared chrome and formatting helpers for every outgoing email.
 *
 * Conventions that email clients force on us and that the templates rely on:
 *   - All CSS is inline. Gmail strips <style> blocks; Outlook ignores most of
 *     what survives.
 *   - Layout is tables, not flex or grid. Outlook's rendering engine is Word.
 *   - Every interpolated value goes through escapeHtml(). Most of them are
 *     typed by guests into a public form.
 */

const FOREST = "#1b4d3e";
const LINEN = "#f6f4f0";
const CHARCOAL = "#2c2c2c";
const SLATE = "#6f6f6f";
const PEBBLE = "#e5e1da";

const FONT_STACK =
  "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

/** Escapes text for interpolation into HTML. Never skip this. */
export function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Escapes a URL for an href.
 *
 * Only http(s) and mailto get through; anything else becomes "#". That stops a
 * `javascript:` or `data:` URL reaching an email client that would honour it.
 */
export function safeUrl(url: string): string {
  return /^(https?:\/\/|mailto:)/i.test(url) ? escapeHtml(url) : "#";
}

export function formatINR(amount: number): string {
  return `₹${Number(amount).toLocaleString("en-IN")}`;
}

export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return escapeHtml(iso);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export interface EmailTemplate {
  subject: string;
  html: string;
}

/** A label/value pair in the details table. Values are escaped here. */
export type DetailRow = [label: string, value: string | number | undefined];

/** Renders label/value pairs as a table. Rows with no value are dropped. */
export function detailTable(rows: DetailRow[]): string {
  const cells = rows
    .filter(([, value]) => value !== undefined && value !== "")
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:9px 0;border-bottom:1px solid ${PEBBLE};font-size:14px;color:${SLATE};vertical-align:top;width:42%;">${escapeHtml(
            label
          )}</td>
          <td style="padding:9px 0;border-bottom:1px solid ${PEBBLE};font-size:14px;color:${CHARCOAL};vertical-align:top;">${escapeHtml(
            value
          )}</td>
        </tr>`
    )
    .join("");

  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:20px 0;border-collapse:collapse;">${cells}</table>`;
}

/** A paragraph of body copy. `text` is escaped. */
export function paragraph(text: string): string {
  return `<p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:${CHARCOAL};">${escapeHtml(
    text
  )}</p>`;
}

/** Muted, smaller paragraph — for caveats and secondary notes. */
export function note(text: string): string {
  return `<p style="margin:0 0 14px;font-size:13px;line-height:1.6;color:${SLATE};">${escapeHtml(
    text
  )}</p>`;
}

/** Free-text a person typed, shown in a tinted block with newlines kept. */
export function quotedBlock(label: string, text: string): string {
  return `
    <div style="margin:20px 0;padding:14px 16px;background-color:${LINEN};border-radius:10px;">
      <p style="margin:0 0 6px;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;color:${SLATE};">${escapeHtml(
        label
      )}</p>
      <p style="margin:0;font-size:14px;line-height:1.6;color:${CHARCOAL};white-space:pre-line;">${escapeHtml(
        text
      )}</p>
    </div>`;
}

/** Primary call-to-action. Table-wrapped so Outlook renders the background. */
export function ctaButton(href: string, label: string): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;">
      <tr>
        <td align="center" bgcolor="${FOREST}" style="border-radius:10px;">
          <a href="${safeUrl(
            href
          )}" style="display:inline-block;padding:13px 26px;font-family:${FONT_STACK};font-size:14px;font-weight:500;color:#ffffff;text-decoration:none;border-radius:10px;">${escapeHtml(
            label
          )}</a>
        </td>
      </tr>
    </table>`;
}

/** Secondary link, rendered inline under the CTA. */
export function secondaryLink(href: string, label: string): string {
  return `<p style="margin:0 0 14px;font-size:14px;line-height:1.6;"><a href="${safeUrl(
    href
  )}" style="color:${FOREST};text-decoration:underline;">${escapeHtml(
    label
  )}</a></p>`;
}

/**
 * Wraps body HTML in the branded shell.
 *
 * `preheader` is the grey line inboxes show next to the subject. It's hidden
 * in the body itself — without one, clients pull whatever text comes first,
 * which is usually the wordmark.
 */
export function emailLayout({
  heading,
  preheader,
  body,
}: {
  heading: string;
  preheader: string;
  body: string;
}): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light" />
    <title>${escapeHtml(heading)}</title>
  </head>
  <body style="margin:0;padding:0;background-color:${LINEN};font-family:${FONT_STACK};">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(
      preheader
    )}</div>

    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${LINEN};padding:28px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:560px;background-color:#ffffff;border-radius:14px;overflow:hidden;">
            <tr>
              <td style="background-color:${FOREST};padding:22px 28px;">
                <span style="font-family:${FONT_STACK};font-size:18px;font-weight:500;color:#ffffff;letter-spacing:-0.01em;">StayVilla</span>
              </td>
            </tr>

            <tr>
              <td style="padding:28px;">
                <h1 style="margin:0 0 18px;font-family:${FONT_STACK};font-size:21px;font-weight:500;line-height:1.3;color:${CHARCOAL};">${escapeHtml(
                  heading
                )}</h1>
                ${body}
              </td>
            </tr>

            <tr>
              <td style="padding:18px 28px;border-top:1px solid ${PEBBLE};">
                <p style="margin:0;font-family:${FONT_STACK};font-size:12px;line-height:1.6;color:${SLATE};">
                  StayVilla — handpicked private villas across India.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

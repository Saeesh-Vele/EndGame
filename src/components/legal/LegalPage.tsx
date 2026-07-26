import { AlertTriangle } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { SITE_CONTACT } from "@/lib/site";

/**
 * Shared chrome for /privacy, /terms, and /cancellation-policy.
 *
 * The bodies are structured placeholders, not legal advice — hence the notice
 * at the top of every one. Kept as data + JSX rather than markdown so there's
 * no renderer dependency for three static pages.
 */

export interface LegalSection {
  heading: string;
  body: string[];
  /** Rendered as a bulleted list under the paragraphs. */
  bullets?: string[];
}

/** Bump when the copy actually changes. */
export const LEGAL_LAST_UPDATED = "26 July 2026";

export default function LegalPage({
  title,
  intro,
  sections,
}: {
  title: string;
  intro: string;
  sections: LegalSection[];
}) {
  return (
    <>
      <Navbar transparent={false} />

      <main className="pt-18">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 py-14 sm:py-20">
          <h1 className="font-display font-normal text-4xl sm:text-5xl text-charcoal leading-[1.1]">
            {title}
          </h1>
          <p className="mt-3 text-sm text-slate">
            Last updated {LEGAL_LAST_UPDATED}
          </p>

          <div className="mt-8 flex items-start gap-3 rounded-2xl border border-driftwood/40 bg-driftwood/10 px-5 py-4">
            <AlertTriangle size={17} className="mt-0.5 shrink-0 text-driftwood" />
            <p className="text-sm text-charcoal leading-relaxed">
              <span className="font-medium">This is a placeholder.</span> The
              structure is right but the wording has not been reviewed by a
              lawyer. Have a legal professional review and adapt it to your
              jurisdiction ({SITE_CONTACT.jurisdiction}) before relying on it.
            </p>
          </div>

          <p className="mt-8 text-slate leading-relaxed">{intro}</p>

          <div className="mt-10 flex flex-col gap-9">
            {sections.map((section, index) => (
              <section key={section.heading}>
                <h2 className="text-base font-medium text-charcoal">
                  {index + 1}. {section.heading}
                </h2>
                {section.body.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="mt-3 text-sm text-slate leading-relaxed"
                  >
                    {paragraph}
                  </p>
                ))}
                {section.bullets && (
                  <ul className="mt-3 flex flex-col gap-2 pl-5 list-disc marker:text-pebble">
                    {section.bullets.map((bullet) => (
                      <li
                        key={bullet}
                        className="text-sm text-slate leading-relaxed"
                      >
                        {bullet}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>

          <div className="mt-12 border-t border-pebble pt-8">
            <h2 className="text-base font-medium text-charcoal">Questions?</h2>
            <p className="mt-2 text-sm text-slate leading-relaxed">
              Write to{" "}
              <a
                href={`mailto:${SITE_CONTACT.email}`}
                className="cursor-pointer text-forest hover:text-forest-light transition-colors duration-200"
              >
                {SITE_CONTACT.email}
              </a>{" "}
              or message us on WhatsApp at {SITE_CONTACT.whatsapp}.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

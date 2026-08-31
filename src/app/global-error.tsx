"use client";

import { useEffect } from "react";

/**
 * Last resort: an error thrown by the root layout itself, which replaces it
 * — so this file brings its own <html>/<body> and can't use the app's fonts,
 * providers, or Tailwind layer. Kept deliberately plain and self-contained.
 */
export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error("[global]", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#faf7f2",
          color: "#2b2b2b",
          fontFamily:
            "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          padding: "2rem 1.25rem",
        }}
      >
        <title>StayVilla is temporarily unavailable</title>
        <main style={{ maxWidth: "26rem", textAlign: "center" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 500, margin: 0 }}>
            StayVilla is temporarily unavailable
          </h1>
          <p
            style={{
              marginTop: "0.75rem",
              fontSize: "0.875rem",
              lineHeight: 1.6,
              color: "#5f5f5f",
            }}
          >
            The site failed to start up. This is on our side — reload in a
            moment, or email saeeshvele@gmail.com if it persists.
          </p>
          <button
            type="button"
            onClick={() => unstable_retry()}
            style={{
              marginTop: "1.5rem",
              cursor: "pointer",
              border: "none",
              borderRadius: "0.75rem",
              backgroundColor: "#1b4d3e",
              color: "#ffffff",
              fontSize: "0.875rem",
              fontWeight: 500,
              padding: "0.75rem 1.5rem",
            }}
          >
            Reload the page
          </button>
          {error.digest && (
            <p
              style={{
                marginTop: "1.5rem",
                fontSize: "0.75rem",
                color: "#8a8a8a",
              }}
            >
              Reference: {error.digest}
            </p>
          )}
        </main>
      </body>
    </html>
  );
}

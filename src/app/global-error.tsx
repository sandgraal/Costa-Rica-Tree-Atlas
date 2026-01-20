"use client";

import { useEffect } from "react";
import { captureException } from "@/lib/sentry";

/**
 * Global Error Handler
 * Catches errors that occur in the root layout or during rendering.
 * This is the last resort error boundary for the entire application.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Send error to Sentry
    captureException(error, {
      tags: {
        boundary: "GlobalError",
        digest: error.digest || "unknown",
      },
      extra: {
        digest: error.digest,
      },
    });
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            fontFamily: "system-ui, sans-serif",
            backgroundColor: "#f5f5f5",
            color: "#1a1a1a",
          }}
        >
          <div
            style={{
              maxWidth: "500px",
              textAlign: "center",
              backgroundColor: "white",
              padding: "2rem",
              borderRadius: "1rem",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            }}
          >
            <div
              style={{
                fontSize: "4rem",
                marginBottom: "1rem",
              }}
            >
              🌲
            </div>
            <h1
              style={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                marginBottom: "1rem",
                color: "#2d5a27",
              }}
            >
              Something went wrong
            </h1>
            <p
              style={{
                color: "#666",
                marginBottom: "1.5rem",
                lineHeight: "1.6",
              }}
            >
              We encountered an unexpected error. Please try again or return to
              the homepage.
            </p>
            <div
              style={{
                display: "flex",
                gap: "1rem",
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={() => reset()}
                style={{
                  backgroundColor: "#2d5a27",
                  color: "white",
                  padding: "0.75rem 1.5rem",
                  borderRadius: "0.5rem",
                  border: "none",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Try Again
              </button>
              <button
                onClick={() => (window.location.href = "/en")}
                style={{
                  backgroundColor: "#e5e5e5",
                  color: "#1a1a1a",
                  padding: "0.75rem 1.5rem",
                  borderRadius: "0.5rem",
                  border: "none",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Go Home
              </button>
            </div>
            {error.digest && (
              <p
                style={{
                  marginTop: "1.5rem",
                  fontSize: "0.75rem",
                  color: "#999",
                }}
              >
                Error ID: {error.digest}
              </p>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}

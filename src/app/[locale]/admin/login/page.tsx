/**
 * Admin Login Page
 *
 * Secure login interface with:
 * - Email/password authentication
 * - 2FA/TOTP support
 * - Client-side validation
 * - Internationalization
 */

"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter as useNextRouter } from "next/navigation";
import { useRouter } from "@i18n/navigation";
import { useTranslations } from "next-intl";

export default function AdminLoginPage() {
  const router = useRouter();
  const nextRouter = useNextRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [showMfa, setShowMfa] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("=== Form submitted ===");
    setError("");
    setLoading(true);

    try {
      console.log("Calling signIn with:", {
        email,
        passwordLength: password.length,
      });

      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
        totpCode: showMfa ? totpCode : undefined,
      });

      console.log("=== Login result ===", result);
      console.log("result.ok:", result?.ok);
      console.log("result.error:", result?.error);
      console.log("result.status:", result?.status);

      if (result?.error) {
        console.log("Has error, setting error state");
        if (result.error === "MFA_REQUIRED") {
          setShowMfa(true);
          setError("Please enter your 2FA code");
        } else {
          setError(`Authentication failed: ${result.error}`);
        }
      } else if (result?.ok) {
        console.log("Login successful, redirecting");
        router.push("/admin/images");
        nextRouter.refresh();
      } else {
        console.log("Neither ok nor error - setting fallback error");
        setError(
          "Login failed. Please check your credentials or contact support."
        );
      }

      console.log("Error state after processing:", error);
    } catch (err) {
      console.error("=== Login exception ===", err);
      setError(
        `An error occurred: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    } finally {
      setLoading(false);
      console.log("=== Login complete, loading:", false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-center text-3xl font-bold text-gray-900 dark:text-white">
            Admin Login
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Costa Rica Tree Atlas Administration
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="rounded-lg bg-white dark:bg-gray-800 shadow-lg p-6 space-y-4">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                disabled={showMfa}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="admin@example.com"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                disabled={showMfa}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="••••••••••••"
              />
            </div>

            {/* MFA Code (shown only if required) */}
            {showMfa && (
              <div>
                <label
                  htmlFor="totpCode"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Two-Factor Authentication Code
                </label>
                <input
                  id="totpCode"
                  name="totpCode"
                  type="text"
                  autoComplete="one-time-code"
                  required
                  value={totpCode}
                  onChange={(e) =>
                    setTotpCode(e.target.value.replace(/\D/g, ""))
                  }
                  maxLength={6}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white text-center text-2xl tracking-widest font-mono"
                  placeholder="000000"
                  autoFocus
                />
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Enter the 6-digit code from your authenticator app
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-800 dark:text-red-200">
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Signing in...
                  </span>
                ) : showMfa ? (
                  "Verify Code"
                ) : (
                  "Sign In"
                )}
              </button>
            </div>

            {/* Back button for MFA */}
            {showMfa && (
              <button
                type="button"
                onClick={() => {
                  setShowMfa(false);
                  setTotpCode("");
                  setError("");
                }}
                className="w-full text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                ← Back to login
              </button>
            )}
          </div>
        </form>

        {/* Security Notice */}
        <div className="text-center text-xs text-gray-500 dark:text-gray-400">
          <p>This is a secure admin area.</p>
          <p>All login attempts are logged and monitored.</p>
        </div>
      </div>
    </div>
  );
}

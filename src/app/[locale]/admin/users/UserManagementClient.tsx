/**
 * User Management Client Component
 *
 * Interactive UI for:
 * - MFA setup/disable
 * - Viewing audit logs
 * - Managing active sessions
 */

"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";

interface User {
  id: string;
  email: string;
  name?: string;
  mfaEnabled: boolean;
  emailVerified: string | null;
  createdAt: string;
  backupCodesRemaining: number;
}

interface AuditLog {
  id: string;
  eventType: string;
  ipAddress: string | null;
  userAgent: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

interface Session {
  id: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  expires: string;
}

interface Props {
  user: User;
  auditLogs: AuditLog[];
  activeSessions: Session[];
}

export function UserManagementClient({
  user,
  auditLogs,
  activeSessions,
}: Props) {
  const [showMfaSetup, setShowMfaSetup] = useState(false);
  const [mfaData, setMfaData] = useState<{
    secret: string;
    qrCodeDataUrl: string;
    backupCodes: string[];
  } | null>(null);
  const [verifyCode, setVerifyCode] = useState("");
  const [disablePassword, setDisablePassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const t = useTranslations("admin.account");

  // Setup MFA
  const handleMfaSetup = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/auth/mfa/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "MFA setup failed");
      }

      setMfaData(data.data);
      setShowMfaSetup(true);
      setSuccess(t("mfaSetupInitiated"));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Verify MFA code
  const handleMfaVerify = async () => {
    if (!verifyCode) {
      setError(t("mfaEnterCode"));
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/mfa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: verifyCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Verification failed");
      }

      setSuccess(t("mfaEnabledSuccess"));
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  // Disable MFA
  const handleMfaDisable = async () => {
    if (!disablePassword) {
      setError(t("mfaEnterPassword"));
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/mfa/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: disablePassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to disable MFA");
      }

      setSuccess(t("mfaDisabledSuccess"));
      setTimeout(() => window.location.reload(), 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to disable MFA");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getEventTypeColor = (eventType: string) => {
    if (eventType.includes("failed")) return "text-red-600 dark:text-red-400";
    if (eventType.includes("enabled") || eventType.includes("login"))
      return "text-green-600 dark:text-green-400";
    return "text-gray-600 dark:text-gray-400";
  };

  return (
    <div className="space-y-6">
      {/* Error/Success Messages */}
      {error && (
        <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}
      {success && (
        <div className="rounded-md bg-green-50 dark:bg-green-900/20 p-4">
          <p className="text-sm text-green-800 dark:text-green-200">
            {success}
          </p>
        </div>
      )}

      {/* User Information Card */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          {t("accountInfo")}
        </h2>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {t("email")}
            </dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-white">
              {user.email}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {t("name")}
            </dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-white">
              {user.name || t("nameNotAvailable")}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {t("accountCreated")}
            </dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-white">
              {formatDate(user.createdAt)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {t("emailVerified")}
            </dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-white">
              {user.emailVerified
                ? formatDate(user.emailVerified)
                : t("notVerified")}
            </dd>
          </div>
        </dl>
      </div>

      {/* MFA Management Card */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          {t("mfaHeading")}
        </h2>

        {!user.mfaEnabled ? (
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {t("mfaDescription")}
            </p>
            <button
              onClick={handleMfaSetup}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? t("mfaSettingUp") : t("mfaEnable")}
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center mb-4">
              <svg
                className="h-5 w-5 text-green-500 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm text-gray-900 dark:text-white font-medium">
                {t("mfaEnabled")}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {t("mfaBackupCodes", { count: user.backupCodesRemaining })}
            </p>
            <div className="mt-4">
              <input
                type="password"
                value={disablePassword}
                onChange={(e) => {
                  setDisablePassword(e.target.value);
                }}
                placeholder={t("mfaDisablePasswordPlaceholder")}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
              />
              <button
                onClick={handleMfaDisable}
                disabled={loading}
                className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? t("mfaDisabling") : t("mfaDisable")}
              </button>
            </div>
          </div>
        )}

        {/* MFA Setup Modal */}
        {showMfaSetup && mfaData && (
          <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              {t("mfaScanQr")}
            </h3>
            <div className="flex flex-col items-center space-y-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={mfaData.qrCodeDataUrl}
                alt={t("mfaQrAlt")}
                className="w-64 h-64 border-4 border-gray-200 dark:border-gray-700 rounded-lg"
              />
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {t("mfaManualEntry")}
                </p>
                <code className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm font-mono">
                  {mfaData.secret}
                </code>
              </div>

              <div className="w-full max-w-md">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("mfaVerificationPrompt")}
                </label>
                <input
                  type="text"
                  value={verifyCode}
                  onChange={(e) => {
                    setVerifyCode(e.target.value.replace(/\D/g, ""));
                  }}
                  maxLength={6}
                  placeholder="000000"
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-center text-2xl font-mono tracking-widest dark:bg-gray-700 dark:text-white"
                />
                <button
                  onClick={handleMfaVerify}
                  disabled={loading || verifyCode.length !== 6}
                  className="mt-2 w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? t("mfaVerifying") : t("mfaVerifyEnable")}
                </button>
              </div>

              <div className="w-full max-w-md bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md">
                <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                  {t("mfaSaveBackupCodes")}
                </h4>
                <p className="text-xs text-yellow-700 dark:text-yellow-300 mb-2">
                  {t("mfaSaveBackupCodesDescription")}
                </p>
                <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                  {mfaData.backupCodes.map((code, idx) => (
                    <div
                      key={idx}
                      className="bg-white dark:bg-gray-800 px-2 py-1 rounded border border-yellow-200 dark:border-yellow-700"
                    >
                      {code}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Active Sessions Card */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          {t("activeSessions", { count: activeSessions.length })}
        </h2>
        {activeSessions.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t("noSessions")}
          </p>
        ) : (
          <div className="space-y-3">
            {activeSessions.map((session) => (
              <div
                key={session.id}
                className="border border-gray-200 dark:border-gray-700 rounded-md p-3"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {session.userAgent || t("unknownDevice")}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {t("ipLabel", {
                        ip: session.ipAddress || t("unknownIp"),
                      })}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t("created", { date: formatDate(session.createdAt) })}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t("expires", { date: formatDate(session.expires) })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <button
          onClick={() => {
            const match = window.location.pathname.match(/^\/(en|es)\//);
            const locale = match ? match[1] : "en";
            signOut({ callbackUrl: `/${locale}/admin/login` });
          }}
          className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          {t("signOutAll")}
        </button>
      </div>

      {/* Audit Log Card */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          {t("recentActivity")}
        </h2>
        {auditLogs.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t("noActivity")}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t("eventHeader")}
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t("ipHeader")}
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t("dateHeader")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {auditLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="px-3 py-3 whitespace-nowrap text-sm">
                      <span className={getEventTypeColor(log.eventType)}>
                        {log.eventType.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {log.ipAddress || "N/A"}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(log.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

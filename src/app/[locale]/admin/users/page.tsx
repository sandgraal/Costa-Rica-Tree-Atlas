/**
 * Admin User Management Page
 *
 * Server component that displays:
 * - User information
 * - MFA status
 * - Recent audit logs
 * - Active sessions
 */

import { getServerSession } from "next-auth";
import { redirect as nextRedirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { UserManagementClient } from "./UserManagementClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "User Management | Admin",
  description: "Manage your account, security settings, and view audit logs",
};

export default async function AdminUsersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Check authentication
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    nextRedirect(`/${locale}/admin/login` as never);
  }

  // Fetch user data with MFA status
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      mfaSecrets: {
        select: {
          backupCodes: true,
          backupCodesUsed: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });

  if (!user) {
    nextRedirect(`/${locale}/admin/login` as never);
  }

  // Fetch recent audit logs (last 50)
  const auditLogs = await prisma.auditLog.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  // Fetch active sessions
  const activeSessions = await prisma.session.findMany({
    where: {
      userId: user.id,
      expires: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  // Calculate backup codes remaining
  const mfaSecret = user.mfaSecrets[0];
  const backupCodesRemaining = mfaSecret
    ? mfaSecret.backupCodes.length - mfaSecret.backupCodesUsed.length
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            User Management
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Manage your account security and view activity logs
          </p>
        </div>

        <UserManagementClient
          user={{
            id: user.id,
            email: user.email,
            name: user.name || undefined,
            mfaEnabled: user.mfaEnabled,
            emailVerified: user.emailVerified?.toISOString() || null,
            createdAt: user.createdAt.toISOString(),
            backupCodesRemaining,
          }}
          auditLogs={auditLogs.map(
            (log: {
              id: string;
              eventType: string;
              ipAddress: string | null;
              userAgent: string | null;
              metadata: unknown;
              createdAt: Date;
            }) => ({
              id: log.id,
              eventType: log.eventType,
              ipAddress: log.ipAddress,
              userAgent: log.userAgent,
              metadata: log.metadata as Record<string, unknown> | null,
              createdAt: log.createdAt.toISOString(),
            })
          )}
          activeSessions={activeSessions.map(
            (session: {
              id: string;
              ipAddress: string | null;
              userAgent: string | null;
              createdAt: Date;
              expires: Date;
            }) => ({
              id: session.id,
              ipAddress: session.ipAddress,
              userAgent: session.userAgent,
              createdAt: session.createdAt.toISOString(),
              expires: session.expires.toISOString(),
            })
          )}
        />
      </div>
    </div>
  );
}

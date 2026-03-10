/**
 * Admin Layout
 *
 * Provides shared navigation sidebar for all admin pages except login.
 * Authentication is enforced by middleware before these pages are reached.
 */

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { AdminNav } from "./AdminNav";
import { AdminLayoutWrapper } from "./AdminLayoutWrapper";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getServerSession(authOptions);

  // If not authenticated, render children bare (login page)
  if (!session?.user?.id) {
    return <>{children}</>;
  }

  // For authenticated admin pages, show sidebar navigation
  return (
    <AdminLayoutWrapper
      nav={<AdminNav locale={locale} userEmail={session.user.email || ""} />}
    >
      {children}
    </AdminLayoutWrapper>
  );
}

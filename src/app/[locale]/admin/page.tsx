/**
 * Admin Root Page
 *
 * Redirects to the admin images dashboard.
 * Authentication is enforced by middleware before this page is reached.
 */

import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminRootPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/admin/images`);
}

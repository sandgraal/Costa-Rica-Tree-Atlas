/**
 * Admin Root Page
 *
 * Redirects to the admin images dashboard.
 * Authentication is enforced by middleware before this page is reached.
 */

import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function AdminRootPage({
  params,
}: {
  params: { locale: string };
}) {
  redirect(`/${params.locale}/admin/images`);
}

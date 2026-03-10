/**
 * Admin Layout Wrapper
 *
 * Client component that provides the admin chrome (sidebar + main area).
 * Used by the admin layout to conditionally wrap authenticated admin pages.
 */

"use client";

export function AdminLayoutWrapper({
  children,
  nav,
}: {
  children: React.ReactNode;
  nav: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {nav}
      <main className="lg:pl-64">
        <div className="py-2">{children}</div>
      </main>
    </div>
  );
}

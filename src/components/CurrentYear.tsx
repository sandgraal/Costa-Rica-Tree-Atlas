/**
 * Server component that displays the current year.
 *
 * Since this value changes yearly and does not need client-side APIs,
 * rendering on the server avoids creating an unnecessary hydration boundary.
 */
export function CurrentYear() {
  return <>{new Date().getFullYear()}</>;
}

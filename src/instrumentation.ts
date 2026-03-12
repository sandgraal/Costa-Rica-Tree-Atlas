/**
 * Next.js Instrumentation Hook
 *
 * Runs once when the Next.js server starts. Used to initialize
 * monitoring hooks that do not require optional runtime dependencies.
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
export async function register() {
  // Keep this hook intentionally side-effect free until a concrete
  // instrumentation provider is installed. This avoids production build
  // warnings from probing optional packages that are not part of the repo.
}

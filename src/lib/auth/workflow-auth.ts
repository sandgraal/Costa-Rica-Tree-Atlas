/**
 * Workflow request authentication.
 *
 * CI workflows (weekly-image-quality) create image proposals without a browser
 * session. They authenticate with a shared secret in the `Authorization` header.
 *
 * This module exists because the previous check was
 * `authHeader?.startsWith("Bearer workflow-")` — which any caller could satisfy
 * by choosing that prefix, bypassing authentication entirely.
 *
 * Fails closed: when `IMAGE_PROPOSALS_WORKFLOW_TOKEN` is unset, no request can
 * authenticate as a workflow.
 */

import { secureCompare } from "./secure-compare";

/**
 * Returns true only when the request carries the configured workflow token.
 *
 * The comparison is constant-time over the whole header value, so neither the
 * token's length nor a shared prefix is observable through response timing.
 */
export async function isAuthenticatedWorkflowRequest(
  authHeader: string | null
): Promise<boolean> {
  const token = process.env.IMAGE_PROPOSALS_WORKFLOW_TOKEN;

  // No token configured → workflow auth is disabled, not permissive.
  if (!token || !authHeader) {
    return false;
  }

  try {
    return await secureCompare(authHeader, `Bearer ${token}`);
  } catch {
    // secureCompare throws on absurdly long input (HashDoS guard).
    return false;
  }
}

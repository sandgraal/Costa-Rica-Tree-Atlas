/**
 * Server-compatible MDX Components Export
 *
 * This file re-exports MDX components in a way that works with server-side
 * MDX compilation. It does NOT have the "use client" directive, allowing
 * the component object to be properly serialized when imported in server components.
 *
 * For components that require client-side features (hooks, event handlers),
 * we import them dynamically from the client module.
 */

import * as mdxClientComponents from "./index";

/**
 * All MDX components for server-side use
 * This object can be safely imported in server components because this file
 * doesn't have "use client" directive.
 */
export const mdxComponents = mdxClientComponents.mdxComponents;

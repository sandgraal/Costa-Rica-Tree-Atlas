/**
 * Shared "does this table exist?" probe for routes that use raw SQL.
 *
 * Six routes each carried their own copy of:
 *
 *   try { await prisma.$queryRaw`SELECT 1 FROM t LIMIT 1`; return true }
 *   catch { return false }
 *
 * which reports *every* failure as "table missing", and the callers then answer
 * `503 Image review system not initialized — run npx prisma migrate dev`. A
 * column-name mismatch, a permissions problem, or a dead connection all look
 * identical to a missing migration from the outside, so a real defect could sit
 * behind a plausible-looking operator message indefinitely.
 *
 * This version only reports `missing` for Postgres 42P01 (undefined_table).
 * Anything else is re-reported through the error tracker and surfaced as an
 * error, not as a setup instruction.
 */

import prisma from "@/lib/prisma";
import { captureException } from "@/lib/error-tracking";

/** Postgres: relation does not exist. */
const UNDEFINED_TABLE = "42P01";

export type TableProbe =
  | { status: "ok" }
  | { status: "missing" }
  | { status: "error"; error: unknown };

function errorCode(error: unknown): string | undefined {
  if (typeof error !== "object" || error === null) return undefined;
  const code = (error as { code?: unknown }).code;
  return typeof code === "string" ? code : undefined;
}

/**
 * Build a TemplateStringsArray from literal SQL chunks.
 *
 * `$queryRaw` is a tagged template: every `${}` is bound as a query PARAMETER,
 * so identifiers and clause keywords cannot be interpolated that way. Passing a
 * hand-built strings array lets a caller place allowlisted SQL (an ORDER BY
 * column, say) in the static portion while user values still bind normally.
 *
 * Every chunk must be trusted, literal SQL. Never build one from user input.
 */
export function sqlTemplate(...chunks: string[]): TemplateStringsArray {
  return Object.assign([...chunks], {
    raw: [...chunks],
  }) as unknown as TemplateStringsArray;
}

/**
 * Probe a table by name.
 *
 * @param table - Literal table identifier. Never pass user input: table names
 *   cannot be bound as query parameters, so this is interpolated. All current
 *   callers pass a hardcoded constant.
 */
export async function probeTable(table: string): Promise<TableProbe> {
  try {
    await (
      prisma as unknown as {
        $queryRaw: (query: TemplateStringsArray) => Promise<unknown>;
      }
    ).$queryRaw(sqlTemplate(`SELECT 1 FROM ${table} LIMIT 1`));
    return { status: "ok" };
  } catch (error) {
    if (errorCode(error) === UNDEFINED_TABLE) {
      return { status: "missing" };
    }

    // Not a missing table — a real fault. Report it rather than disguising it.
    captureException(error, {
      tags: { area: "db", probe: table },
      level: "error",
    });
    return { status: "error", error };
  }
}

/**
 * Backwards-compatible boolean form for call sites that only branch on
 * "usable / not usable". Prefer {@link probeTable} when the caller can give the
 * operator a more accurate message.
 */
export async function tableIsQueryable(table: string): Promise<boolean> {
  return (await probeTable(table)).status === "ok";
}

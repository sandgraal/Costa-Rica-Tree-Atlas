import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";

/**
 * Guards against the schema civil war returning.
 *
 * Two mutually exclusive DDL definitions once existed for the image-review
 * tables — `prisma/migrations/.../init` used camelCase columns while
 * `prisma/manual/add_image_review_system.sql` used snake_case — and roughly ten
 * routes issued raw SQL against the snake_case names. Whichever had been
 * applied, half the code queried columns that did not exist, and every route
 * disguised the failure as "system not initialized".
 *
 * These are static checks over the repo, not database queries, so they run in
 * CI without a connection.
 */

const ROOT = path.resolve(__dirname, "..");
const schema = readFileSync(path.join(ROOT, "prisma/schema.prisma"), "utf8");

/** Models whose columns are addressed by hand-written SQL. */
const RAW_SQL_MODELS = [
  "ImageProposal",
  "ImageVote",
  "ImageAudit",
  "Contribution",
  "TreeRating",
  "ContributorProfile",
  "SearchQuery",
];

function modelBlock(name: string): string {
  const match = schema.match(new RegExp(`model ${name} \\{[\\s\\S]*?\\n\\}`));
  if (!match) throw new Error(`model ${name} not found in schema.prisma`);
  return match[0];
}

function toSnake(field: string): string {
  return field.replace(/(?<!^)(?=[A-Z])/g, "_").toLowerCase();
}

describe("prisma schema column naming", () => {
  it.each(RAW_SQL_MODELS)(
    "%s maps every camelCase scalar field to snake_case",
    (model) => {
      const block = modelBlock(model);
      const unmapped: string[] = [];

      for (const line of block.split("\n").slice(1, -1)) {
        const field = line.match(/^\s+([a-z][A-Za-z0-9]*)\s+(\S+)/);
        if (!field) continue;
        const [, name, type] = field;

        // Relation fields are not columns.
        if (RAW_SQL_MODELS.includes(type.replace(/[?[\]]/g, ""))) continue;
        if (toSnake(name) === name) continue;
        if (line.includes("@map(")) continue;

        unmapped.push(name);
      }

      expect(
        unmapped,
        `${model} has camelCase fields with no @map, which reintroduces the ` +
          `mismatch between the Prisma client and the raw SQL in src/app/api/`
      ).toEqual([]);
    }
  );
});

describe("prisma migration hygiene", () => {
  it("has no out-of-band prisma/manual directory", () => {
    // Scripts applied by hand outside `prisma migrate` are invisible to
    // _prisma_migrations and were the origin of the naming split. Archived to
    // docs/archive/prisma-manual/.
    expect(existsSync(path.join(ROOT, "prisma/manual"))).toBe(false);
  });

  it("creates the search_queries table that the SearchQuery model declares", () => {
    // `model SearchQuery` existed with no CREATE TABLE in any migration, so
    // POST /api/search-analytics returned { ok: true } and discarded every
    // write.
    const dir = path.join(ROOT, "prisma/migrations");
    const sql = readdirSync(dir)
      .filter((entry) => existsSync(path.join(dir, entry, "migration.sql")))
      .map((entry) =>
        readFileSync(path.join(dir, entry, "migration.sql"), "utf8")
      )
      .join("\n");

    expect(sql).toMatch(/CREATE TABLE (IF NOT EXISTS )?"search_queries"/);
  });
});

describe("raw SQL column references", () => {
  it("uses snake_case identifiers, not camelCase", () => {
    // src/app/api/images/upload/route.ts was the lone route quoting camelCase
    // identifiers ("treeSlug", "createdAt") while every sibling used
    // snake_case. At most one of those could work against a given database.
    const apiDir = path.join(ROOT, "src/app/api");

    const walk = (dir: string): string[] =>
      readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) return walk(full);
        return entry.name === "route.ts" ? [full] : [];
      });

    // Scan only the SQL text, not the surrounding TypeScript: a quoted
    // camelCase string in an OpenAPI document or a formData key is not a column.
    const SQL_KEYWORDS =
      /\b(SELECT|INSERT\s+INTO|UPDATE|DELETE\s+FROM|FROM|WHERE|SET|VALUES|JOIN|ORDER\s+BY)\b/i;

    const offenders: string[] = [];
    for (const file of walk(apiDir)) {
      const source = readFileSync(file, "utf8");

      // Template literals containing SQL keywords, i.e. the $queryRaw /
      // $executeRaw bodies and the sqlTemplate() chunks.
      for (const [block] of source.matchAll(/`[^`]*`/g)) {
        if (!SQL_KEYWORDS.test(block)) continue;

        for (const [, ident] of block.matchAll(/"([a-z]+[A-Z][A-Za-z]*)"/g)) {
          // `col as "camelCase"` shapes the result for JS and is correct;
          // only bare quoted identifiers are column references.
          if (new RegExp(`as\\s+"${ident}"`).test(block)) continue;
          offenders.push(`${path.relative(ROOT, file)}: "${ident}"`);
        }
      }
    }

    expect(offenders).toEqual([]);
  });
});

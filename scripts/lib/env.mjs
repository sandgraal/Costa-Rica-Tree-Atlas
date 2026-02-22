/**
 * Shared env-file loader for admin scripts.
 *
 * Reads .env and .env.local, merging both so that values present only in
 * one file are still available even when the other file exists.  .env.local
 * values take precedence over .env values (standard dotenv behaviour).
 */

import { readFileSync } from "fs";

/**
 * Parse a single env file into a plain key/value object.
 * Returns an empty object when the file does not exist.
 */
function parseEnvFile(file) {
  try {
    const result = {};
    for (const rawLine of readFileSync(file, "utf8").split("\n")) {
      const line = rawLine.trim();
      // Skip empty lines and comments
      if (!line || line.startsWith("#") || !line.includes("=")) continue;
      const i = line.indexOf("=");
      const key = line.slice(0, i).trim();
      let value = line.slice(i + 1).trim();
      // Strip matching surrounding quotes (single, double, or backtick)
      const quoteMatch = value.match(/^(['"`])([\s\S]*)\1$/);
      if (quoteMatch) {
        value = quoteMatch[2];
      } else {
        // Strip inline comments from unquoted values (e.g. KEY=value # comment)
        const commentIdx = value.indexOf(" #");
        if (commentIdx !== -1) value = value.slice(0, commentIdx).trim();
      }
      result[key] = value;
    }
    return result;
  } catch (e) {
    if (e && typeof e === "object" && "code" in e && e.code === "ENOENT") {
      return {};
    }
    throw e;
  }
}

/**
 * Load environment variables from .env and .env.local, merging both files.
 * Values from .env.local override values from .env.
 * Returns a plain object; does NOT mutate process.env.
 */
export function loadEnv() {
  const env = {};
  for (const file of [".env", ".env.local"]) {
    Object.assign(env, parseEnvFile(file));
  }
  return env;
}

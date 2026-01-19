/**
 * Commitlint configuration for conventional commits
 * @see https://commitlint.js.org/#/
 */
module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // Type must be one of the following
    "type-enum": [
      2,
      "always",
      [
        "feat", // New feature
        "fix", // Bug fix
        "docs", // Documentation changes
        "style", // Code style (formatting, semicolons, etc.)
        "refactor", // Code refactoring
        "perf", // Performance improvements
        "test", // Adding or updating tests
        "build", // Build system or dependencies
        "ci", // CI/CD changes
        "chore", // Other changes (maintenance)
        "revert", // Reverting changes
        "content", // Content updates (MDX, translations)
      ],
    ],
    // Subject (commit description) rules
    "subject-case": [2, "always", "lower-case"],
    "subject-empty": [2, "never"],
    "subject-full-stop": [2, "never", "."],
    // Type rules
    "type-case": [2, "always", "lower-case"],
    "type-empty": [2, "never"],
    // Header (first line) max length
    "header-max-length": [2, "always", 100],
  },
};

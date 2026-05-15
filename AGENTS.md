# AGENTS.md — Agent Hub

> **Read [CLAUDE.md](CLAUDE.md) first.** It is the canonical agent
> operating guide and is kept up to date as Master Plan v6.0 evolves.

## Agent guide files in this repo

Different tools look for different filenames. This page lists them all
and explains which is the source of truth.

| File                                                               | For                           | Status                                                        |
| ------------------------------------------------------------------ | ----------------------------- | ------------------------------------------------------------- |
| [CLAUDE.md](CLAUDE.md) (root)                                      | Claude Code                   | **Canonical** — start here                                    |
| [content/CLAUDE.md](content/CLAUDE.md)                             | Claude Code                   | Scoped: content authoring                                     |
| [scripts/CLAUDE.md](scripts/CLAUDE.md)                             | Claude Code                   | Scoped: utility scripts                                       |
| [src/components/CLAUDE.md](src/components/CLAUDE.md)               | Claude Code                   | Scoped: components                                            |
| [tests/CLAUDE.md](tests/CLAUDE.md)                                 | Claude Code                   | Scoped: test suite                                            |
| [.github/copilot-instructions.md](.github/copilot-instructions.md) | GitHub Copilot                | Mostly aligned with CLAUDE.md; CLAUDE.md wins on conflict     |
| [.github/instructions/\*.instructions.md](.github/instructions/)   | Copilot (file-pattern-scoped) | File-pattern guidance; CLAUDE.md owns the cross-cutting rules |

## Why we have a hierarchy

The root `CLAUDE.md` is short (~200 lines) and high-signal: mission,
stack, hard rules, where to start. It's loaded into every Claude Code
session automatically.

Scoped `CLAUDE.md` files in subdirectories activate when the agent is
working in that area. They cover conventions that would clutter the
root file (test family map, image-script categories, server vs client
component rules).

`.github/instructions/*.instructions.md` files are file-pattern-scoped
guidance for GitHub Copilot. They predate the Claude Code hierarchy
and cover similar ground. Where they conflict with `CLAUDE.md`,
`CLAUDE.md` wins.

## .claude/ directory

Programmatic agent configuration:

- [.claude/settings.json](.claude/settings.json) — permission
  allowlist tuned for unattended Claude Code runs
- [.claude/skills/](.claude/skills/) — reusable agent SOPs
  (`add-species`, `remediate-tree`, `audit-iucn`)
- [.claude/agents/](.claude/agents/) — specialized subagents
  (`iucn-verifier`, `content-validator`, `spanish-copyeditor`)

The worktree directory (`.claude/worktrees/`) is gitignored.

## MCP servers

[.mcp.json](.mcp.json) configures Model Context Protocol servers for
external data sources: GBIF, IUCN, POWO, iNaturalist. Some require
tokens in `.env.local` (`IUCN_TOKEN`).

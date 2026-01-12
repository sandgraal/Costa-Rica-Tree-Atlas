# Security Setup Guide

**Last Updated:** 2026-01-12  
**Status:** ✅ Active - Multiple automated security scanners

## Automated Security Checks

This repository uses comprehensive automated security scanning:

### 1. Dependabot

- **Weekly scans** for vulnerable dependencies
- **Automatic PRs** for security updates
- **Grouped updates** for easier review

### 2. CodeQL Analysis

- **Static analysis** on every push/PR
- **Security queries** to detect vulnerabilities
- **Quality checks** for code patterns

### 3. Secret Scanning

- **TruffleHog** scans for committed secrets
- **Pre-commit hooks** prevent accidental commits
- **Verified secrets** flagged immediately

### 4. ESLint Security Rules

- **Security anti-patterns** detected
- **No hardcoded secrets** enforcement
- **React security** best practices

### 5. License Compliance

- **Dependency licenses** checked
- **GPL licenses** blocked
- **Legal compliance** ensured

## Setup Instructions

### Enable GitHub Security Features

1. Go to: **Settings → Security & analysis**
2. Enable:
   - ✅ Dependency graph
   - ✅ Dependabot alerts
   - ✅ Dependabot security updates
   - ✅ Secret scanning
   - ✅ Secret scanning push protection
   - ✅ Code scanning (CodeQL)

### Configure Branch Protection

1. Go to: **Settings → Branches → Branch protection rules**
2. Add rule for `main`:
   - ✅ Require status checks before merging
   - ✅ Require "Security Checks" workflow to pass
   - ✅ Require "CodeQL" workflow to pass
   - ✅ Require branches to be up to date

### Local Development

Install pre-commit hooks:

```bash
npm install
npm run prepare
```

## Monitoring

### Weekly Tasks

- Review Dependabot PRs
- Check CodeQL findings
- Verify secret scan results

### Monthly Tasks

- Review security workflow results
- Update security documentation
- Audit dependencies manually

## Security Badges

Add to README.md:

```markdown
[![Security Checks](https://github.com/sandgraal/Costa-Rica-Tree-Atlas/workflows/Security%20Checks/badge.svg)](https://github.com/sandgraal/Costa-Rica-Tree-Atlas/actions)
[![CodeQL](https://github.com/sandgraal/Costa-Rica-Tree-Atlas/workflows/CodeQL/badge.svg)](https://github.com/sandgraal/Costa-Rica-Tree-Atlas/security/code-scanning)
```

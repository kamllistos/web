---
title: CodeQL (SAST)
description: Static application security testing that reads the code and flags security bugs before they ship.
order: 3
updated: 2026-10-17
---

## What it is

**SAST (Static Application Security Testing)** analyzes source code *without running it*, looking for patterns that lead to vulnerabilities: injection, unsafe data flows, insecure configurations. **CodeQL** is GitHub's SAST engine. It turns code into a database and runs security queries against it.

## How it's set up here

- **What it scans:** the JavaScript/TypeScript that powers the site, the [REST API](/docs/rest-api/), the build checks, and the GitHub Actions workflow files.
- **Query pack:** `security-extended`, which covers more security issues than the default set.
- **When it runs:** on every push to `main`, on every pull request, and weekly (to catch newly written queries for old code).
- **Config:** [`.github/workflows/codeql.yml`](https://github.com/camtoan-do/kamllistos/blob/main/.github/workflows/codeql.yml).

## Where results go

Findings appear in the repository's **Security → Code scanning** tab, each with the affected line, an explanation and a suggested fix. On pull requests, findings show up inline before the change is merged.

## How findings are handled

1. **Triage:** is it real and reachable? Trace the data from where it enters to where it's used.
2. **Fix** in a normal commit, so it shows on the [changelog](/changelog/).
3. **Dismiss with a reason** if it's a false positive. Dismissals are recorded, not hidden.

## Limits (honestly)

SAST finds *patterns* in code. It doesn't test the running site. That's why it's paired with live checks on the deployed site and contract tests against the [API](/docs/rest-api/).

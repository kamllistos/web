---
title: Git & GitHub
description: How the code is stored, versioned and protected, and how every change becomes the public changelog.
order: 1
updated: 2026-10-17
---

## What it is

**Git** records every change to the site as a *commit*: what changed, when, and why. **GitHub** hosts that history online. The repository is public, so anyone can review exactly how the site is built: [github.com/kamllistos/kamllistos](https://github.com/kamllistos/kamllistos).

## How it's used here

- **`main` is production.** Every push to `main` is checked automatically (see [GitHub Actions](/docs/github-actions/)) and then deployed to Cloudflare.
- **One change, one commit.** Each commit message describes a single change in plain English. That message is published on the [changelog](/changelog/), so it's written for people, not just machines.
- **The changelog is generated, not hand-written.** At build time the site reads the commit history through GitHub's public REST API, falling back to the local Git history. The newest commit date also powers the "days since last update" badge in the footer.

## How it's kept secure

| Control | Why it matters |
| --- | --- |
| **No secrets in the repository** | Nothing in the code needs a password or API key. The few credentials that exist (for example the status page's token) live in GitHub's encrypted *Actions secrets* and are never printed or committed. |
| **Secret scanning & push protection** | GitHub scans public repositories for leaked credentials and can block a push that contains one. |
| **Dependency alerts** | [Dependabot](/docs/dependabot/) watches every library the site uses. |
| **Code scanning** | [CodeQL](/docs/codeql/) analyzes every change for security bugs. |
| **Least-privilege tokens** | Tokens are fine-grained, limited to a single repository and only the permissions they need. |
| **Public history** | Every change is attributable and reviewable, which is the opposite of security through obscurity. |

## What's intentionally not documented

Account IDs, internal dashboards, token values and recovery details stay private. Publishing *how* controls work is useful; publishing the keys to them is not.

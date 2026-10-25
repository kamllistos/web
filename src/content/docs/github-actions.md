---
title: GitHub Actions
description: The automated checks that run on every change and every hour, and how the workflows themselves are locked down.
order: 2
updated: 2026-10-17
---

## What it is

**GitHub Actions** runs scripts automatically on GitHub's servers (Ubuntu Linux) when something happens, such as a push, a pull request or a schedule. Each set of steps is a *workflow*, defined in a file under [`.github/workflows/`](https://github.com/camtoan-do/kamllistos/tree/main/.github/workflows).

## The workflows

| Workflow | When | What it does |
| --- | --- | --- |
| **CI** | Every push and pull request | Installs dependencies, builds the site, then runs `check-build.mjs`: no inline code the security policy would block, no broken links, `security.txt` not expiring, only a *public* PGP key published, security headers file present. |
| **Live checks** | Hourly, after each deploy, or on demand | Tests the real site from the outside: uptime, HTTPS and redirects, security headers, TLS certificate expiry, email DNS records (SPF, DKIM, DMARC), then runs the [Postman API tests](/docs/rest-api/). A failure emails the owner. |
| **CodeQL** | Every push to `main`, pull requests, weekly | Static security analysis. See [CodeQL](/docs/codeql/). |
| **Status page** | Every 5 minutes (separate repo) | [status.camtoan.me](https://status.camtoan.me) records uptime and response time, and opens an issue automatically during an outage. |

Results are public on the [Actions tab](https://github.com/camtoan-do/kamllistos/actions).

## How the workflows are secured

- **Least privilege.** Each workflow declares `permissions: contents: read` and only adds what it truly needs. For example, CodeQL may write security results and nothing else.
- **No script injection.** User-controlled values (like the URL input on a manual run) are passed through environment variables, never pasted directly into shell commands. This is the most common way GitHub workflows get hijacked.
- **No secrets needed.** The site's workflows run without any stored credentials.
- **Kept up to date.** [Dependabot](/docs/dependabot/) opens pull requests when an action has a new version, and CodeQL also scans the workflow files themselves.

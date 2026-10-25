---
title: OWASP Top 10
description: How this site and its API map to the OWASP Top 10 web application security risks (2025 edition).
order: 6
updated: 2026-10-17
---

## What it is

The **OWASP Top 10** is the most widely used list of the biggest security risks for web applications, published by the nonprofit Open Worldwide Application Security Project. Below is each risk in the 2025 edition, and how kamllistos.com handles it, including where it simply doesn't apply.

| Risk | How it's handled here |
| --- | --- |
| **A01 Broken Access Control** | There's nothing behind a login: no accounts, no admin panel, no private data on the server. The [API](/docs/rest-api/) is read-only and serves only public data. Server-side request forgery (SSRF), now part of this category, is avoided: the API never fetches URLs supplied by visitors. |
| **A02 Security Misconfiguration** | Strict security headers on every page (Content-Security-Policy with no inline code, HSTS, `X-Frame-Options: DENY`, `nosniff`, Referrer and Permissions policies), checked on every build and every hour on the live site. |
| **A03 Software Supply Chain Failures** | Very few dependencies, [Dependabot](/docs/dependabot/) alerts and updates, a lockfile so builds use exact versions, and GitHub Actions kept up to date. |
| **A04 Cryptographic Failures** | HTTPS everywhere with HSTS. The TLS certificate's validity is monitored hourly. Email is signed (DKIM), and sensitive reports can be encrypted with the [published PGP key](/security). |
| **A05 Injection** | No database and no server-side HTML from user input. API input is validated and only ever compared against data, never executed. The CSP blocks injected scripts, and workflow inputs are passed safely to avoid command injection in CI. |
| **A06 Insecure Design** | Secure by design: a static site with the smallest possible attack surface, and a public API designed read-only from the start. |
| **A07 Authentication Failures** | No logins on the site. The accounts that run it (GitHub, Cloudflare, domain, email) use multi-factor authentication and least-privilege tokens. |
| **A08 Software or Data Integrity Failures** | Every deploy comes from reviewed, public Git history through automated checks. No third-party scripts load in visitors' browsers. |
| **A09 Security Logging & Alerting Failures** | Hourly live checks and a [status page](https://status.camtoan.me) with automatic incident issues; failures email the owner. (A full SIEM is out of scope for a static site.) |
| **A10 Mishandling of Exceptional Conditions** | The API catches every error and returns a safe, generic message without stack traces. The build degrades gracefully if Substack or GitHub is unreachable instead of failing open. |

## Verify it yourself

- Headers: [securityheaders.com](https://securityheaders.com/?q=kamllistos.com&followRedirects=on) · [Mozilla Observatory](https://developer.mozilla.org/en-US/observatory/analyze?host=kamllistos.com)
- TLS: [SSL Labs](https://www.ssllabs.com/ssltest/analyze.html?d=kamllistos.com)
- Code: [public repository](https://github.com/camtoan-do/kamllistos)

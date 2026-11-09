---
title: Data security
description: How information is protected, and the honest limits.
order: 10
status: in-effect
updated: 2026-11-09
---

## The main control: hold very little

The site is static. There's no database, no login and no server of mine to break into, so there's very little to steal. Data that isn't collected can't leak.

## What's in place

- **Encryption in transit.** HTTPS everywhere, enforced with HSTS.
- **Strict browser protections.** A Content-Security-Policy that allows no inline code and no third-party scripts, plus anti-framing and related headers.
- **Checked automatically.** Every change is built and scanned before it ships ([CodeQL](/docs/codeql/), [Dependabot](/docs/dependabot/)). The live site, headers, certificate and email records are tested every hour.
- **No secrets in the code.** Keys and tokens live in the providers' secret stores, never in the repository.
- **Email.** Hosted on Proton Mail, with SPF, DKIM and DMARC on the domain to make spoofing harder. A [PGP key](/pgp.asc) is published for sensitive messages.
- **Accounts behind the site** are protected with multi-factor authentication.

More detail: [Docs](/docs/), [OWASP Top 10 mapping](/docs/owasp-top-10/), and the [stack](/stack/). Found a problem? See the [disclosure policy](/security).

## Honest limits

No system is perfectly secure. I'm one person, not a 24/7 security team. Email is only end-to-end encrypted if you use PGP or also use Proton. If something does go wrong, the [breach procedure](/legal/data-breach-procedure/) applies.

## If this changes

If the site ever stores personal data itself, these are required before launch: encryption at rest, least-privilege access, password hashing or passwordless login, audit logs, tested backups, and a fresh pass through the [security feature database](/) on the home page.

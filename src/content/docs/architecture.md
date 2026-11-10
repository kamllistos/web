---
title: Architecture
description: How this site is put together, from a change in Git to a page in your browser.
order: 0
updated: 2026-11-09
---

## The big picture

kamllistos.com is a **static site**. Every page is built ahead of time into plain files. There's no database, no login and no server of mine to break into. The only code that runs when you visit is a small read-only API.

```
 Write          Build & check              Serve                    Visit
┌────────┐    ┌──────────────────┐    ┌──────────────────┐    ┌───────────────┐
│ GitHub │───▶│ GitHub Actions   │    │ Cloudflare       │───▶│ Your browser  │
│ (main) │    │ build · checks   │    │ Workers          │    │ kamllistos.com│
└───┬────┘    │ CodeQL scan      │    │ static files     │    └───────────────┘
    │         └──────────────────┘    │ + /api (read-only)│            ▲
    │                                 └──────────────────┘            │
    └────────── push to main ────────────────▲                        │
                                             │                        │
              Live checks: every hour and after each deploy ──────────┘
```

## What happens when the site changes

1. **A change is committed** to the [repository](https://github.com/kamllistos/web). The commit message becomes an entry on the [changelog](/changelog/).
2. **GitHub Actions builds the site** and runs the build checks: no inline code that the security policy would block, no broken links, a valid `security.txt`, all legal pages present. [CodeQL](/docs/codeql/) scans the code.
3. **Cloudflare builds and deploys** what's on `main` to its worldwide network.
4. **Live checks run** against the real site: it's up, HTTPS and security headers are right, key pages load, the certificate is valid, email records are intact. They run again every hour.

## The parts

| Part | What it does | Where it lives |
| --- | --- | --- |
| Pages | Astro turns text and data into plain HTML and CSS at build time | `src/pages/`, `src/layouts/` |
| Site text | Names, headline and contact details | `src/site.ts` |
| Security feature database | The data behind the search page and the glossary pages | `src/db.json` |
| Docs and legal pages | Written in Markdown | `src/content/docs/`, `src/content/legal/` |
| Changelog | Generated from the Git history | `src/changelog.ts` |
| REST API | Read-only JSON on `/api`, answering GET requests only | `worker/index.ts` |
| Security headers | Content-Security-Policy, HSTS and the rest | `public/_headers` |
| Browser scripts | Search, theme toggle, small page behaviours. No third-party scripts. | `public/*.js` |

## What sits around the site

| Service | Role |
| --- | --- |
| GitHub | Code, history, build checks, code scanning, dependency updates |
| Cloudflare | Hosting, DNS and the domain registration for kamllistos.com |
| Proton Mail | Email, with SPF, DKIM and DMARC on the domain |
| Upptime | The [status page](https://status.camtoan.me), which checks uptime every 5 minutes |
| camtoan.me | The owner's personal site, a separate repo on GitHub Pages. The blog and services pages live there; old `/blog` and `/services` links redirect to them. |
| Gumroad | Checkout for products. Payments never touch this site. |

Each one is labelled honestly on the [stack](/stack/) page. What each can see about visitors is on [Third-party disclosure](/legal/third-party-disclosure/).

## The legal layer

The site is run from Alberta, Canada, so it's built to Canadian law first. Nothing can stop someone from filing a claim, so the aim is to give them very little to claim about. It works in layers, strongest first:

| Layer | What it does | Where |
| --- | --- | --- |
| 1. Collect almost nothing | Data that doesn't exist can't be leaked, misused or demanded | The static design above |
| 2. Say only what's true | The [legal pages](/legal/) describe what the site really does. No promises the code doesn't keep. | `src/content/legal/` |
| 3. Set the terms of use | General information only, no warranty, a liability limit, permitted-testing rule, Alberta law | [Terms & conditions](/legal/terms/) |
| 4. Tripwires | The build fails if a form, cookie or third-party embed appears before the legal pages are updated | `scripts/check-build.mjs` |
| 5. Written agreements | Paid services are scoped and agreed in writing before work starts, including permission to access a client's systems | Per engagement, not on this site |
| 6. Outside the site | Business structure and insurance decide what's actually at risk if a claim succeeds | The owner's decision, with a lawyer and broker |

### The Canadian rules behind it

| Area | Law | What it asks for | Page |
| --- | --- | --- | --- |
| Privacy | Alberta PIPA, federal PIPEDA | A named contact, a stated purpose, consent, access within 30 days, notice when providers outside Canada are used | [Privacy policy](/legal/privacy-policy/), [Third-party disclosure](/legal/third-party-disclosure/) |
| Breaches | PIPA, PIPEDA | Notify people and the regulator where there's a real risk of significant harm; keep breach records 24 months | [Data breach procedure](/legal/data-breach-procedure/) |
| Email marketing | CASL | Opt-in consent, sender identity, working unsubscribe honoured within 10 business days | [Marketing consent](/legal/marketing-consent/) |
| Selling online | Provincial consumer protection laws, Competition Act | Clear price and terms before payment, no hidden fees, no misleading claims | [Payments & subscriptions](/legal/payments-subscriptions/) |
| Liability | Contract law | Limits are respected when they're clear, agreed and fair. Consumer rights can't be signed away. | [Terms & conditions](/legal/terms/) |
| Security work | Criminal Code s. 342.1 | Never touch a system without the owner's written permission | [Terms & conditions](/legal/terms/), [Disclosure policy](/security) |
| Copyright | Copyright Act | Own or license everything published; respond to infringement notices | [Intellectual property](/legal/intellectual-property/), [Open-source licences](/legal/open-source-licenses/) |

The same approach is packaged as a reusable skill for other apps: [vibecode-security-skill](https://github.com/camtoan-do/vibecode-security-skill). Canada is covered; the United States and European Union are underway.

**Honest limit:** these pages were written in plain English and have not been reviewed by a lawyer. They reduce risk. They don't remove it.

## Why it's built this way

- **Less to attack.** No database, accounts or server-side forms means whole classes of attack don't apply. See the [OWASP Top 10 mapping](/docs/owasp-top-10/).
- **Nothing ships unchecked.** A change that breaks a rule fails the build before it reaches the site.
- **Everything is verifiable.** The code, the checks and their results are public.
- **Cheap to run.** The only costs are the domain and email.

## Limits (honestly)

A static site can't do everything. Anything that needs to store data, such as accounts, forms or payments, would need new parts, and the [legal pages](/legal/) set out what has to happen first.

## What's intentionally not documented

Account IDs, tokens, keys and dashboard settings. They live in the providers' secret stores, not here.

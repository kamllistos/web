# Kamllistos

[![CI](https://github.com/camtoan-do/kamllistos/actions/workflows/ci.yml/badge.svg)](https://github.com/camtoan-do/kamllistos/actions/workflows/ci.yml)
[![Live checks](https://github.com/camtoan-do/kamllistos/actions/workflows/live.yml/badge.svg)](https://github.com/camtoan-do/kamllistos/actions/workflows/live.yml)
[![Status](https://img.shields.io/badge/status-status.camtoan.me-brightgreen)](https://status.camtoan.me)

The personal website of **Cam Toan Do**, cybersecurity coordinator. It offers practical security help for small businesses and individuals.

**Live:** https://kamllistos.com

The site itself is a small portfolio project. It's a static site hardened like production infrastructure, and you can check every claim it makes.

## Architecture

```
GitHub (main) ──push──▶ Cloudflare Workers build (Astro) ──▶ Cloudflare edge ──▶ https://kamllistos.com
     │                                                                   ▲
     ├── CI: build + checks on every push / PR                           │
     └── Live checks: every hour + after each deploy ────────────────────┘
DNS: Cloudflare (domain registered at Namecheap)   ·   Email: Proton Mail (SPF, DKIM, DMARC)
```

| Layer | Choice | Why |
| --- | --- | --- |
| Framework | [Astro](https://astro.build) | Ships plain HTML/CSS, with no JavaScript runtime needed |
| Hosting | Cloudflare Workers static assets (free) | Deploys on git push, global edge network, unlimited traffic |
| DNS | Cloudflare | Fast DNS; domain registered at Namecheap |
| Email | Proton Mail | Custom domain, built-in PGP |
| Writing | Substack | Posts are pulled from the RSS feed at build time into [/blog](https://kamllistos.com/blog/) |

## Security

- **Small attack surface.** There's no server, database, login or third-party script.
- **Strict headers** ([`public/_headers`](public/_headers)): a `Content-Security-Policy` (`default-src 'self'`) that allows no inline code, HSTS, `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy` and `Permissions-Policy`.
- **Responsible disclosure:** [`/security`](https://kamllistos.com/security) and [`security.txt`](https://kamllistos.com/.well-known/security.txt) (RFC 9116).
- **Encrypted contact:** [PGP key](https://kamllistos.com/pgp.asc), fingerprint `9083 9B9E C1CD 87EB C933 EB78 49A2 57EE 9CAE 466F`.
- **Email anti-spoofing:** SPF, DKIM and DMARC are set on the domain.

You can verify these yourself: [securityheaders.com](https://securityheaders.com/?q=kamllistos.com&followRedirects=on) · [Mozilla Observatory](https://developer.mozilla.org/en-US/observatory/analyze?host=kamllistos.com) · [SSL Labs](https://www.ssllabs.com/ssltest/analyze.html?d=kamllistos.com)

## Reliability checks

| Workflow | When | What it checks |
| --- | --- | --- |
| [CI](.github/workflows/ci.yml) → [`check-build.mjs`](scripts/check-build.mjs) | Every push and PR | Site builds · no inline code that the CSP would block · no broken internal links · `security.txt` isn't near expiry · only a *public* PGP key is published |
| [Live checks](.github/workflows/live.yml) → [`check-live.mjs`](scripts/check-live.mjs) | Hourly and after each deploy | Site is up · HTTP→HTTPS and www→apex redirects · all security headers present · key pages reachable · TLS certificate valid for 14+ days · email DNS (MX, SPF, DKIM, DMARC) and status-page records intact |

Each live run writes a results table to its run summary on the [Actions tab](https://github.com/camtoan-do/kamllistos/actions/workflows/live.yml). A failed run emails the owner.

**Status page:** [status.camtoan.me](https://status.camtoan.me) shows uptime history and response times. It's built with [Upptime](https://upptime.js.org) in [camtoan-do/status](https://github.com/camtoan-do/status). It checks every 5 minutes, and outages open and close GitHub issues automatically.

## Docs, API & changelog

- **Public docs:** [kamllistos.com/docs](https://kamllistos.com/docs/) — Git & GitHub, GitHub Actions, CodeQL, Dependabot, REST API & Postman, OWASP Top 10.
- **Stack:** [kamllistos.com/stack](https://kamllistos.com/stack/) — every tool, honestly labelled in use / planned / lab.
- **REST API:** read-only JSON on [`/api`](https://kamllistos.com/api) ([`worker/index.ts`](worker/index.ts)), described by [`openapi.json`](public/openapi.json) and tested hourly with the [Postman collection](public/postman/kamllistos-api.postman_collection.json).
- **Changelog:** [kamllistos.com/changelog](https://kamllistos.com/changelog/), generated from this repo's commit history.

## Project structure

```
src/site.ts              ← all the text on the site (edit this)
src/content/blog/        ← blog posts (one Markdown file each)
src/pages/               ← pages: home, about (incl. certifications), blog, security
src/timeline.ts          ← the About page timeline (edit this)
src/layouts/Base.astro   ← shared layout (nav, footer)
src/styles.css           ← design
public/                  ← files served as-is (security.txt, pgp.asc, favicon)
scripts/                 ← build and live checks
public/_headers          ← security headers
wrangler.jsonc           ← Cloudflare Workers config
```

## Run it locally

Requires Node.js 22+.

```bash
npm install
npm run dev            # http://localhost:4321
npm run build          # outputs to dist/
npm run check:build    # run the CI checks on dist/
npm run check:live     # check the live site
```

## Editing

- **Change text:** edit `src/site.ts`.
- **New blog post:** add a `.md` file to `src/content/blog/` with a `title`, `description` and `date`.

Pushing to `main` deploys automatically.

## Roadmap

- [x] Public status page with uptime history
- [ ] Manage Cloudflare DNS and Workers settings with Terraform
- [ ] Define and publish an availability SLO

## Contact

[official@camtoan.me](mailto:official@camtoan.me) · Found a security issue? See [/security](https://kamllistos.com/security).

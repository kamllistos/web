# Kamllistos (kamllistos.com) — project notes

Personal site + security side hustle for Cam Toan Do (Cybersecurity Coordinator, Calgary).
Owner has no coding background: explain plainly, keep things simple, be honest.

## Stack (all free except domain + Proton)
- Astro static site → Cloudflare Workers static assets (`wrangler.jsonc`), deploys on push to `main`.
- Domains: **kamllistos.com** = this site (the business). **camtoan.me** = owner's personal site, hosted on GitHub Pages from camtoan-do/website (not this Worker); also keeps email + status page.
- Public read-only REST API on `/api/*` (`worker/index.ts`, GET only). Spec `public/openapi.json`; Postman collection `public/postman/` (run hourly via Newman in live checks).
- DNS: Cloudflare. camtoan.me registered at Namecheap (nameservers seamus/tegan, auto-renew on, expires 2027-07-08); kamllistos.com registered at Cloudflare.
- Email: Proton Mail, official@camtoan.me. MX/SPF/DKIM(3 CNAMEs)/DMARC must stay **DNS only** in Cloudflare.
- Status page: status.camtoan.me (Upptime, repo kamllistos/status, CNAME → kamllistos.github.io, DNS only).
- Blog: lives on camtoan.me/blog (repo camtoan-do/website, refreshed daily from Substack by a GitHub Action there). `/blog*` here redirects to it. Services also live on camtoan.me/services (`/services` redirects).
- Netlify: old host, kept briefly as fallback; to be deleted.

## Where things live
- Text: `src/site.ts` · About lives on camtoan.me (`/about` redirects there)
- Security feature database: data `src/db.json` (typed in `src/db.ts`) → `/search/` page + `/glossary/<slug>/` pages. (also served by `/api/glossary`). Home (`src/pages/index.astro`) is a landing page: ASCII clouds, glass card, ASCII site tree
- Design: same language as camtoan.me (mono + heavy sans, hairline borders, grid paper, one orange accent, Auto/Light/Dark toggle via `public/theme.js`) in `src/styles.css`. No mascot. Liquid-glass surfaces use the `.glass` class: look in `src/styles.css`, rim refraction in `public/glass.js` (builds an SVG lens filter per element; Chromium only, frosted fallback elsewhere; no library, CSP unchanged). Every box and control is glass: big surfaces (menu, landing card, search box, filter bar) carry the `.glass` class and get the lens; everything else (cards, chips, badges, footer) is a cheaper 'pane' styled in the last layer of `styles.css` (fill, rim, shadow, round corners, no backdrop filter). Sizes use `clamp()` so they flow with the window; the menu drops its links to a second row under 720px. ASCII sky art lives in `src/sky.ts`.
- Security headers: `public/_headers` (strict CSP — no inline scripts/styles) · Redirects: `public/_redirects`
- Checks: `scripts/check-build.mjs` (CI) and `scripts/check-live.mjs` (hourly; site, headers, TLS, email DNS) + Newman API tests
- Security automation: CodeQL (`.github/workflows/codeql.yml`), Dependabot (`.github/dependabot.yml`)
- Changelog: generated from Git history (`src/changelog.ts`) → `/changelog`, `/changelog.json`, footer "days since update" (computed in `public/site.js`)
- Public docs: `src/content/docs/*.md` → `/docs/` (start with `architecture.md` — keep it in step when the structure changes); stack list `src/stack.ts` → `/stack/` (statuses must stay honest)
- Legal & privacy: `src/content/legal/*.md` → `/legal/` (14 pages, each marked `in-effect` or `standby`; every page ends with an "If this changes" plan). `check-build.mjs` fails if a form, cookie or third-party embed appears before the legal pages are updated.
- Icons: `public/favicon.svg` + `icon.png`, `icon-48.png`, `apple-touch-icon.png` (orange K on dark square, light corner block — same colors as camtoan.me)

## Rules
- Run `npm run build && npm run check:build` before pushing.
- Never put secrets in the repo or chat; tokens go in GitHub/Cloudflare secrets.
- Don't invent facts about the owner (certs, clients, dates).
- Commit messages are published on /changelog — write them in plain English for humans.
- Every change must show up on /changelog: one plain-English commit per meaningful change. Always.
- Use graphify to understand the codebase instead of reading files wholesale: `pip install graphifyy`, `graphify update .`, read `graphify-out/GRAPH_REPORT.md`, then `graphify explain "<name>"`. `graphify-out/` is git-ignored.
- Before the site collects anything new (form, account, analytics, cookie, newsletter, payment, new provider): update the matching pages in `src/content/legal/` first, then acknowledge the tripwire in `scripts/check-build.mjs`. Legal pages must describe what the site really does — no invented commitments.
- Public docs must never include secrets, token values, account IDs or private contact details.

## Open items
- Enable DNSSEC (Cloudflare → DS record in Namecheap).
- Delete Netlify project after a stable week.
- Optional: blameless postmortem of the cutover outage; Lambda "website security check" tool.
- Legal pages: owner to confirm the commitments (12-month enquiry retention, 30-day replies, Alberta governing law, product reuse terms, liability cap of CA$100 for free content / price paid for products), confirm whether Proton offers a DPA on the current plan, and decide on a LICENSE for the repo. Not lawyer-reviewed.
- DMARC p=quarantine → p=reject once email is proven stable.

# Kamllistos (kamllistos.com) — project notes

Personal site + security side hustle for Cam Toan Do (Cybersecurity Coordinator, Calgary).
Owner has no coding background: explain plainly, keep things simple, be honest.

## Stack (all free except domain + Proton)
- Astro static site → Cloudflare Workers static assets (`wrangler.jsonc`), deploys on push to `main`.
- Domains: **kamllistos.com** = this site (the business). **camtoan.me** = owner's personal domain, reserved for a future personal blog; for now it redirects to kamllistos.com (Cloudflare redirect rule) and keeps email + status page. 
- Public read-only REST API on `/api/*` (`worker/index.ts`, GET only). Spec `public/openapi.json`; Postman collection `public/postman/` (run hourly via Newman in live checks).
- DNS: Cloudflare. camtoan.me registered at Namecheap (nameservers seamus/tegan, auto-renew on, expires 2027-07-08); kamllistos.com registered at Cloudflare.
- Email: Proton Mail, official@camtoan.me. MX/SPF/DKIM(3 CNAMEs)/DMARC must stay **DNS only** in Cloudflare.
- Status page: status.camtoan.me (Upptime, repo kamllistos/status, CNAME → kamllistos.github.io, DNS only).
- Substack: camtoando.substack.com, pulled into /blog at build time (`src/substack.ts`).
- Netlify: old host, kept briefly as fallback; to be deleted.

## Where things live
- Text: `src/site.ts` · About timeline: `src/timeline.ts` · Posts: `src/content/blog/`
- Security glossary: data `src/features.ts` → home page + `/glossary/<concept>/` pages (also served by `/api/glossary`)
- Design: neobrutalism (thick borders, hard shadows, flat bright colors) in `src/styles.css`
- Security headers: `public/_headers` (strict CSP — no inline scripts/styles) · Redirects: `public/_redirects`
- Checks: `scripts/check-build.mjs` (CI) and `scripts/check-live.mjs` (hourly; site, headers, TLS, email DNS) + Newman API tests
- Security automation: CodeQL (`.github/workflows/codeql.yml`), Dependabot (`.github/dependabot.yml`)
- Changelog: generated from Git history (`src/changelog.ts`) → `/changelog`, `/changelog.json`, footer "days since update" (computed in `public/site.js`)
- Public docs: `src/content/docs/*.md` → `/docs/`; stack list `src/stack.ts` → `/stack/` (statuses must stay honest)
- Icons: `public/icon.png`, `icon-48.png`, `apple-touch-icon.png` (square K mark)

## Rules
- Run `npm run build && npm run check:build` before pushing.
- Never put secrets in the repo or chat; tokens go in GitHub/Cloudflare secrets.
- Don't invent facts about the owner (certs, clients, dates).
- Commit messages are published on /changelog — write them in plain English for humans.
- Public docs must never include secrets, token values, account IDs or private contact details.

## Open items
- Enable DNSSEC (Cloudflare → DS record in Namecheap).
- Delete Netlify project after a stable week.
- Optional: blameless postmortem of the cutover outage; Lambda "website security check" tool.
- DMARC p=quarantine → p=reject once email is proven stable.

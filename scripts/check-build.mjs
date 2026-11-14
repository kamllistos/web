// Checks the built site (dist/) before it ships.
// Run after `npm run build`: node scripts/check-build.mjs
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";

const DIST = "dist";
const failures = [];
const fail = (msg) => failures.push(msg);

const files = (dir) =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? files(p) : [p];
  });

const html = files(DIST).filter((f) => f.endsWith(".html"));

// SEO: every page is in the sitemap, and the AI-assistant map exists.
const sitemap = readFileSync(join(DIST, "sitemap.xml"), "utf8");
for (const file of html) {
  if (file.endsWith("404.html")) continue;
  const path = "/" + file.slice(DIST.length + 1).replace(/index\.html$/, "");
  if (!sitemap.includes(`<loc>https://kamllistos.com${path}</loc>`)) fail(`${file}: missing from sitemap.xml (add it in src/pages/sitemap.xml.ts)`);
}
if (!existsSync(join(DIST, "llms.txt"))) fail("dist/llms.txt missing");

for (const file of html) {
  const src = readFileSync(file, "utf8");

  // 1. Our Content-Security-Policy blocks inline code, so none may ship.
  if (/<script(?![^>]*\b(src=|type="application\/ld\+json"))[^>]*>/i.test(src)) fail(`${file}: inline <script> (blocked by CSP)`);
  if (/<style[\s>]/i.test(src)) fail(`${file}: inline <style> (blocked by CSP)`);
  if (/\sstyle="/i.test(src)) fail(`${file}: inline style="" attribute (blocked by CSP)`);

  // 2. Every internal link must point at a page or file that exists.
  for (const [, href] of src.matchAll(/href="(\/[^"#?]*)/g)) {
    if (href === "/api" || href.startsWith("/api/")) continue; // served by the API Worker, not files
    const path = join(DIST, href);
    const ok = existsSync(path) && statSync(path).isFile()
      || existsSync(join(path, "index.html"))
      || existsSync(`${path}.html`);
    if (!ok) fail(`${file}: broken internal link ${href}`);
  }
}

// 3. security.txt must exist and not be about to expire (RFC 9116).
const sec = join(DIST, ".well-known/security.txt");
if (!existsSync(sec)) fail("security.txt is missing");
else {
  const expires = readFileSync(sec, "utf8").match(/^Expires:\s*(.+)$/m)?.[1];
  const daysLeft = expires ? (new Date(expires) - Date.now()) / 864e5 : -1;
  if (daysLeft < 30) fail(`security.txt expires in ${Math.floor(daysLeft)} days — renew the Expires date`);
}

// 4. The security headers file must ship, with a Content-Security-Policy.
const headers = join(DIST, "_headers");
if (!existsSync(headers) || !readFileSync(headers, "utf8").includes("Content-Security-Policy:")) {
  fail("_headers is missing or has no Content-Security-Policy");
}

// 5. Only a PUBLIC PGP key may ever be published.
const pgp = join(DIST, "pgp.asc");
if (existsSync(pgp)) {
  const key = readFileSync(pgp, "utf8");
  if (key.includes("PRIVATE KEY")) fail("pgp.asc contains a PRIVATE key — remove it immediately");
  if (!key.includes("BEGIN PGP PUBLIC KEY BLOCK")) fail("pgp.asc is not a public key block");
}

// 6. All fourteen legal pages must ship.
const LEGAL = ["privacy-policy", "terms", "cookies", "legal-basis", "marketing-consent", "data-deletion", "data-retention",
  "data-processing-agreements", "third-party-disclosure", "data-security", "data-breach-procedure", "intellectual-property",
  "open-source-licenses", "payments-subscriptions"];
for (const id of LEGAL) {
  if (!existsSync(join(DIST, "legal", id, "index.html"))) fail(`legal page /legal/${id}/ is missing`);
}

// 7. Legal tripwires. The legal pages say this site has no forms, cookies or third-party content.
// If one of these appears, update the pages under src/content/legal/ FIRST, then add its name to REVIEWED.
const REVIEWED = [];
const TRIPWIRES = [
  { name: "form", in: html, pattern: /<form[\s>]/i, pages: "privacy-policy, legal-basis, data-retention" },
  { name: "third-party-embed", in: html, pattern: /<(script|iframe|img|link)\b[^>]*\s(src|href)="(https?:)?\/\/(?!kamllistos\.com)[^"]*"/i, pages: "third-party-disclosure, cookies, data-processing-agreements" },
  { name: "cookie", in: files(DIST).filter((f) => f.endsWith(".js")), pattern: /document\.cookie/, pages: "cookies" },
];
for (const t of TRIPWIRES) {
  if (REVIEWED.includes(t.name)) continue;
  for (const file of t.in) {
    if (t.pattern.test(readFileSync(file, "utf8"))) fail(`${file}: new "${t.name}" found — update /legal/ (${t.pages}) first, then add "${t.name}" to REVIEWED in scripts/check-build.mjs`);
  }
}

console.log(`Checked ${html.length} pages.`);
if (failures.length) {
  console.error(failures.map((f) => `✗ ${f}`).join("\n"));
  process.exit(1);
}
console.log("✓ All build checks passed.");

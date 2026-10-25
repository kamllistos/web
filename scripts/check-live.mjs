// Checks the live site from the outside, like a visitor would.
// Usage: node scripts/check-live.mjs [https://kamllistos.com]
import { connect } from "node:tls";
import { resolveMx, resolveTxt, resolveCname, resolveNs, resolve4, Resolver } from "node:dns/promises";
import { appendFileSync } from "node:fs";

const BASE = process.argv[2] ?? "https://kamllistos.com";
const host = new URL(BASE).hostname;
const results = [];

async function check(name, fn) {
  const start = performance.now();
  try {
    const detail = await fn();
    results.push({ name, ok: true, detail, ms: Math.round(performance.now() - start) });
  } catch (e) {
    results.push({ name, ok: false, detail: e.message, ms: Math.round(performance.now() - start) });
  }
}

// Always read the body so the connection is released for the next request.
async function get(url) {
  const res = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(10_000) });
  const body = await res.text();
  return { status: res.status, headers: res.headers, body };
}

await check("Home page is up", async () => {
  const res = await get(BASE);
  if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
  const server = res.headers.get("server") ?? "unknown";
  console.log(`\n::notice::Served by: ${server}`);
  return `HTTP 200 (server: ${server})`;
});

await check("HTTP redirects to HTTPS", async () => {
  const res = await get(`http://${host}/`);
  const to = res.headers.get("location") ?? "";
  if (![301, 308].includes(res.status) || !to.startsWith("https://")) throw new Error(`HTTP ${res.status} → ${to || "no redirect"}`);
  return `${res.status} → ${to}`;
});

await check("www redirects to apex", async () => {
  const res = await get(`https://www.${host}/`);
  const to = res.headers.get("location") ?? "";
  if (![301, 308].includes(res.status) || new URL(to, BASE).hostname !== host) throw new Error(`HTTP ${res.status} → ${to || "no redirect"}`);
  return `${res.status} → ${to}`;
});

await check("Security headers present", async () => {
  const res = await get(BASE);
  const required = [
    "content-security-policy",
    "strict-transport-security",
    "x-content-type-options",
    "x-frame-options",
    "referrer-policy",
    "permissions-policy",
  ];
  const missing = required.filter((h) => !res.headers.has(h));
  if (missing.length) throw new Error(`missing: ${missing.join(", ")}`);
  return `${required.length}/${required.length} headers`;
});

for (const path of ["/.well-known/security.txt", "/pgp.asc", "/security/", "/blog/", "/about/", "/services/", "/changelog/", "/stack/", "/docs/", "/openapi.json"]) {
  await check(`${path} reachable`, async () => {
    const res = await get(BASE + path);
    if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
    return "HTTP 200";
  });
}

// Informational only: how many Substack posts made it onto the live blog.
await check("Blog page renders (Substack posts counted)", async () => {
  const res = await get(`${BASE}/blog/`);
  if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
  const count = (res.body.match(/Substack ↗/g) ?? []).length;
  console.log(`\n::notice::Live blog lists ${count} Substack post(s)`);
  return `${count} Substack post(s)`;
});

await check("TLS certificate valid for 14+ days", () =>
  new Promise((resolve, reject) => {
    const socket = connect({ host, port: 443, servername: host, timeout: 10_000 }, () => {
      const cert = socket.getPeerCertificate();
      socket.end();
      const days = Math.floor((new Date(cert.valid_to) - Date.now()) / 864e5);
      days >= 14 ? resolve(`${days} days left`) : reject(new Error(`expires in ${days} days`));
    });
    socket.on("error", reject);
    socket.on("timeout", () => socket.destroy(new Error("timeout")));
  }),
);

// camtoan.me is the owner's personal domain: it redirects here for now, and keeps the email + status page.
const PERSONAL = "camtoan.me";
if (host === "kamllistos.com") {
  await check("camtoan.me redirects here", async () => {
    const res = await get(`https://${PERSONAL}/`);
    const to = res.headers.get("location") ?? "";
    if (![301, 302, 307, 308].includes(res.status) || new URL(to, BASE).hostname !== host) throw new Error(`HTTP ${res.status} → ${to || "no redirect"}`);
    return `${res.status} → ${to}`;
  });

  // DNS: email and status-page records on camtoan.me must stay intact.
  // Informational: where DNS points, asked straight from our authoritative nameserver
  // (bypasses resolver caches), plus the public view.
  try {
    const ns = (await resolveNs(PERSONAL)).sort();
    const auth = new Resolver();
    auth.setServers(await resolve4(ns[0]));
    const ask = async (r, name) => {
      try { return (await r.resolve4(name)).sort().join(", "); }
      catch (e) { try { return "CNAME " + (await r.resolveCname(name)).join(", "); } catch { return e.code; } }
    };
    console.log(`\n::notice::DNS: nameservers ${ns.join(", ")} | authoritative apex ${await ask(auth, PERSONAL)} | authoritative www ${await ask(auth, "www." + PERSONAL)} | public apex ${await ask(new Resolver(), PERSONAL)}`);
  } catch (e) {
    console.log(`\n::notice::DNS lookup info unavailable: ${e.message}`);
  }

  await check("DNS: MX points to Proton", async () => {
    const mx = (await resolveMx(PERSONAL)).map((r) => r.exchange).sort();
    if (!mx.includes("mail.protonmail.ch") || !mx.includes("mailsec.protonmail.ch")) throw new Error(mx.join(", "));
    return mx.join(", ");
  });
  await check("DNS: SPF + Proton verification", async () => {
    const txt = (await resolveTxt(PERSONAL)).map((r) => r.join(""));
    if (!txt.some((t) => t.startsWith("v=spf1") && t.includes("_spf.protonmail.ch"))) throw new Error("SPF missing");
    if (!txt.some((t) => t.startsWith("protonmail-verification="))) throw new Error("Proton verification missing");
    return "SPF ok, verification ok";
  });
  await check("DNS: DMARC policy", async () => {
    const txt = (await resolveTxt(`_dmarc.${PERSONAL}`)).map((r) => r.join(""));
    const dmarc = txt.find((t) => t.startsWith("v=DMARC1"));
    if (!dmarc) throw new Error("DMARC missing");
    return dmarc;
  });
  await check("DNS: 3 DKIM keys point to Proton", async () => {
    for (const k of ["protonmail", "protonmail2", "protonmail3"]) {
      const [target] = await resolveCname(`${k}._domainkey.${PERSONAL}`);
      if (!target?.endsWith(".domains.proton.ch")) throw new Error(`${k}: ${target}`);
    }
    return "3/3 keys";
  });
  await check("DNS: status page", async () => {
    const [target] = await resolveCname(`status.${PERSONAL}`);
    if (target !== "camtoan-do.github.io") throw new Error(String(target));
    return target;
  });
}

// Print a table, and write it to the GitHub Actions run summary (public on the Actions tab).
const table = [
  `## Live checks for ${BASE}`,
  `_${new Date().toISOString()}_`,
  "",
  "| Check | Result | Detail | Time |",
  "| --- | --- | --- | --- |",
  ...results.map((r) => `| ${r.name} | ${r.ok ? "✅" : "❌"} | ${r.detail} | ${r.ms} ms |`),
].join("\n");
console.log(table);
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, table + "\n");

// Surface each failure as a GitHub annotation so it shows on the run page.
for (const r of results.filter((r) => !r.ok)) console.log(`\n::error::${r.name}: ${r.detail}`);

process.exit(results.every((r) => r.ok) ? 0 : 1);

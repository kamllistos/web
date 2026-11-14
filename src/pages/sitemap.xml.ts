// Sitemap for search engines. scripts/check-build.mjs fails if a built page is missing here.
import { getCollection } from "astro:content";
import { entries } from "../db";

const STATIC = ["/", "/search/", "/products/", "/docs/", "/changelog/", "/stack/", "/legal/", "/security/"];

export async function GET() {
  const docs = (await getCollection("docs")).map((d) => `/docs/${d.id}/`);
  const legal = (await getCollection("legal")).map((p) => `/legal/${p.id}/`);
  const glossary = entries.map((e) => `/glossary/${e.slug}/`);
  const urls = [...STATIC, ...docs, ...legal, ...glossary]
    .map((p) => `  <url><loc>https://kamllistos.com${p}</loc></url>`)
    .join("\n");
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`, {
    headers: { "Content-Type": "application/xml" },
  });
}

// llms.txt: a plain-text map of the site for AI assistants and answer engines (llmstxt.org).
import { getCollection } from "astro:content";
import { site } from "../site";
import { entries, catById } from "../db";

export async function GET() {
  const docs = (await getCollection("docs")).sort((a, b) => a.data.order - b.data.order);
  const lines = [
    `# ${site.brand.name}`,
    "",
    `> ${site.brand.description}`,
    "",
    `${site.brand.name} (${site.brand.pronounce}) is run by ${site.name}, a cybersecurity coordinator. Everything is written in plain English for people without a security team. Owner's personal site: https://camtoan.me`,
    "",
    "## Main pages",
    "",
    "- [Security feature database](https://kamllistos.com/search/): describe a security problem in your own words and get the proper name, what it stops, a prompt for your AI agent and code you can copy",
    "- [Products](https://kamllistos.com/products/): checklist, rules pack and launch review",
    "- [Public API](https://kamllistos.com/openapi.json): read-only JSON API for the database (GET /api/glossary)",
    "- [Changelog](https://kamllistos.com/changelog/): every change in plain English",
    "",
    "## Security feature database",
    "",
    ...entries.map((e) => `- [${e.name}](https://kamllistos.com/glossary/${e.slug}/): ${e.oneLiner} (${catById.get(e.category)!.name})`),
    "",
    "## Docs",
    "",
    ...docs.map((d) => `- [${d.data.title}](https://kamllistos.com/docs/${d.id}/): ${d.data.description}`),
    "",
    "## Optional",
    "",
    "- [Legal & privacy](https://kamllistos.com/legal/)",
    "- [Security & disclosure](https://kamllistos.com/security/)",
    "",
  ];
  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}

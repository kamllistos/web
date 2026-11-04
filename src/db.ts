// Security feature database. Entries live in db.json (one object per feature);
// this file types them and adds category metadata. Used by the home page, entry pages and /api/glossary.
import raw from "./db.json";

export type Priority = "must" | "should" | "nice";
export interface Entry {
  slug: string;
  name: string;
  aliases: string[];
  category: string;
  priority: Priority;
  stops: string;
  cwe?: string;
  oneLiner: string;
  explain: string;
  youCalledIt: string[];
  parts: { name: string; desc: string }[];
  prompt: string;
  verify: string[];
  inCode: { stack: string; code: string; note?: string }[];
  refs: { title: string; url: string }[];
  seeAlso: string[];
}

// bad → fix: the tiny specimen on each card that flips on hover.
const cats = [
  { id: "injection", name: "Injection", short: "Inject", tagline: "User input that ends up as code.", bad: "' OR 1=1 --", fix: "$1" },
  { id: "xss", name: "XSS & browser", short: "XSS", tagline: "Scripts and tricks that run in your users' browsers.", bad: "<script>", fix: "&lt;script&gt;" },
  { id: "auth", name: "Login & sessions", short: "Auth", tagline: "Proving who someone is and keeping them signed in.", bad: "password123", fix: "$argon2id$…" },
  { id: "access", name: "Access control", short: "Access", tagline: "Making sure people only touch what is theirs.", bad: "/users/42", fix: "403" },
  { id: "headers", name: "Headers & transport", short: "Headers", tagline: "What your server tells the browser, and how it travels.", bad: "http://", fix: "https://" },
  { id: "data", name: "Data & secrets", short: "Data", tagline: "Keys, tokens and personal data, kept out of reach.", bad: "sk_live_…", fix: "${SECRET}" },
  { id: "input", name: "Input, uploads & SSRF", short: "Input", tagline: "Checking everything that comes in before you trust it.", bad: "../../etc/passwd", fix: "400" },
  { id: "abuse", name: "Abuse & rate limits", short: "Abuse", tagline: "Stopping bots, floods and surprise bills.", bad: "x10000 req", fix: "429" },
  { id: "supply", name: "Supply chain & CI", short: "Supply", tagline: "The code you did not write, and the pipeline that ships it.", bad: "^1.2.3", fix: "1.2.3 + lock" },
  { id: "ops", name: "Logging, errors & monitoring", short: "Ops", tagline: "Noticing when something goes wrong, without leaking.", bad: "stack trace", fix: "ref #a91f" },
] as const;

export const entries: Entry[] = (raw as Entry[]).slice().sort((a, b) => a.name.localeCompare(b.name));
export const bySlug = new Map(entries.map((e) => [e.slug, e]));
export const categories = cats.map((c) => ({ ...c, count: entries.filter((e) => e.category === c.id).length }));
export type Category = (typeof categories)[number];
export const catById = new Map(categories.map((c) => [c.id as string, c]));
export const priorityLabel: Record<Priority, string> = { must: "Must-have", should: "Should-have", nice: "Hardening" };

// Everything a person might type, flattened for search (client-side and API).
export const searchText = (e: Entry) =>
  [e.name, ...e.aliases, e.stops, e.cwe ?? "", e.oneLiner, ...e.youCalledIt, catById.get(e.category)?.name ?? ""].join(" ").toLowerCase();

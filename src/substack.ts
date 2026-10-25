import { site } from "./site";

export interface SubstackPost {
  title: string;
  description: string;
  url: string;
  date: Date;
}

const tag = (xml: string, name: string) =>
  xml.match(new RegExp(`<${name}>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?</${name}>`))?.[1].trim() ?? "";

// Turns RSS HTML into plain text. (Astro escapes it again when rendering, so this is for readability.)
const decode = (input: string) => {
  // Strip tags repeatedly until none remain: one pass can leave fragments like "<scr<b>ipt>".
  let s = input;
  let prev: string;
  do {
    prev = s;
    s = s.replace(/<[^>]*>/g, "");
  } while (s !== prev);
  // Decode &amp; LAST, so "&amp;lt;" becomes the text "&lt;" instead of being unescaped twice into "<".
  return s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");
};

let cache: Promise<SubstackPost[]> | undefined;

// Fetches the latest Substack posts at build time. If Substack is unreachable,
// the build still succeeds and the blog simply shows local posts only.
export function getSubstackPosts(): Promise<SubstackPost[]> {
  cache ??= (async () => {
    try {
      const res = await fetch(site.substack.feed, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; kamllistos-build; +https://kamllistos.com)" },
        signal: AbortSignal.timeout(10_000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const xml = await res.text();
      const posts = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(([, item]) => ({
        title: decode(tag(item, "title")),
        description: decode(tag(item, "description")),
        url: tag(item, "link"),
        date: new Date(tag(item, "pubDate")),
      })).filter((p) => p.title && p.url.startsWith("https://"));
      const exclude = site.substack.exclude ?? [];
      const visible = posts.filter(
        (p) => !exclude.some((x) => p.title.toLowerCase().includes(x.toLowerCase())),
      );
      console.log(`\n::notice::Substack: ${visible.length} of ${posts.length} posts shown from ${site.substack.feed}`);
      return visible;
    } catch (e) {
      console.log(`\n::warning::Substack feed unavailable (${(e as Error).message}); showing local posts only`);
      return [];
    }
  })();
  return cache;
}

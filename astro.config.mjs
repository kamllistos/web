import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://kamllistos.com",
  // Emit CSS as files (not inline) so the strict Content-Security-Policy in public/_headers holds.
  build: { inlineStylesheets: "never" },
  // Syntax highlighting emits inline style="" attributes, which the strict CSP blocks.
  markdown: { syntaxHighlight: false },
});

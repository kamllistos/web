// ✏️ The tech stack shown on /stack. Keep statuses honest: only "in-use" if it's really running.
export type Status = "in-use" | "planned" | "lab";

export interface Tech {
  name: string;
  status: Status;
  what: string; // what it does on this site, in plain English
  doc?: string; // slug under /docs/
  link?: { label: string; url: string };
}

export const stack: { group: string; items: Tech[] }[] = [
  {
    group: "Build & ship",
    items: [
      { name: "Git & GitHub", status: "in-use", what: "Version history for every change; powers the public changelog.", doc: "git-and-github", link: { label: "Repository", url: "https://github.com/kamllistos/kamllistos" } },
      { name: "GitHub Actions", status: "in-use", what: "Builds and checks every change; tests the live site and API every hour.", doc: "github-actions", link: { label: "Runs", url: "https://github.com/kamllistos/kamllistos/actions" } },
      { name: "Linux", status: "in-use", what: "All automation runs on Ubuntu runners; checks are shell and Node scripts.", doc: "github-actions" },
      { name: "Astro + TypeScript", status: "in-use", what: "Builds the site into plain static files: fast, with almost nothing to attack." },
      { name: "Cloudflare Workers", status: "in-use", what: "Hosts the site worldwide and runs the small API on /api." },
    ],
  },
  {
    group: "Security",
    items: [
      { name: "SAST (CodeQL)", status: "in-use", what: "Scans the code for security bugs on every change and weekly.", doc: "codeql" },
      { name: "Dependabot", status: "in-use", what: "Alerts on vulnerable dependencies and opens update pull requests.", doc: "dependabot" },
      { name: "OWASP Top 10", status: "in-use", what: "Every risk mapped to how this site handles it.", doc: "owasp-top-10" },
      { name: "Security headers & TLS", status: "in-use", what: "Strict CSP, HSTS and friends — verified every hour.", doc: "owasp-top-10" },
    ],
  },
  {
    group: "APIs",
    items: [
      { name: "REST API", status: "in-use", what: "Public read-only endpoints for the glossary and changelog.", doc: "rest-api", link: { label: "Try /api", url: "/api" } },
      { name: "Postman", status: "in-use", what: "A tested collection (16 assertions) run hourly with Newman.", doc: "rest-api", link: { label: "Collection", url: "/postman/kamllistos-api.postman_collection.json" } },
      { name: "OpenAPI", status: "in-use", what: "Machine-readable description of every endpoint.", link: { label: "openapi.json", url: "/openapi.json" } },
    ],
  },
  {
    group: "Next up",
    items: [
      { name: "Python + AWS Lambda", status: "planned", what: "A free “check your website's security headers” tool." },
      { name: "Terraform", status: "planned", what: "Define the Lambda tool and DNS as code." },
      { name: "Docker", status: "planned", what: "Package the Python tool so it runs the same everywhere." },
      { name: "SQL & databases", status: "planned", what: "Only if a feature genuinely needs stored data." },
      { name: "SIEM (Splunk / ELK)", status: "lab", what: "A home-lab project and write-up, not part of this site." },
      { name: "Kubernetes", status: "lab", what: "A home-lab project — overkill for a static site." },
    ],
  },
];

export const statusLabel: Record<Status, string> = { "in-use": "In use", planned: "Planned", lab: "Lab project" };

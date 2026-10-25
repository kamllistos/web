// Builds the public changelog from this repo's Git history.
// Source 1: GitHub's REST API (works even if the build only has a shallow clone).
// Source 2: local `git log` (fallback for local builds).
import { execFileSync } from "node:child_process";

export interface Change {
  sha: string;
  short: string;
  date: string; // ISO 8601
  message: string; // first line of the commit message only
  url: string;
}

const REPO = "camtoan-do/kamllistos";
const commitUrl = (sha: string) => `https://github.com/${REPO}/commit/${sha}`;
// Only the first line is public; drop merge commits and tooling noise.
const keep = (msg: string) => msg && !/^Merge (branch|pull request)/.test(msg);

async function fromGitHub(): Promise<Change[]> {
  const res = await fetch(`https://api.github.com/repos/${REPO}/commits?sha=main&per_page=100`, {
    headers: { Accept: "application/vnd.github+json", "User-Agent": "kamllistos-build" },
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`GitHub API HTTP ${res.status}`);
  const data = (await res.json()) as Array<{ sha: string; commit: { message: string; committer: { date: string } } }>;
  return data.map((c) => ({
    sha: c.sha,
    short: c.sha.slice(0, 7),
    date: c.commit.committer.date,
    message: c.commit.message.split("\n")[0].trim(),
    url: commitUrl(c.sha),
  }));
}

function fromGit(): Change[] {
  const out = execFileSync("git", ["log", "-n", "100", "--format=%H%x1f%cI%x1f%s"], { encoding: "utf8" });
  return out.trim().split("\n").filter(Boolean).map((line) => {
    const [sha, date, message] = line.split("\x1f");
    return { sha, short: sha.slice(0, 7), date, message, url: commitUrl(sha) };
  });
}

let cache: Promise<Change[]> | undefined;

export function getChanges(): Promise<Change[]> {
  cache ??= (async () => {
    let changes: Change[] = [];
    try {
      changes = await fromGitHub();
    } catch (e) {
      console.log(`\n::warning::Changelog: GitHub API unavailable (${(e as Error).message}); using local git`);
      try { changes = fromGit(); } catch { changes = []; }
    }
    return changes.filter((c) => keep(c.message)).sort((a, b) => b.date.localeCompare(a.date));
  })();
  return cache;
}

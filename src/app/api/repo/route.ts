import { NextResponse } from "next/server";
import { parseRepo } from "@/lib/parse-repo-url";
const H = () => ({ Accept: "application/vnd.github+json", ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}) });
const gh = (p: string) => fetch(`https://api.github.com${p}`, { headers: H(), next: { revalidate: 3600 } });
function fail(r: Response) {
  if (r.status === 404) return NextResponse.json({ error: "Repository not found or not public." }, { status: 404 });
  if (r.status === 403 || r.status === 429) {
    const reset = Number(r.headers.get("x-ratelimit-reset") ?? 0), retryAfter = Math.max(reset - Math.floor(Date.now() / 1000), 30);
    return NextResponse.json({ error: "GitHub rate limit reached.", retryAfter }, { status: 429 });
  }
  return NextResponse.json({ error: "GitHub request failed." }, { status: 502 });
}
export async function GET(req: Request) {
  const r = parseRepo(new URL(req.url).searchParams.get("repo") ?? "");
  if (!r) return NextResponse.json({ error: "Enter a valid repo: owner/repo or a GitHub URL." }, { status: 400 });
  const { owner, name } = r;
  const meta = await gh(`/repos/${owner}/${name}`); if (!meta.ok) return fail(meta);
  const m = await meta.json();
  const [tree, commits] = await Promise.all([gh(`/repos/${owner}/${name}/git/trees/${m.default_branch}?recursive=1`), gh(`/repos/${owner}/${name}/commits?per_page=100`)]);
  if (!tree.ok) return fail(tree);
  const t = await tree.json();
  const cl: { sha: string; commit: { author: { date: string } } }[] = commits.ok ? await commits.json() : [];
  // Per-commit file lists only for the newest 25 commits (API cost). Older files get born=0.
  const born: Record<string, number> = {};
  const details = await Promise.all(cl.slice(0, 25).map((c) => gh(`/repos/${owner}/${name}/commits/${c.sha}`).then((x) => (x.ok ? x.json() : null)).catch(() => null)));
  for (const d of details) if (d) for (const f of d.files ?? []) if (f.status === "added") { const ts = Date.parse(d.commit.author.date); if (!born[f.filename] || ts < born[f.filename]) born[f.filename] = ts; }
  const files = (t.tree as { path: string; type: string; size?: number }[]).filter((n) => n.type === "blob").map((n) => ({ p: n.path, s: n.size ?? 0, b: born[n.path] }));
  const dates = cl.map((c) => Date.parse(c.commit.author.date));
  return NextResponse.json({ repo: `${owner}/${name}`, stars: m.stargazers_count, language: m.language, truncated: !!t.truncated, files, commitsSampled: cl.length, detailedCommits: details.filter(Boolean).length, minDate: dates.length ? Math.min(...dates) : Date.now(), maxDate: dates.length ? Math.max(...dates) : Date.now() });
}

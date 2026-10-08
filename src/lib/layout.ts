import { hierarchy, pack } from "d3-hierarchy";
export type FileIn = { p: string; s: number; b?: number };
export type Star = { path: string; size: number; lang: string; x: number; y: number; z: number; r: number; color: string; born: number };
const LANG: Record<string, string> = { ts: "TypeScript", tsx: "TypeScript", js: "JavaScript", jsx: "JavaScript", mjs: "JavaScript", py: "Python", go: "Go", rs: "Rust", java: "Java", c: "C", h: "C", cpp: "C++", cs: "C#", rb: "Ruby", php: "PHP", md: "Markdown", json: "JSON", css: "CSS", scss: "CSS", html: "HTML", yml: "YAML", yaml: "YAML", sh: "Shell", swift: "Swift", kt: "Kotlin" };
// One accent hue (violet), different lightness per language — no rainbow.
const SHADES = ["#7C6CFF", "#9A8DFF", "#B8AFFF", "#6254E0", "#D4CFFF", "#8F7BFF", "#5A4BD1", "#A99EFF"];
export const langOf = (p: string) => LANG[p.split(".").pop()?.toLowerCase() ?? ""] ?? "Other";
export function hash(s: string) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
export const sizeToRadius = (bytes: number) => 0.08 + Math.log10(bytes + 1) * 0.07;
export const colorFor = (lang: string) => SHADES[hash(lang) % SHADES.length];

type Node = { name: string; value?: number; f?: FileIn; children?: Node[] };
/** Deterministic: same input -> same layout (z jitter is seeded by path hash). Caps at 5,000 largest files. */
export function layoutGalaxy(files: FileIn[], t0: number, t1: number): Star[] {
  const top = [...files].sort((a, b) => b.s - a.s).slice(0, 5000);
  const root: Node = { name: "", children: [] };
  for (const f of top) {
    let n = root;
    const parts = f.p.split("/");
    parts.slice(0, -1).forEach((d) => { let c = n.children!.find((k) => k.name === d && k.children); if (!c) { c = { name: d, children: [] }; n.children!.push(c); } n = c; });
    n.children!.push({ name: parts[parts.length - 1], value: Math.max(f.s, 1), f });
  }
  const tree = pack<Node>().size([100, 100]).padding(0.5)(hierarchy(root).sum((d) => d.value ?? 0).sort((a, b) => a.data.name.localeCompare(b.data.name)));
  const span = Math.max(t1 - t0, 1);
  return tree.leaves().map((l) => {
    const f = l.data.f!, lang = langOf(f.p);
    return { path: f.p, size: f.s, lang, x: l.x - 50, y: l.y - 50, z: ((hash(f.p) % 1000) / 1000 - 0.5) * 3, r: sizeToRadius(f.s), color: colorFor(lang), born: f.b ? (f.b - t0) / span : 0 };
  });
}
export function demoStars(n = 1600): Star[] {
  let s = 7; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  return Array.from({ length: n }, (_, i) => {
    const arm = i % 3, d = Math.sqrt(rnd()) * 48, a = d * 0.14 + arm * 2.094 + (rnd() - 0.5) * 0.7;
    return { path: `demo/${i}`, size: 1000, lang: "Demo", x: Math.cos(a) * d, y: Math.sin(a) * d, z: (rnd() - 0.5) * 3, r: 0.12 + rnd() * 0.28, color: SHADES[i % SHADES.length], born: 0 };
  });
}

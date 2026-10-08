"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { layoutGalaxy, type FileIn, type Star } from "@/lib/layout";
const Galaxy = dynamic(() => import("./Galaxy"), { ssr: false });
type Data = { repo: string; stars: number; language: string | null; truncated: boolean; files: FileIn[]; commitsSampled: number; detailedCommits: number; minDate: number; maxDate: number };
const kb = (n: number) => (n > 1048576 ? (n / 1048576).toFixed(1) + " MB" : n > 1024 ? (n / 1024).toFixed(1) + " KB" : n + " B");

export default function RepoView({ owner, name }: { owner: string; name: string }) {
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<{ msg: string; retry?: number } | null>(null);
  const [sel, setSel] = useState<Star | null>(null), [hov, setHov] = useState<Star | null>(null);
  const [t, setT] = useState(1), [play, setPlay] = useState(false), [speed, setSpeed] = useState(1), [q, setQ] = useState("");
  const raf = useRef(0);
  useEffect(() => { fetch(`/api/repo?repo=${owner}/${name}`).then(async (r) => { const j = await r.json(); r.ok ? setData(j) : setError({ msg: j.error, retry: j.retryAfter }); }).catch(() => setError({ msg: "Network error." })); }, [owner, name]);
  const stars = useMemo(() => (data ? layoutGalaxy(data.files, data.minDate, data.maxDate) : []), [data]);
  useEffect(() => { // time replay — loop driven by rAF, state updated at ~30Hz only on the slider
    if (!play) return; let last = performance.now();
    const tick = (n: number) => { setT((p) => { const v = p + ((n - last) / 12000) * speed; return v >= 1 ? (setPlay(false), 1) : v; }); last = n; raf.current = requestAnimationFrame(tick); };
    raf.current = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf.current);
  }, [play, speed]);
  useEffect(() => { const k = (e: KeyboardEvent) => { if ((e.target as HTMLElement).tagName === "INPUT") return; if (e.code === "Space") { e.preventDefault(); setPlay((p) => !p); } if (e.key === "Escape") setSel(null); }; addEventListener("keydown", k); return () => removeEventListener("keydown", k); }, []);
  const results = useMemo(() => (q ? stars.filter((s) => s.path.toLowerCase().includes(q.toLowerCase())).slice(0, 8) : []), [q, stars]);
  const share = () => { const c = document.querySelector("canvas"); c?.toBlob((b) => { if (!b) return; const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = `${owner}-${name}-galaxy.png`; a.click(); }); };
  const langs = useMemo(() => { const m: Record<string, number> = {}; stars.forEach((s) => (m[s.lang] = (m[s.lang] ?? 0) + 1)); return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([l]) => l).join(" · "); }, [stars]);

  if (error) return <div className="grid h-screen place-items-center px-6"><div className="glass max-w-md p-8 text-center"><h1 className="font-display text-2xl">Couldn’t load {owner}/{name}</h1><p className="mt-2 text-mute">{error.msg}{error.retry ? ` Try again in ~${Math.ceil(error.retry / 60)} min.` : ""}</p><Link href="/" className="btn btn-accent mt-6">Back home</Link></div></div>;
  if (!data) return <div className="grid h-screen place-items-center"><div className="w-full max-w-md space-y-3 px-6"><p className="font-display tracking-widest text-accent">SCANNING {owner}/{name}…</p><div className="skeleton h-4 w-3/4" /><div className="skeleton h-4 w-1/2" /><div className="skeleton h-40 w-full" /></div></div>;

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <Galaxy data={stars} t={t} autoRotate={!sel} onHover={setHov} onSelect={setSel} />
      <header className="glass absolute left-4 right-4 top-4 flex flex-wrap items-center gap-4 px-4 py-3">
        <Link href="/" className="font-display text-accent" aria-label="Home">◉</Link>
        <h1 className="font-display text-lg">{data.repo}</h1>
        <span className="text-sm text-mute">★ {data.stars.toLocaleString()} · {stars.length.toLocaleString()} files · {langs}</span>
        <div className="relative ml-auto">
          <label className="sr-only" htmlFor="s">Search files</label>
          <input id="s" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search files…" className="w-52 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm focus:outline-none" />
          {results.length > 0 && <ul className="glass absolute right-0 mt-2 w-80 overflow-hidden text-sm">{results.map((r) => <li key={r.path}><button className="block w-full truncate px-3 py-2 text-left hover:bg-accent/15" onClick={() => { setSel(r); setQ(""); }}>{r.path}</button></li>)}</ul>}
        </div>
        <button onClick={() => setSel(null)} className="btn btn-ghost py-1.5 text-sm">Reset view</button>
        <button onClick={share} className="btn btn-accent py-1.5 text-sm">Share PNG</button>
      </header>
      {data.truncated && <p className="glass absolute left-4 top-24 px-3 py-1 text-xs text-mute">File tree truncated by GitHub. Size = bytes, not lines.</p>}
      {hov && !sel && <div className="glass pointer-events-none absolute bottom-28 left-1/2 -translate-x-1/2 px-3 py-1.5 text-sm">{hov.path}</div>}
      <AnimatePresence>{sel && (
        <motion.aside initial={{ x: 380 }} animate={{ x: 0 }} exit={{ x: 380 }} transition={{ type: "spring", stiffness: 260, damping: 28 }} className="glass absolute bottom-28 right-4 top-24 w-80 overflow-auto p-5" aria-label="File details">
          <button onClick={() => setSel(null)} className="float-right text-mute hover:text-ink" aria-label="Close">✕</button>
          <p className="text-xs uppercase tracking-widest text-accent">File</p>
          <h2 className="mt-1 break-all font-display text-lg">{sel.path.split("/").pop()}</h2>
          <p className="mt-1 break-all text-xs text-mute">{sel.path}</p>
          <dl className="mt-5 space-y-3 text-sm"><div><dt className="text-mute">Size</dt><dd className="font-display text-2xl">{kb(sel.size)}</dd></div><div><dt className="text-mute">Language</dt><dd>{sel.lang}</dd></div>
            <div><dt className="text-mute">Added in sampled history</dt><dd>{sel.born > 0 ? new Date(data.minDate + sel.born * (data.maxDate - data.minDate)).toLocaleDateString() : "Before sampled window"}</dd></div></dl>
          <a className="btn btn-ghost mt-6 w-full justify-center text-sm" target="_blank" rel="noreferrer" href={`https://github.com/${data.repo}/blob/HEAD/${sel.path}`}>Open on GitHub ↗</a>
        </motion.aside>)}</AnimatePresence>
      <footer className="glass absolute bottom-4 left-4 right-4 flex items-center gap-4 px-4 py-3">
        <button className="btn btn-accent py-1.5" onClick={() => { if (t >= 1) setT(0); setPlay(!play); }} aria-label={play ? "Pause" : "Play"}>{play ? "❚❚" : "▶"}</button>
        <input type="range" min={0} max={1} step={0.001} value={t} onChange={(e) => { setPlay(false); setT(+e.target.value); }} className="flex-1 accent-[#7C6CFF]" aria-label="Timeline" />
        <span className="w-24 text-right font-display text-sm">{new Date(data.minDate + t * (data.maxDate - data.minDate)).toLocaleDateString()}</span>
        <select value={speed} onChange={(e) => setSpeed(+e.target.value)} className="rounded-lg border border-white/10 bg-s1 px-2 py-1 text-sm" aria-label="Speed">{[0.5, 1, 2, 4].map((s) => <option key={s} value={s}>{s}×</option>)}</select>
        <span className="hidden text-xs text-mute md:inline">Sampled history: {data.commitsSampled} commits, {data.detailedCommits} with file lists</span>
      </footer>
    </div>
  );
}

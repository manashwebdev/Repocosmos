"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Lenis from "lenis";
import { parseRepo } from "@/lib/parse-repo-url";
import DemoGalaxy from "./DemoGalaxy";
const steps = [["Paste", "Any public GitHub repository."], ["Scan", "We read the file tree and recent commits."], ["Explore", "Folders become clusters, files become stars."]];
export default function Landing() {
  const router = useRouter(); const [v, setV] = useState(""); const [err, setErr] = useState("");
  useEffect(() => { const l = new Lenis(); let id = 0; const raf = (t: number) => { l.raf(t); id = requestAnimationFrame(raf); }; id = requestAnimationFrame(raf); return () => { cancelAnimationFrame(id); l.destroy(); }; }, []);
  const go = (s: string) => { const r = parseRepo(s); if (!r) return setErr("Enter owner/repo or a GitHub URL."); router.push(`/r/${r.owner}/${r.name}`); };
  return (
    <main>
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-90" aria-hidden><DemoGalaxy /></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,#05060A_75%)] pointer-events-none" />
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .8 }} className="relative z-10 mx-auto max-w-2xl px-6 text-center">
          <p className="mb-4 font-display text-sm tracking-[.3em] text-accent">REPOCOSMOS</p>
          <h1 className="font-display text-5xl font-semibold leading-tight md:text-7xl">Your repo, as a <span className="text-accent">galaxy</span>.</h1>
          <p className="mt-5 text-mute">Folders become star clusters. Files become stars. Commits leave light trails.</p>
          <form onSubmit={(e) => { e.preventDefault(); go(v); }} className="glass mx-auto mt-9 flex gap-2 p-2">
            <label htmlFor="repo" className="sr-only">GitHub repository</label>
            <input id="repo" value={v} onChange={(e) => { setV(e.target.value); setErr(""); }} placeholder="facebook/react or https://github.com/…" className="min-w-0 flex-1 bg-transparent px-3 text-ink placeholder:text-mute focus:outline-none" />
            <button className="btn btn-accent">Launch →</button>
          </form>
          {err && <p role="alert" className="mt-3 text-sm text-red-300">{err}</p>}
          <div className="mt-5 flex flex-wrap justify-center gap-2">{["facebook/react", "vercel/next.js", "pmndrs/zustand"].map((c) => <button key={c} onClick={() => go(c)} className="btn btn-ghost text-sm text-mute hover:text-ink">{c}</button>)}</div>
        </motion.div>
      </section>
      <section className="mx-auto max-w-5xl px-6 py-28">
        <h2 className="font-display text-3xl font-semibold">How it works</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">{steps.map(([a, b], i) => (
          <motion.div key={a} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * .12 }} className="glass p-6">
            <p className="font-display text-4xl text-accent">0{i + 1}</p><h3 className="mt-3 text-lg font-medium">{a}</h3><p className="mt-1 text-sm text-mute">{b}</p></motion.div>))}</div>
      </section>
      <footer className="border-t border-white/10 py-8 text-center text-sm text-mute">RepoCosmos · <a className="underline hover:text-ink" href="https://github.com">GitHub</a></footer>
    </main>
  );
}

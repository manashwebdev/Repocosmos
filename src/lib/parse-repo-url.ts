import { z } from "zod";
const schema = z.string().trim().min(3).max(200);
/** Accepts https://github.com/o/r(.git), github.com/o/r, or o/r. Returns null if invalid. */
export function parseRepo(input: string): { owner: string; name: string } | null {
  const p = schema.safeParse(input);
  if (!p.success) return null;
  const m = p.data.replace(/^https?:\/\//, "").replace(/^(www\.)?github\.com\//, "").replace(/\.git$/, "").replace(/\/+$/, "").split("/");
  if (m.length < 2) return null;
  const [owner, name] = m;
  const ok = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$/.test(owner) && /^[A-Za-z0-9._-]{1,100}$/.test(name);
  return ok ? { owner, name } : null;
}

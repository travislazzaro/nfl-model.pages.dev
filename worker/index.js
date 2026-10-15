// Family pick'em backend for the public site: serves the dashboard (static assets) and stores picks.
// Picks live in one Durable Object (SQLite storage, Workers free plan): one record per person per week,
// each pick stamped with the SERVER's time, so a pick made after kickoff never counts (the page grades by it).
import { DurableObject } from "cloudflare:workers";

const PLAYERS = ["Ronnie", "Owen", "Dad"];
const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
               "Access-Control-Allow-Headers": "Content-Type", "Cache-Control": "no-store" };
const json = (obj, status = 200) => new Response(JSON.stringify(obj), { status, headers: { "Content-Type": "application/json", ...CORS } });

export class PickStore extends DurableObject {
  async fetch(request) {
    const url = new URL(request.url);
    if (request.method === "GET" && url.pathname === "/api/picks") {
      const all = await this.ctx.storage.list({ prefix: "p:" });
      const picks = {};
      for (const [k, v] of all) picks[k.slice(2)] = v;
      return json({ picks, now: new Date().toISOString() });
    }
    if (request.method === "POST" && url.pathname === "/api/pick") {
      let b;
      try { b = await request.json(); } catch { return json({ error: "bad json" }, 400); }
      const { player, week, gid, k, v, ko } = b || {};
      if (!PLAYERS.includes(player)) return json({ error: "unknown player" }, 400);
      if (!/^\d{4}-\d{2}$/.test(week || "") || !/^\d{4}_\d{2}_[A-Z]{2,3}_[A-Z]{2,3}$/.test(gid || "")) return json({ error: "bad game" }, 400);
      if (!((k === "s" && (v === "home" || v === "away")) || (k === "t" && (v === "over" || v === "under")))) return json({ error: "bad pick" }, 400);
      const now = new Date();
      if (ko && !Number.isNaN(Date.parse(ko)) && now >= new Date(ko)) return json({ error: "locked" }, 409);
      const id = `${week}-${player}`;
      const rec = (await this.ctx.storage.get("p:" + id)) || { player, week, picks: {} };
      const p = rec.picks[gid] || {};
      p[k] = v; p["at_" + k] = now.toISOString();
      rec.picks[gid] = p;
      await this.ctx.storage.put("p:" + id, rec);
      return json({ ok: true, id, record: rec, now: now.toISOString() });
    }
    return json({ error: "not found" }, 404);
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/")) {
      if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
      const stub = env.PICKS.get(env.PICKS.idFromName("family"));
      return stub.fetch(request);
    }
    return env.ASSETS.fetch(request);
  },
};

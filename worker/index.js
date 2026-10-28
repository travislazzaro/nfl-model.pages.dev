// Cloudflare Worker for the public dashboard: serves the static page.
// The family pick'em was removed (Ronnie, Oct 27, 2026): /picks and /api/* are gone. The PickStore class stays only so
// Cloudflare keeps the stored family picks (removing it would need a migration that deletes them); nothing reads or
// writes it any more.
import { DurableObject } from "cloudflare:workers";

export class PickStore extends DurableObject {
  async fetch() { return new Response("gone", { status: 410 }); }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/picks" || url.pathname === "/picks.html") return Response.redirect(new URL("/", url).toString(), 301);
    if (url.pathname.startsWith("/api/")) return new Response("gone", { status: 410, headers: { "Cache-Control": "no-store" } });
    return env.ASSETS.fetch(request);
  },
};

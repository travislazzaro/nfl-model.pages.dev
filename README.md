# NFL model dashboard

The public copy of the Lussoro NFL model dashboard, served by Cloudflare (Worker "nfl-model-pages-dev") at https://nfl-model-pages-dev.ronnielazzaro.workers.dev.

`index.html` is rebuilt and pushed automatically by the model's scheduled runs (Sunday-night lock, Monday lock,
Thursday/Friday mid-week refresh, Saturday update and the Tuesday lab). Don't edit it by hand: the next run replaces it.

## Family pick'em

`worker/index.js` (configured in `wrangler.jsonc`) serves the page and a small picks service for the family pick'em
(Ronnie, Owen and Dad vs the model): `GET /api/picks`, `POST /api/pick`. Picks are stored in a Durable Object
(SQLite storage, free plan) and stamped with the server's time; a pick made after kickoff is refused and never counts.
Personal links: `/?p=owen`, `/?p=dad`, `/?p=ronnie`.

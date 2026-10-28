# NFL model dashboard

The public copy of the Lussoro NFL model dashboard, served by Cloudflare (Worker "nfl-model-pages-dev") at https://nfl-model-pages-dev.ronnielazzaro.workers.dev.

`index.html` is rebuilt and pushed automatically by the model's scheduled runs (Sunday-night lock, Monday lock,
Thursday/Friday mid-week refresh, Saturday update and the Tuesday lab). Don't edit it by hand: the next run replaces it.

## Family pick'em (removed Oct 27, 2026)

The pick'em section, the pick form (`/picks`) and its API are gone. `worker/index.js` now only serves the page; the
`PickStore` Durable Object is kept dormant so the stored picks aren't deleted.

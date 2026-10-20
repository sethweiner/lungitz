# Webflow custom code — source of truth

What **Site Settings → Custom Code** should contain, verbatim. Edit here first, then
paste into Webflow and publish. `static-site/export.mjs` compares the published blocks
against these files on every export and prints `⚠ custom code drift` when they differ.

| File | Webflow field | Notes |
|---|---|---|
| `site-head.html` | Head code | Landing gate (`html.lz-rest`, change in lockstep with `landingModal`), overlay rest, view transitions, participant-link rewrite, hover-prefetch speculation rules. |
| `site-footer.html` | Footer code | Production script tag. Bump `?v=NN` on every promote. |

Page-level custom code: only `/sandbox` (the sandbox loader). Never copy it to a real page.

Export-only transforms that remain (lungitz.com differs from webflow.io here, by design):
assets self-hosted + URLs rewritten, Google Fonts self-hosted, thumbnail `sizes`,
Webflow's generic 404 swapped for a plain fallback. See CLAUDE.md "Hosting".

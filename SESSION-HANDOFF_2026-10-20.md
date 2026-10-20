# Lungitz — handoff, 2026-10-20 (session end — LIVE ON LUNGITZ.COM, v94)

Read `CLAUDE.md` first. How to publish: `static-site/README.md`. Webflow round notes:
`MASTHEAD-CONTRACT.md` §16–17. SEO/findability: `SEO-FINDABILITY-PLAN.md`. Paste-ready
texts: `WEBFLOW-PASTE.md`. Previous handoff: `archive/handoffs/SESSION-HANDOFF_2026-07-28.md`.

**Next session (Seth's plan):** comb through the site, light edits in Webflow, then run
the publish again (below). Nothing is half-done; everything is committed and pushed
(`main` = `61e5cf3`, plus this log). Only Seth's untracked `assets/logos/` stays out of git.

## State at end of session

| | |
|---|---|
| lungitz.com | Netlify static export, deployed after every change today; DNS at Spaceship (A @ → 75.2.60.5, CNAME www → lungitz.netlify.app), Let's Encrypt cert, http/www → https://lungitz.com |
| Staging | lungitz.webflow.io, published today; site id `69e8e0cd2f30bc2f64a90a92` |
| Script | **v94 promoted** (`lungitz-interactions.js`, footer pin `?v=94`). Flow tests identical before/after on lungitz.com and offline |
| Site custom code | `webflow-custom-code/` = Webflow Site Settings head + footer, verified identical (the export warns on drift) |
| Offline copy | `static-site/offline/` (238 MB, git-ignored, in Dropbox), rebuilt after the last change; double-click `index.html` |
| Webflow MCP | signed into the Lungitz workspace (works) |

## To run it again after the edits

1. Webflow: **Publish** (webflow.io is enough).
2. `static-site/publish.sh "what changed"` — re-exports + deploys lungitz.com (~1 min).
3. `static-site/offline.sh` — rebuilds the offline copy (ships the production script now).
4. Check lungitz.com (hard reload). Claude can re-run the flow + reference checks
   (scratch scripts are per-session; the README lists what was verified).

## Done today (all verified)

- **Domain**: lungitz.com points at Netlify (records set in Seth's Spaceship tab).
- **Custom code as source of truth** (`webflow-custom-code/`), export drift check, README
  how-to, offline research → **offline copy built** (file://, full resolution, fonts
  embedded, no network). Route helpers in v94 + the site head make it work from disk.
- **SEO round** (via MCP + Seth by hand): titles/descriptions on all pages, `Meta
  description` field (46 entries seeded) bound on both templates, one H1 per page,
  canonical → lungitz.com, OG images (static pages by Seth; 43/45 entries filled with
  their first image — the 2 without are drafts), JSON-LD embeds valid on 45/45.
- **Participants**: artist ↗ links (own sites only, 9 live), Jürgen removed (external
  photographer; his two Bahnhof documentation entries have no author now).
- **Hideaways** sorted chronologically (`year-sort`).
- **Impressum**: privacy text final (Netlify named, DPA verified), media owner "Antoine
  Turillon & Seth Weiner, Vienna AT". **Resources**: the 12 core links (+ the full list
  of 53 in `RESOURCES-LINKS.md` for later).
- **Text fixes**: Giveaways description typos + editions trimmed; Bahnhofschronik
  descriptions match the title years (Volume 1 renamed "… (1935–1963)"); Judith
  Pirklbauer's German + English history texts de-run-together (formatting kept). The
  English entry was taken off draft so the fix publishes.
- **Walking tour map** only in Giveaways now: the duplicate Hideaways item is
  **archived** (restorable; its old URL 404s).
- **Page transitions OFF** by default (site head; `?vt=1/2/3` still opt in per tab).
- **Impressum logo jump fixed**: `.logo` + `.logo.zukunftsfonds` / `.logo.fdr`
  aspect-ratio combos reserve the space (CLS 0.025 → 0, sizes unchanged). Swap a logo
  file → update its combo's ratio.
- **Cursors** (`MASTHEAD-CONTRACT.md` §16) and the v94 `.is-standalone` guard.

## Seth's list (Designer / dashboard)

1. **JSON-LD url is doubled** ("…/giveaways//giveaways/posters"): in each template's
   embed, delete the typed `/giveaways/` and `/hideaways/` before the Slug chip.
2. **`.is-standalone`**: add the combo on `.header-accordion` on both entry templates
   (optionally with the arrow cursor). Until then v94's no-collapse fix is inert.
3. **`.title` cursor**: the published CSS still merges a `cursor: pointer` into `.title`
   that the API can't see — check the Style panel.
4. Optional cleanup: the empty `Image` class (unused now); duplicate featured-image
   assets the CMS writes created in the Assets panel; `.thumb-hover` backdrop-filter
   (never visible, costs paint).
5. Still unstyled from earlier rounds: `.immersive-image.is-loading` (blur while the
   lightbox sharpens), `.is-active-key` (arrow-key press flash).

## Decisions still open

- **Resources**: delete the copied legal blocks left on the page? Add a one-line
  content note (several linked pages describe human remains)?
- **Hideaways within one year**: currently reverse order (sort can't use created-on).
  Alphabetical as a second sort?
- **Export cleanup** (`LZ_CLEANUP=1`: no jQuery/Webflow JS, minified script, pruned CSS)
  — verified identical on a preview since 2026-10-16; add to `publish.sh` once approved.
- Optional: a Netlify redirect `/hideaways/walking-tour-map` → `/giveaways/walking-tour-map-2023`.
- Ziegelwerk stays a draft (decided) — its last published version stays public.

## Claude's next steps (after the comb-through + publish)

- Re-audit (titles, descriptions, og:image, canonical, JSON-LD on every page).
- **Google Search Console** (Domain property, DNS TXT at Spaceship, submit sitemap) and
  **Bing** import — needs Seth's Chrome signed in to Google.
- Safari test of the offline copy (double-click; not yet done).
- Phase 5 of `SEO-FINDABILITY-PLAN.md` (partners/participants linking back) when Seth wants.

# Lungitz — publishing & export how-to

lungitz.com is a **static copy** of the site you build in Webflow. Webflow is where
everything is authored; this folder turns the published Webflow site into plain files
and puts them on Netlify.

```
Webflow Designer ──publish──▶ lungitz.webflow.io ──export.mjs──▶ dist/ ──netlify deploy──▶ lungitz.com
   (you edit)                  (staging, Webflow)     (crawl + copy)    (files)                (public)
```

Nothing you publish in Webflow reaches lungitz.com until the export runs.

---

## 1 · Everyday: publish a content or design change

1. Make the change in the Webflow Designer / CMS.
2. **Publish** in Webflow (to the webflow.io subdomain is enough).
3. Check it on <https://lungitz.webflow.io>.
4. From the repo root:

   ```bash
   static-site/publish.sh "what changed"
   ```

   The message is optional; it labels the deploy in Netlify.
5. Check <https://lungitz.com> (hard reload: ⌘⇧R).

`publish.sh` is just two steps: `node export.mjs` (rebuild `dist/`), then
`netlify deploy --prod --dir dist`. A re-export takes about a minute; only new images
download, everything else comes from the cache in `dist/`.

### What to look for in the output

| Line | Meaning |
|---|---|
| `page /…` | each page it found and copied |
| `skip 404 /…` | a link points at a page Webflow doesn't serve — check the link |
| `asset 404 https://…` | a file Webflow references is gone (usually a deleted image still bound somewhere) |
| `⚠ custom code drift: …` | Webflow's Site Settings custom code ≠ `webflow-custom-code/` — see §3 |
| `N pages · N assets downloaded · N cached · N stale files pruned` | summary |
| `Deploy is live!` + `Production URL: https://lungitz.com` | done |

If the deploy step fails with an auth error: `netlify login` (opens the browser),
then run `publish.sh` again.

### Checking a change before it goes public

Build to a scratch folder and deploy a **draft** (a private preview URL, production
untouched):

```bash
LZ_OUT=/tmp/lz-preview node static-site/export.mjs
```

```bash
netlify deploy --site lungitz --dir /tmp/lz-preview --alias preview
```

The preview lives at `https://preview--lungitz.netlify.app`.

---

## 2 · Script changes (the interactions script)

The behaviour layer is `lungitz-interactions.js` (repo root), served from GitHub Pages
(`sethweiner.github.io/lungitz/`) for webflow.io, and copied into `dist/js/` for
lungitz.com.

1. Copy the current build to `sandbox/vNN.js` (next number) and edit there.
2. Push, wait ~45 s for GitHub Pages, test on `https://lungitz.webflow.io/sandbox?v=NN`
   — in a **cold session** (private window) for anything to do with arrival.
3. Optional: preview it on Netlify without promoting —
   `LZ_OUT=/tmp/lz-vNN LZ_SCRIPT=sandbox/vNN.js node static-site/export.mjs`, then a
   draft deploy as above.
4. **Promote**: copy to `lungitz-interactions.js` keeping the production header (the
   `/sandbox` bail and the `window.__lzLoaded` guard), commit, push.
5. **Bump the pin**: change `?v=NN` in `webflow-custom-code/site-footer.html`, paste it
   into Webflow → Site Settings → Custom Code → Footer, publish Webflow.
6. `static-site/publish.sh "promote vNN"`.

A promote is only finished when all of push + pin + Webflow publish + publish.sh have
happened. On lungitz.com the pin doesn't matter (the local copy is re-checked every
visit) but webflow.io visitors keep the old build until it changes.

---

## 3 · Site custom code (head & footer)

`webflow-custom-code/` at the repo root is the **master copy** of what Webflow's
Site Settings → Custom Code should contain:

| File | Webflow box |
|---|---|
| `site-head.html` | Head code — landing gate, overlay rest, view transitions, prefetch rules |
| `site-footer.html` | Footer code — the production script tag and its `?v=` pin |

To change either: edit the repo file → commit → paste the **whole file** into the
Webflow box (replacing everything) → publish Webflow → `publish.sh`. Each export
compares the two and prints `⚠ custom code drift` if they've diverged — then either
paste the repo file into Webflow, or, if the Webflow edit was the right one, copy it
back into the repo file.

The head gate mirrors `landingModal` in the script — change them together.

Page-level custom code exists only on `/sandbox`. **Duplicating a page duplicates its
custom code**: after any duplicate, check the new page's footer block.

---

## 4 · What the export does (and where lungitz.com differs from webflow.io)

`export.mjs` (Node 20+, no dependencies):

1. **Crawls** `lungitz.webflow.io` from `/`, `/participants`, `/impressum`,
   `/resources`, following internal links. **Entry pages** are found from the
   `data-slug` attributes in Home's two columns (`.wrapper-content.is-left` =
   giveaways, `.is-right` = hideaways), because entry links publish as `#`. A new
   collection, or moving a column, needs a matching change in `homeEntrySlugs()`.
2. **Skips** dev pages: `/sandbox`, `/v1`, `/archive/*`, `/home-*`, `/menu-entries`
   (same list as `robots.txt`). New scratch pages → add them to `EXCLUDE`.
3. **Self-hosts every asset** and rewrites the URLs:

   | From | To |
   |---|---|
   | `cdn.prod.website-files.com` (images, all srcset sizes, CSS, Webflow JS) | `/cdn/` |
   | jQuery (cloudfront) | `/vendor/` |
   | Google Fonts | `/fonts/fonts.css` + woff2 files |
   | `sethweiner.github.io/lungitz/` (the script) | `/js/` |

   So lungitz.com keeps working even if the Webflow plan lapses.
4. **Export-only changes** (the only intentional differences from webflow.io):
   - thumbnail `sizes` right-sized per image strip (Webflow ships `100vw`, so ~85 px
     thumbs downloaded 1080–3200 px files). `LZ_THUMB_SIZES=0` turns it off. Never
     use `sizes="auto"` — it stretches the thumbs (see CLAUDE.md).
   - Webflow's generic 404 → a plain Lungitz fallback, until a 404 page is designed in
     Webflow (then that one is used automatically).
   - `lungitz.webflow.io` → `lungitz.com` in the HTML (incl. social-image URLs).
   - hover-prefetch rules injected only if the site head lacks them (it carries them
     once `site-head.html` is pasted).
5. Writes `sitemap.xml`, copies `public/` (`robots.txt` — search + AI retrieval
   allowed, training crawlers blocked; `_headers` — year-long caching for `/cdn/`,
   `/vendor/`, `/fonts/`), and **prunes** files no page uses any more.

### Options (environment variables)

| Variable | Effect |
|---|---|
| `LZ_OUT=<dir>` | write somewhere other than `dist/` (previews) |
| `LZ_SCRIPT=<file>` | ship that file as the interactions script (sandbox preview) |
| `LZ_THUMB_SIZES=0` | keep Webflow's `sizes="100vw"` |
| `LZ_CLEANUP=1` | strip jQuery + Webflow JS, minify the script, prune unused `w-` CSS. Verified identical on a preview; **not yet in `publish.sh`** — add it there once approved. |

---

## 5 · Offline copy (double-click, no server)

A folder that opens straight from disk in any browser: every page, every image at
its original resolution plus all size variants, fonts embedded, nothing loaded from
the internet (only links to participants' and partners' sites point online).

```bash
static-site/offline.sh
```

Output: `static-site/offline/` (~230 MB, git-ignored), with a `README.txt` for whoever
receives it. Open `index.html`. Copy the whole folder: pages, `cdn/`, `fonts/` and
`js/` belong together. Rebuild it after content edits, like `publish.sh`.

How it differs from the lungitz.com build (`LZ_OFFLINE=1` in `export.mjs`):
pages are files (`participants.html`, `giveaways/<slug>.html`) and every URL is
relative to the page; `<meta name="lz-root">` tells the script and the site head where
the folder's top is; `js/entry-order.js` carries the prev/next order (a page can't
`fetch` another file from disk); fonts are `data:` URIs (Firefox blocks font files from
a parent folder); SRI/`crossorigin` attributes are dropped (Chrome blocks those on
`file://`); Webflow JS and jQuery are left out; the script stays unminified; the site
custom code comes from `webflow-custom-code/`.

**Needs v94+** (the route helpers; promoted 2026-10-20). The export warns if the
script it ships is older.

Verified 2026-10-20 from disk in headless Chrome 155 and Firefox 158: cold greet +
dismiss, participant name → index with that entry open, LUNGITZ menu, `?menu=1`,
realm words → `#info-…`, entry prev/next, lightbox opens the 2400 px original, Esc
closes; same results as lungitz.com, no console errors; every one of 2,674 local
references exists (except Webflow's empty-image placeholder, which Webflow refuses to
serve — on lungitz.com too). Safari not yet tested.

`LZ_REPO_CODE=1` (normal build) ships `webflow-custom-code/` instead of what Webflow
published: a way to preview custom-code changes before pasting them.

---

## 6 · Hosting & domain

- Netlify project **`lungitz`** (`static-site/.netlify/state.json` links this folder to
  it). Also reachable at `lungitz.netlify.app`.
- DNS at **Spaceship** (Advanced DNS for lungitz.com): `A @ → 75.2.60.5`,
  `CNAME www → lungitz.netlify.app`. No email records exist on the domain. Switched
  2026-10-20.
- HTTPS: Let's Encrypt via Netlify, auto-renewing; http and www redirect to
  `https://lungitz.com/`.
- Netlify's badge/HUD is off (`built_with_badge_enabled: false`).
- `dist/` is git-ignored and Dropbox-ignored; it's the asset cache. Deleting it is
  safe — the next export re-downloads everything (~200 MB).

## 7 · Troubleshooting

| Symptom | Likely cause |
|---|---|
| Change visible on webflow.io, not on lungitz.com | `publish.sh` not run yet, or browser cache — hard reload |
| Change not on webflow.io either | Webflow not published (or published to the wrong domain) |
| A new entry is missing on lungitz.com | it isn't rendered in Home's columns with `data-slug` — the crawler only finds entries there |
| `⚠ custom code drift` | §3 |
| Old script behaviour on webflow.io | footer pin not bumped (§2 step 5) |
| Images missing on lungitz.com but fine on webflow.io | look for `asset 404` lines in the export output |
| `netlify: command not found` | `npm install -g netlify-cli` |

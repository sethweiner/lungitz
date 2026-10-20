# Offline Lungitz — research (2026-10-20)

Goal: a copy of the site that runs with **no internet and as few external
dependencies as possible**: for an exhibition kiosk, a USB stick, an archive deposit,
or a hand-off to the commissioner.

## Starting point: the export is already almost there

Measured on the current `dist/` (50 pages, 810 files, ~198 MB):

- **Runtime calls to other hosts: none.** Images, CSS, fonts, jQuery and the
  interactions script are all self-hosted. The only remaining reference is
  `webflow.com` inside Webflow's own JS chunk (the "Made in Webflow" badge code), which
  `LZ_CLEANUP=1` already strips along with jQuery.
- Outbound content links (participant websites, Zukunftsfonds, dsb.gv.at) are just
  links. Offline they fail when clicked, as any link would.
- So **served over HTTP, `dist/` already works offline.** The real problems are
  (a) it assumes a web server with "pretty URLs", and (b) its size.

What breaks if you just double-click `index.html` (`file://`):

| Dependency | Where | Why it breaks on `file://` |
|---|---|---|
| Root-absolute URLs (`/cdn/…`, `/fonts/…`, `/js/…`) | every page: 179 `src`, ~10 `href` on Home alone | `/` = the disk root, not the site folder |
| Extensionless page links (`/participants`, `/giveaways/<slug>`) | nav, entry links | Netlify maps `/x` → `x.html`; the file system doesn't |
| `fetch('/')` for entry prev/next order | script, `wireEntryNav` (~l. 2266) | browsers block `fetch` of `file://` URLs |
| `location.pathname` regexes (`/^\/(giveaways\|hideaways)\//`) | script ~l. 2223, 3037; head code | on disk the path is `/Volumes/…/giveaways/x.html` |
| Participant-link rewrite → `location.href = '/?entry=…'` | site head code | same root problem |
| `@view-transition` page transitions | site head | need a same-origin site; on `file://` they just don't play (harmless) |
| Speculation-rules prefetch | site head | ignored on `file://` (harmless) |
| `@font-face` from `../fonts/` | entry pages in `giveaways/`, `hideaways/` | Firefox restricts file-URL font loads to the page's own folder; Chrome allows it (**verify in a prototype**) |
| `sessionStorage` (landing seen-flag, entry order cache) | script, head gate | works in Chrome on `file://`; Safari/Firefox treat each file as its own origin, so the greet may replay per page (**verify**) |

## Option A: local web server copy (recommended)

**Zero changes to the script or the Webflow head code.** Ship `dist/` plus a way to
serve it on `http://localhost`.

Export changes (an `LZ_OFFLINE=1` mode, writing to its own folder):

1. **Folder-style pages** so *any* static server resolves pretty URLs:
   `participants.html` → `participants/index.html`,
   `giveaways/<slug>.html` → `giveaways/<slug>/index.html`. The script's entry regex
   already accepts a trailing slash (`\/?$`).
2. `LZ_CLEANUP=1` on (no jQuery/Webflow JS, minified script).
3. **Image diet** (optional, see below).
4. Drop `sitemap.xml`, `robots.txt`, `_headers`, the canonical domain rewrite.
   Not needed offline.

Serving it, from fewest to most dependencies:

| Server | Needs | Notes |
|---|---|---|
| `python3 -m http.server 8000` | Python 3 (on macOS after installing Command Line Tools; most Linux) | one command; fine for a kiosk |
| A single small static-server binary on the stick (e.g. `miniserve`, `darkhttpd`, Caddy) | nothing installed | one file per OS (mac arm/intel, Windows) beside the site; double-click a `start` script that runs it and opens the browser |
| `npx serve` | Node | handles `.html` mapping itself, so step 1 is optional |

Kiosk: Chrome/Chromium `--kiosk http://localhost:8000` gives full-screen, no browser
chrome. View transitions, prefetch and sessionStorage all behave exactly as on
lungitz.com, because it *is* an ordinary http origin.

**Effort:** small, about a day including a launcher script and testing. Risk: low, since
the runtime code is identical to production.

## Option B: double-click `file://` copy (no server at all)

The truest "no dependencies" form: a folder you open in any browser. It costs more,
and it touches code that must stay in lockstep.

Export-side (mechanical, safe):

1. Rewrite every root-absolute URL to a **relative** one per page depth
   (`/cdn/x` → `cdn/x` on Home, `../cdn/x` on entry pages) in HTML, inline styles,
   srcset, and the footer loader string.
2. Rewrite page links to real files: `/participants` → `participants.html`,
   `/giveaways/x` → `giveaways/x.html`, `/?menu=1` → `index.html?menu=1`,
   `/#info-giveaways` → `index.html#info-giveaways`.
3. **Fonts**: inline the two families into `fonts.css` as `data:` URIs (~500 KB, once),
   which removes the Firefox folder rule. Alternatively flatten all pages to one folder.
4. **Bake the entry order into each entry page** (e.g. a `data-entry-order` attribute
   or a small `order.js` loaded with `<script>`, which works on `file://`) instead of
   `fetch('/')`.

Code-side (needs a sandbox round + Seth's OK, since it changes the script and head gate):

5. Path detection that tolerates a prefix and `.html`: match
   `/(giveaways|hideaways)/([^/]+?)(\.html)?/?$` at the *end* of the pathname rather
   than from `/`. Both the script and the head code's participant rewrite.
6. Build URLs from a computed site root (`new URL('.', document.baseURI)` on Home,
   `'../'` on entries) instead of literal `'/'`, for `?entry=` returns and the `fetch`.
7. Accept that view transitions won't play and that Safari/Firefox may re-greet per
   page (or, offline only, skip the greet after the first page).

**Effort:** 2–4 days plus cross-browser testing (Chrome, Safari, Firefox on
`file://`). Risk: medium, since steps 5–6 are behaviour changes in production code.
Keep them behind `location.protocol === 'file:'` so lungitz.com is untouched.

## Option C: "works offline after a visit" (PWA)

A service worker on lungitz.com that caches pages and images as they're viewed (or
precaches the text + thumbnails). This is a different goal: it suits returning visitors on
flaky connections, not an archive or a kiosk. Service workers need https or
localhost, never `file://`. Mentioned for completeness. Not recommended now.

## Size: the image diet

`dist/cdn/` by file type:

| Files | Size | Used for |
|---|---|---|
| 136 originals (mostly JPEG) | 89 MB | the lightbox's "full" image (the thumb's `src`) |
| `-p-2000`, `-p-2600`, `-p-3200` variants | 46 MB | large/retina screens |
| `-p-1600` | 29 MB | |
| `-p-1080`, `-p-800` | 30 MB | |
| `-p-500` | 4.6 MB | thumbnails |

The lightbox opens the thumb's `src`, the **original upload**. An offline build can
keep `-p-500` + `-p-800` (thumbs) and `-p-1600` (lightbox), point each thumb's `src` at
its `-p-1600` (or the original when an image has no variants), trim `srcset` to
match, and drop the rest: **~45–50 MB instead of ~198 MB**, sharp on a 1080p kiosk
screen. Keep `-p-2000` too (~85–90 MB) if the target is a retina laptop. A full
archival copy would keep everything.

## Recommendation

1. **Build Option A first** (`LZ_OFFLINE=1`: folder-style pages, cleanup on, image
   diet as a flag) plus a `start` launcher with a bundled static-server binary. It
   gives a working offline copy with no installs and no change to production code.
2. Do **Option B only if** the copy must open by double-click on machines where you
   can't run anything (an archive deposit, a library terminal). It's export work plus one
   sandbox round on the script and head gate, guarded to `file://`.
3. Whichever form, regenerate it from the same export after content edits are done,
   so the offline copy and lungitz.com come from one source and can't drift.

Open questions for Seth: who and what is the offline copy for (kiosk, archive,
hand-off)? Which browsers and OSes must it run on? Full-resolution originals, or
screen-sized?

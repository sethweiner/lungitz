# Lungitz — Working Agreement (read before ANY action)

This is a **Webflow project**. Webflow is the source of truth; code is a thin
behavior layer. Violating this is the #1 recurring failure — do not repeat it.

## The rules (Seth's, hard-won 2026-07-25)

1. **Links are the truth.** Navigation semantics live on real Designer links
   (`/#info-giveaways`, `/?menu=1`, page links). NEVER strip, bypass, or
   preventDefault-away a Designer link's meaning. The script only SMOOTHS
   links in place (glide instead of reload when the target is on-screen;
   toggle instead of reload on the index) and always yields otherwise.
2. **Elements, classes, and props live in Webflow.** Never build UI in JS,
   never inject visual styling (only: audit-blocked motion like grid-rows
   transitions, descendant selectors Webflow can't author, FLIP math —
   each one recorded in MASTHEAD-CONTRACT.md).
3. **Speak Seth's state classes** (`.is-active`, `.is-viewing`,
   `.is-expanded`…). NEVER invent a state name — if a state is missing, ask
   him to create it, named his way. Both states of everything must be
   stylable on the canvas.
4. **Components carry props.** When creating/transforming a component, wire
   link/text props immediately (transform_element_to_component creates NONE —
   add them or the component is dead weight in the properties panel).
5. **Wireframe-first**: Seth builds, code wires. Ask before any code-side
   experiment that touches the canvas. One behavior per round, verified on
   the live URL before the next.
6. **MCP gotchas that bite**: shared-modifier combos collapse (never
   create/update a combo whose modifier name already exists elsewhere, e.g.
   `is-open`); pages duplicated from Home may carry hidden index copies
   (`container-content.hide`) — index detection must use visible columns;
   element `id` attr is set via set_dom_id, not set_attributes;
   **binding `text` on a WRAPPER element (Link, Block) DESTROYS its child
   elements irreversibly** — bind text only on leaf text elements (Heading,
   Paragraph) that own their styling; link bindings on Links are safe.

## Current architecture (v32, promoted 2026-07-25)

- **"Landing Modal" component IS the masthead** (`bdb90549-…f22`): rest =
  word row (`.container-landing`), expanded = landing/menu (`.is-active`).
  Session-gated greet; `?menu=1` opens it on arrival; LUNGITZ toggles it.
  Props wired: 6 links + 6 labels + landing text.
- **"Immersive Overlay" component** (`10f6d3e0-…72c`) = fullscreen view;
  `.is-viewing` = open; growth in/out FLIP; browser Back closes.
- Both instanced on: Home, Giveaways/Hideaways templates, menu pages.
  The old Masthead + container-landing-modal components are unregistered.
- Script: `lungitz-interactions.js` (repo root) ← promoted from
  `sandbox/v34.js`. Deploy = git push → GitHub Pages (~45s). Sandbox testing:
  `/sandbox?v=N`. Site publish via MCP to the webflow.io staging subdomain; the
  public site is the Netlify export (see "Hosting" below).
- **Custom code lives in three places.** SITE **head** = the `html.lz-rest`
  landing gate (v35) — the only code that runs before first paint; it mirrors
  `landingModal`'s show/rest rule and **must be changed in lockstep with it**.
  SITE **footer** = the production script tag (loads everywhere). PAGE footer =
  the sandbox loader, on `/sandbox` ONLY — never copy it onto a real page:
  sandbox builds carry no `__lzLoaded` guard, so alongside production they
  double-bind every handler. It had been duplicated onto /participants
  /impressum /resources (they were duplicated from a page that had it) and 404'd
  on every view; cleared 2026-07-26. **Duplicating a page duplicates its custom
  code — check the footer block after any duplicate.**
- **Arrival state is a pre-paint problem, not a motion problem.** Webflow ships
  `.container-landing` already `.is-active` everywhere; the script loads async,
  after paint. Anything it has to *correct* is visible — animated it reads as a
  jump, instant it reads as a flash. Fix the paint (the head gate), never the
  timing of the correction. Learned the hard way 2026-07-26.
- Ownership ledger: `MASTHEAD-CONTRACT.md` (v32 section; above it is
  historical). Site id `69e8e0cd2f30bc2f64a90a92`.

## Hosting — Netlify at lungitz.com (since 2026-10-16)

Webflow is still the **authoring** tool; lungitz.com is a **static export** of the
published webflow.io site, hosted on Netlify (project `lungitz`, id `4962457f-…a856`,
also at lungitz.netlify.app). DNS stays at Spaceship (apex A → 75.2.60.5, www CNAME →
lungitz.netlify.app).

- **Publish = Webflow publish, then `static-site/publish.sh`** (re-exports + deploys).
  Nothing reaches lungitz.com until the export runs.
- `static-site/export.mjs` crawls lungitz.webflow.io, self-hosts every asset (Webflow
  CDN images incl. srcset variants → `/cdn/`, jQuery → `/vendor/`, Google Fonts →
  `/fonts/`, this script from GitHub Pages → `/js/`), writes `sitemap.xml`, copies
  `static-site/public/` (robots.txt = the retrieval-yes/training-no policy, `_headers`).
  Output `static-site/dist/` is git-ignored and Dropbox-ignored; it doubles as the asset
  cache, so re-exports only download new files.
- **Entry pages are seeded from Home's `data-slug` columns**, not crawled — entry links
  publish as `#`. A new collection or a moved column needs a matching change there.
- Excluded from export: `/sandbox`, `/v1`, `/archive/*`, `/home-*`, `/menu-entries`.
- **Export-only transforms** (lungitz.com differs from staging here — keep the list
  current): a hover-prefetch `speculationrules` script (skipped once the site head
  carries one — it belongs in the Webflow site head); Google Fonts self-hosted; the
  Webflow generic 404 swapped for a plain fallback. Netlify's injected badge/HUD is
  off (`built_with_badge_enabled: false` on the site).
- **Thumbnail `sizes` — SHIPPED with v93 (2026-10-16), calc-only.** Webflow ships `sizes="100vw"` on
  ~85px thumbs, so they fetch 1080–3200px files (home ≈ 99 MB on a 2× laptop vs ≈ 9 MB
  right-sized). `sizes="auto"` BROKE the look: Webflow writes `width="Auto"` and no
  height, so Chrome lays the img out at the 300×150 default and `object-fit: fill`
  stretched 90×60 thumbs to 90×150. A per-strip `calc()` WITHOUT `auto` keeps layout
  identical (measured, 6 strips) — but the lightbox seeds from the thumb's decoded
  variant, so smaller thumbs = a soft-then-sharp lightbox open. The big thumbs were
  silently paying for an instantly sharp lightbox. `fixThumbSizes` is the export DEFAULT
  since v93 (`LZ_THUMB_SIZES=0` turns it off). Blur combo still Seth's to style.
  **Sandbox v92** preloads the full file on hover intent
  (120ms) / press and warms ±1 on open; paintDetail paints the full file directly
  when ready. Preview = Netlify draft `https://v92-preview--lungitz.netlify.app`
  (built with `LZ_OUT=<tmp> LZ_THUMB_SIZES=1 LZ_SCRIPT=sandbox/v92.js`). Verified in
  Seth's Chrome: 170/170 thumb rects identical to production at the same width;
  hover→open paints the 2400px file in ONE paint (no seed frame); arrows likewise.
  Touch has no hover, so on phones a multi-image strip still opens on the seed and
  sharpens. The webflow.io /sandbox page can't show this (sizes is export-side).
  **v93** (Seth on v92: "the images pixelate as they load… add a blur"): the seed
  frame wears SETH-NAMED `.is-loading` on `.immersive-image`, removed after the full
  file decodes into the overlay; never set when the full file was preloaded.
  Verified (cold cache): +is-loading at 12ms on the -p-500 seed, full at 2.7s,
  -is-loading 0.2s later; warmed neighbour = full painted directly, no class.
  Preview `https://v93-preview--lungitz.netlify.app`. The blur is Seth's Designer
  combo (`.immersive-image.is-loading` filter: blur + a filter transition on the
  base) — the script styles nothing.
  **The accordion "ratchet" is mostly this too** (measured in Seth's Chrome,
  2026-10-16, worst frame per first open): production 150/117/484/100 ms — the
  accordion reveals lazy thumbs that then decode 1080–5616px files on the main
  thread; v93 preview 18/33/18/17 ms. Second set: prod 34/83/133/50/50, preview
  33/18/17/150/18 (the 150 = Posters, a single image legitimately shown ~684px wide).
  `.thumb-hover`'s `backdrop-filter: blur(16px)` sits under an opaque fill and snaps
  to `blur()` on hover — never visible, yet computed for all 170 veils; turning it
  off helped only slightly (150→99 ms). Designer cleanup, not a fix.
  **v93 PROMOTED 2026-10-16** (shipped alone; the cleanup is a later round). The
  webflow.io footer pin `?v=93` is Seth's hand edit (connector on the wrong workspace).
- **Export cleanup (`LZ_CLEANUP=1`) — built + verified, preview only (2026-10-16).**
  Strips jQuery + Webflow's JS (no widgets/IX2 on any page; only CSS hooks), minifies
  the SHIPPED script copy with terser (200 → 43 KB; source stays commented), prunes
  CSS selectors needing unused `w-` classes into `/css/site.<hash>.css` (351 dropped,
  96 → 67 KB). Preview `https://cleanup-preview--lungitz.netlify.app` (v93 + cleanup;
  carries a test-only `/_test-original.css`). Verified: computed style of EVERY
  element (incl. ::before/::after) identical to Webflow's CSS — home rest/menu/
  accordion/lightbox @1024, home + entry @375, entry @1024, participants, resources:
  0 diffs. Behaviour smoke test all pass (greet, dismiss, LUNGITZ, + drawers,
  accordion, lightbox open/arrow/Esc, entry nav, participants rewrite); no new console
  errors. Measured in Seth's Chrome: JS 106 → 13 KB, CSS 16 → 12 KB per first visit;
  desktop timing unchanged within noise (the gain is phones + first visits).
  Ships with v93: add LZ_CLEANUP to publish.sh once Seth approves.
- The `?v=NN` footer pin now only matters for webflow.io staging; on lungitz.com the
  script is a local file revalidated every visit. Promote is still: push → wait for
  GitHub Pages → bump pin + publish Webflow → **publish.sh**.

## When editing the script

**Never read `location.search` / `location.hash` for an arrival decision** — read
`INITIAL_SEARCH` / `INITIAL_HASH` (captured at script start). Modules clean up
after themselves with `replaceState` (`arrive()` drops `?entry=`, `landingModal`
drops `?menu=1`), and those same flags are how *later* modules decide what to do,
so whoever runs second sees a URL the first one already erased. That is exactly
how a participant-name click opened an entry and then greeted the reader over it
(v36). Test arrival flows in a **cold session** — `seen=1` masks this whole class
of bug.

Edit `sandbox/vNN.js`, test on `/sandbox?v=NN`, then promote by copying to
`lungitz-interactions.js` with the production header (the `/sandbox` bail +
`window.__lzLoaded` guard — see current file head). Never push untested code
straight to the production filename.

**Promote step 2 — BUMP THE CACHE PIN (T-10, pinned 2026-07-26).** The SITE
FOOTER custom code loads the script with a **pinned** `?v=NN` (no more
`Date.now()`, which re-downloaded ~106KB every navigation). The pin is the cache
key: after every promote, edit the site footer (MCP `data_scripts_tool` →
`set_site_freeform_code`, location `footer`) to the new build number and publish
the site — **or visitors keep running the previous build indefinitely**. A
promote is not live until git push AND pin bump AND site publish have all
happened. Verify with `?lzdebug=1` (panel shows the build) on a hard reload.

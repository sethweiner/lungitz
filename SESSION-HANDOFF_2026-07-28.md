# Lungitz — Session Handoff, 2026-07-28

**Read CLAUDE.md first** (working agreement — Webflow-first, links are the truth,
measure before touching). Deep history: `SESSION-HANDOFF_2026-07-26-NIGHT.md` and
`MASTHEAD-CONTRACT.md` (§8 = current contract). This handoff is the resume point
for the **final content + polish + full-publish round**, expected a few weeks out.

## Where things stand

- **Script: v88 LIVE** (pin `?v=88`) on the staging subdomain (lungitz.webflow.io).
  v85/86 (2026-07-27): entry open/close + the + drawers run their Designer motion
  at every width (≤767 block is caption-drawer-only). v87: lightbox labeled-slot
  drawer (`data-detail` paints, hide-empty wrappers, real external link — contract
  §15). v88: cursor-as-navigation (image outer thirds = cursor ←/→ + click
  prev/next, middle keeps click-zoom, touch swipe untouched; fs-nav edge zones
  retired). Production file: `lungitz-interactions.js`. Promote flow = git push +
  **footer cache-pin bump** (MCP `data_scripts_tool` → `set_site_freeform_code`,
  location `footer`) + site publish — a promote is not live until all three
  happened. Verify with `?lzdebug=1` on a hard reload.
- **Open Seth decisions from the v87/88 round:** "Photo" label vs self-describing
  credits; cursor art as Webflow assets; a Seth-named state class for the
  key-press flash (a11y round pending).
- **T-15 RESOLVED (2026-07-28).** All 129 API-uploaded CMS thumbnails were
  re-uploaded through the Designer CMS UI (automated), so every real thumbnail now
  publishes the full responsive srcset ladder (500→2000px + untouched original).
  Measured: the 9-thumb karl entry went **5,734 KB → 787 KB** on a phone (7.3×).
  Full mechanics + gotchas are in the T-15 entry of the 07-26-NIGHT handoff and in
  auto-memory. Key operational facts that outlive the ticket:
  - Only the **CMS-UI upload path** generates variants for CMS images. The Data
    API cannot, and Designer Cmd+Shift+I re-scan does NOT backfill CMS-bucket
    files (it only touched Assets-panel copies).
  - **srcset is written at SITE publish only** — publishing an item alone ships a
    bare `<img>`. Any future CMS image work: finish with a site publish.
  - New images added later: upload them **in the Designer/CMS UI**, never via
    API/CSV, or they'll ship variant-less again. Verify any new image by probing
    its `-p-500` URL (200 = good, 403 = bare).
- **Git:** this work lives on branch `claude/angry-almeida-74a292` (worktree).
  Latest commits: T-15 diagnosis + resolution handoff updates. Merge to `main`
  when convenient — no code changed, docs only.

## Open — Seth's Designer pile (unchanged from 07-26)

- Lay out + style `caption-name` / `caption-edition` in the overlay. **The first
  two paragraphs in `.caption-content` are script mount points** (image caption,
  credit + `.fs-count`) — move them freely but tell the code session so it
  re-points; deleting them empties the lightbox captions. Third paragraph
  ("Credit") = stray, delete freely.
- Retire the per-entry `.detail-view` block + children (dead since the ladder cut).
- T-11: move the ≤767px `.wrapper-content.is-left/.is-right { overflow: visible }`
  head override into the Designer by hand, then delete that head block ONLY (the
  canvas/color-scheme head blocks stay — code-owned forever).
- Untoggle `is-viewing` on the overlay component when done styling (cosmetic).
- Restyle `.is-pending` / `.is-realm` states if the baselines aren't final.
- **Design question (not a bug):** entries with many images lay the whole thumb
  strip in ONE row at phone width (~19px thumbs), so lightbox-close reads as
  shrink-to-a-sliver. Only a layout decision changes it (e.g. wrap the strip at
  small widths). Seth's call.
- Optional T-15 polish: published `sizes` is Webflow's fallback `100vw`. A
  Cmd+Shift+I re-scan + site publish may write measured per-breakpoint values
  (phones would then pick even smaller variants). Nice-to-have, win already banked.
- Housekeeping: delete unused test asset `6a6883ed…giveaway-nordfassade-01.jpeg`
  from the Assets panel (left over from T-15 diagnosis, invisible to the site).

## Open — code-side crumbs

- **T-13:** keep or strip `?lzdebug` + flight recorder at sign-off (costs nothing
  unused).
- **T-14:** retire Menu Entries collection + `/menu-entries` template +
  `sandbox-landing` page once nothing binds them. Sandbox `vNN.js` ≤ v87 prunable
  (v88 = live).
- **T-05:** one final eye-check that phantom slivers are gone (none observed since
  the per-image reservation; Seth half-confirmed).

## Launch checklist (the actual publish round)

- Client texts: landing blurb, impressum/resources bodies.
- Ziegelwerk transparent-PNG flag.
- Findability go-live: **see `FINDABILITY-GO-LIVE.md`** (domain-gated steps —
  staging-index toggle, sitemap, per-entry SEO tokens are already wired).
- Re-measure nav speed on the real domain (the ~2s HTML was staging latency;
  today it measured 111 ms TTFB, so likely a non-issue — confirm once live).
- After connecting the custom domain: publish to BOTH targets, re-verify the
  cache-pinned script loads, and re-run the arrival flows in a **cold session**
  (`seen=1` masks arrival bugs — CLAUDE.md rule).

## Traps worth re-reading before touching anything

The "Traps that cost hours" section of `SESSION-HANDOFF_2026-07-26-NIGHT.md` still
applies verbatim (verify at t+2s; GitHub Pages propagation; same-frame transition
writes; backgrounded-tab artifacts; Webflow publishes canvas-toggled state; MCP
binding limits; hidden index copies on menu pages). New additions from T-15:

- A **hidden/minimized Chrome tab** stalls Designer uploads and times out CDP —
  any browser automation in Seth's Chrome needs the tab visible on screen.
- claude-in-chrome clicks are in **screenshot space** = CSS px × (screenshot
  width / `innerWidth`) — measure rects in JS, scale before clicking.
- Webflow's CMS uploader dedupes identical bytes server-side — a re-upload of the
  same file can silently no-op; salt the bytes (trailing junk after EOI) to force
  a fresh file.

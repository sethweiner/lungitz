# Lungitz — handoff, 2026-07-26 NIGHT (session end)

Read `CLAUDE.md` first, then `MASTHEAD-CONTRACT.md` (§2 code-owned rules; §11–§14 added
today). Script: `lungitz-interactions.js` = **v84**, footer pin **`?v=84`**.
(v84, morning 07-27: the v80–82 landing-pad stamp PERSISTED with wrong data — closing
onto a placeholder/unloaded thumb stamped its shape permanently, growing entries for
good; v84 restores the stamp when the flight lands. Also: the lightbox caption drawer
now fades with the bar at ≤767 — the transition-kill is scoped to the accordion's
drawers only. Revert of that feel = one rule in injectCSS, see contract.)
Site `69e8e0cd2f30bc2f64a90a92` · staging `lungitz.webflow.io`.
Previous handoff (`SESSION-HANDOFF_2026-07-26.md`) is historical — every ticket in it is
resolved or re-listed below.

**PROMOTE = THREE STEPS NOW (contract §12): push the script → bump the footer cache pin
(`?v=NN`, via MCP `set_site_freeform_code`) → publish the site.** A promote without the
pin bump serves stale script to every visitor.

## Debug / test surfaces (all opt-in, all session-sticky)

- `?lzdebug=1` — panel: build, MQ, pad, off_by, vt/ni armed state, last transition, trace.
- `?vt=0/2/3` — page-transition comparisons (0 = none, 2 = +persistent word row, 3 =
  +whisper-scale). Shipped default = vt=1 (CLOSE_EASE 500ms crossfade). Promoting another
  = one-line unguard in head CSS.
- `?ni=0/1/2` — navigation-cue comparisons (0 = off, 1 = link only, 2 = page dim).
  Shipped default = ni=3 (rust link + LUNGITZ pulse via `.is-pending`).

## Shipped and verified today (v61 → v78)

| what | the one-line truth |
|---|---|
| 1-col anchors dead / landing 68px low | Webflow's own `click.wf-scroll` was a second scroll authority — unbound (§11) |
| Uniform 3:2 thumbs (clobbered Seth's design) | REVERTED; v62 stamps each thumb with its own image ratio at warm — ragged heights are the design |
| Glide/expand ratchet at 1-col | per-frame %-paydown + a 520ms dead wait — re-eased in time on the shared tokens |
| Realm accent at 1-col | scroll-spy toggles Seth's `.is-realm` on the word under the masthead |
| Zoom exit unreachable (desktop) | a derived cap (`min(naturalScale,4)`) < 4 clamped forever — flat 4× restored (Seth's v17 decision) |
| State 3 (detail view) | CUT. Thumbnail → fullscreen direct: the `.immersive-image` itself FLIPs, uniform scale only, chrome fades — CLOSE_EASE 500ms (Seth's pick). Collapse returns to `detail.idx`'s thumb |
| "Right column animates differently" | was the retired single-image special-case (hideaways are 13/20 single-image) — ladder cut = the fix; `.is-left/.is-right` proven identical |
| Caption ◉ dead | pre-existing: `.is-collapsed` collapsed an empty grid row — descendant rule added (§2) |
| Overlay CMS wiring | overlay stays script-painted (a shared overlay cannot bind "current slide"; lists cap at 100 < 171 images). Per-image caption/credit = hidden `.thumb-caption`/`.thumb-credit` leaves in `.thumb-hover` (Image Sets Name + Credit-individual, filtered-Parent lists). Old `data-caption/credit` attributes REMOVED everywhere. New overlay leaves `p.caption-name` (contributors ", ") + `p.caption-edition` — unstyled, Seth lays out |
| Entry pages greeted + "wrong colors" | head gate now rests `/giveaways/*` + `/hideaways/*` pre-paint (`onRealIndex()` was true on templates); colors measured IDENTICAL to Home — the "off" was modal + flash |
| Script re-downloaded every nav | footer pin (was `Date.now()`) — ~180ms + 160KB saved per nav |
| Chrome white flash | TWO causes, two rounds: (1) white body canvas under dark containers → head paints ink; (2) **Chrome's own inter-document canvas** (light-mode browser, no declared scheme — no page CSS can paint that moment) → `color-scheme: dark` meta + CSS in head |
| Publishes shipped the overlay OPEN | canvas-toggled `is-viewing` leaks via publish — script + head gate (`lz-ov-rest`, §13) settle it; Seth may style with states toggled |
| Page transitions (T-07/T-08) | `@view-transition` unconditional + parse-time in head (async injection never fired reliably); vt=1 default; Firefox gets an arrival-fade (intro only, `navigate` type only); menu modal on the same 500ms CLOSE_EASE — one curve, one clock site-wide |
| Slow links (participants→entry) | `.is-pending` (Seth's name): clicked link + visible LUNGITZ lamp, rust token, pulse until the new page lands; only real document navigations cue (glides skip); bfcache-safe clear + 12s failsafe |
| 1-col lightbox close exited down-page (v79) | the close is a `history.back()` traversal and Chrome's `scrollRestoration:'auto'` re-scrolled the document ~1s AFTER the flight locked its target — `manual` during the fullscreen round-trip, restored on landing |
| 1-col close then "snapped" (v82) | flight ran but into an ~8×5px landing pad — the thumb's lazy image had never fetched so its wrapper had no size; close now stamps the wrapper with the overlay image's own ratio (dimensions known for free — same asset), borrows a sibling width if the grid track collapsed, re-measures, then flies. Degenerate threshold 40px |

## Ownership split settled today (do not re-litigate)

- **body background** — Seth's Designer value (ink-900 token, published, correct).
- **`html{background}` + `color-scheme`** — head custom code, code-owned FOREVER
  (Designer cannot express either; they govern the browser's canvas, not the page's).
- **`.is-pending`** — Seth's global class (rust accent-b-500 token) — restyle freely;
  its pulse keyframes + descendant reach + two specificity backstops are injected (§14).

## Open

### Seth's Designer pile
- Lay out + style `caption-name` / `caption-edition` in the overlay. **The first two
  paragraphs in `.caption-content` are script mount points** (image caption, credit +
  `.fs-count`) — move them freely but tell the code session so it re-points; deleting
  them empties the lightbox captions. Third paragraph ("Credit") = stray, delete freely.
- Retire the per-entry `.detail-view` block + children (dead since the ladder cut).
- T-11: move the ≤767px `.wrapper-content.is-left/.is-right { overflow: visible }`
  head override into the Designer by hand (then delete that head block ONLY — the
  canvas/color-scheme blocks stay, see ownership above).
- Untoggle `is-viewing` on the overlay component when done styling (cosmetic now).
- Restyle `.is-pending` / `.is-realm` states if the baselines aren't final.

### Code-side crumbs
- **T-13**: keep or strip `?lzdebug` + flight recorder at sign-off (costs nothing unused).
- **T-14**: retire Menu Entries collection + `/menu-entries` template + `sandbox-landing`
  page once nothing binds them. Sandbox `vNN.js` files ≤ v77 are also prunable (v78 = live).
- **T-05**: one final eye-check that phantom slivers are gone (none observed since the
  per-image reservation; Seth half-confirmed).

### Design question for Seth (surfaced by the v82 work, not a bug)
Entries with many images (e.g. 15) lay the whole thumbnail strip in ONE row at phone
width, so each thumb is genuinely ~19px wide — a lightbox close into such an entry will
always read as shrink-to-a-sliver because that is truthfully where the image lives. Only
a layout decision changes it (e.g. wrap the strip at small widths). Seth's call.

### Launch (beyond code)
- Client texts (landing blurb, impressum/resources bodies), Ziegelwerk transparent-PNG
  flag, findability go-live steps (domain-gated — see FINDABILITY-GO-LIVE.md).
- The ~2s staging HTML is Webflow staging latency; re-measure nav speed on the real domain.

## Traps that cost hours today — read before debugging anything

- **A "verified" fix can be overwritten later in time.** The anchor landed perfectly and
  Webflow's tween dragged it away two seconds after verification. Verify at t+2s, not t.
- **GitHub Pages propagation gaps lock the landing** on `/sandbox?v=N` — a 404'd script
  runs nothing, and dismissal is script behavior. Not a code bug. One build needed a
  manual `gh api` rebuild kick.
- **Same-frame start+target writes silently kill CSS transitions** — force a reflow
  (`offsetWidth`) between them. This is why grows "snapped" for three builds.
- **Backgrounded/non-frontmost tabs**: rAF and ResizeObserver dead (known), view
  transitions silently skip (render-gated), **CSS transitions freeze at frame zero —
  computed reads never change** (kill the transition before measuring color), timers
  throttle (a probe froze 45s), and on a locked Mac **lazy/srcset images refuse to
  decode** (`complete && naturalWidth 0` while the asset 200s) — geometry read there is
  an artifact. An MCP tab that isn't its window's ACTIVE tab is `document.hidden` even
  if the window shows.
- **Webflow publishes canvas-toggled state** (the overlay shipped open). Gates now absorb
  it, but remember it when adding any new stateful component.
- **MCP**: attribute `value_binding` writes fail server-side; collection lists cap at 100
  items; text-binding a WRAPPER destroys its children (leaf elements only); shared-modifier
  combos (`is-left/right/open`) collapse — snapshot users first, verify after.
- **Menu pages carry hidden index copies** — anything targeting `nav-lungitz`/columns must
  take the VISIBLE one (`onRealIndex` doctrine, now also in the nav cue).

Sandbox record: v61–v78 in `sandbox/` (one behavior per build, git log tells the story).

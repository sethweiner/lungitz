# Lungitz sandbox — 1:1 Webflow variant testing

Each `vN.js` is a full, standalone interaction script. A duplicated Webflow page
loads one of them by URL param, so we test variations against the **real** design
and CMS content — no approximation.

## How it works

One sandbox page carries a tiny **loader** that injects `sandbox/vN.js` based on
`?v=N` (default `1`), cache-busted on every load so edits show on a normal refresh.

Switch variant by changing the URL:

- `…/sandbox` → v1
- `…/sandbox?v=2` → v2
- `…/sandbox?v=3` → v3

Compare two side by side: open `?v=2` and `?v=4` in two tabs.

## One-time Webflow setup

1. **Move production off site-wide code.** Site Settings → Custom Code: cut the
   `<script src="…/lungitz-interactions.js"></script>` line. Paste it into the
   **Home page**'s Page Settings → Custom Code (before `</body>`). This stops the
   production script from also running on the sandbox page (double-bind).
2. **Duplicate the Home page**, name it `sandbox`.
3. In the `sandbox` page's Page Settings → Custom Code (before `</body>`), paste
   the loader below.
4. Publish.

```html
<!-- Lungitz sandbox loader -->
<script>
(function () {
  var v = new URLSearchParams(location.search).get('v') || '1';
  var s = document.createElement('script');
  s.src = 'https://sethweiner.github.io/lungitz/sandbox/v' +
          encodeURIComponent(v) + '.js?t=' + Date.now();
  document.body.appendChild(s);
}());
</script>
```

> Alternative (your original idea): skip the loader and hardwire one duplicated
> page per version — paste `<script src="…/sandbox/v2.js"></script>` into each.
> Works too, but you handle caching with hard-refresh and re-wire per page.

## Workflow

I edit `vN.js` → commit → push. You refresh `…/sandbox?v=N`. The winner gets
promoted to the root `lungitz-interactions.js` (production) and these can be pruned
(git history keeps them).

## Version ledger

| Version | Axis | What it tests |
|---|---|---|
| v1 | — | **Control.** Current production (FLIP-to-thumbnail + visibility swap). Single-image close flashes — this is the reference. |
| v2 | Single-image close | **Option A — image becomes resting state.** Shrinks from fullscreen back to the in-flow detail view and stays; no thumbnail handoff, so nothing can flash. Close lands on the big image; header/Esc collapses from there. |
| v3 | Single-image close | **Option C — snap, no motion.** Leaves fullscreen and restores the preview instantly. Bulletproof, but no shrink feel. |
| v4 | Single-image close | **Option B — keep thumbnail, match crops.** Forces the thumbnail to `object-fit:contain` so the FLIP lands pixel-identical to it; clean synchronous swap, no visibility pop. |
| v5 | Engaged state | **v3 (snap close) + persistent engagement.** Open entry holds its rust look via `.open` (not cursor-driven); the thumbnail you were viewing keeps its veil lifted via a new `.is-revealed` hook until you click away. Sandbox-injects the styling for feel — final styling is a Designer handoff (mirror the `:hover` rules onto `.trigger-accordion.open` and `.wrapper-thumbnail.is-revealed .thumb-hover`). |
| v6 | Lightbox zones | **v5 + Option 1 trigger zones.** Invisible edge strips page prev/next (hover reveals a chevron); clicking the dark backdrop (off the image) closes; the image centre stays click-to-zoom. Stacking: close zone < image < nav strips < controls. Zones disable while zoomed (click = zoom-out, drag = pan); single-image hides the nav strips. |
| v7 | **Masthead menu (Track A)** | **First variant on current production `c745464`** (Designer-owned fullscreen CSS + propagateFs), NOT forked from v1–v6. Adds the click-to-toggle masthead menu: GIVEAWAYS (left, people) · LUNGITZ (center/home) · HIDEAWAYS (right, places). A side word expands the `.nav` into a 2-column menu (giveaways left-aligned / hideaways right-aligned) constrained to the nav's 96vw — fixes the ~1900px right-panel overflow. Click an item → content loads in a panel below; menu stays open. Close: LUNGITZ / Esc / outside. Mobile stacks. Content is placeholder copy from the mockups (real CMS-vs-static sourcing TBD). New hooks: `.nav.is-open`, `.nav-menu`, `.nav-panel.is-giveaways/.is-hideaways`, `.nav-item.is-current`, `.nav-detail.is-shown`. |
| v8 | **Menu as a drawer (Track A)** | v7 reworked into the **grid-rows drawer** family, identical mechanic/easing to `.caption-drawer` (motion injected in code, so Webflow's audit never sees the `grid-template-rows` transition). `.nav` is now a 2-row drawer: row 1 = `.nav-content` (words, the handle), row 2 = `.nav-body` (collapsing, mirrors `.caption-body`). Items reuse the masthead `.h5-nav` type (+ `.nav-item` combo) and share `.nav-content`'s `space-1` padding so they line up under their trigger word. **Twist:** the selected item's content reveals in `.nav-detail`, itself a nested grid-rows drawer. Built for Designer editing: style `.nav` / `.nav-body` / `.h5-nav.nav-item` / `.nav-detail-body` as combos. Open question still parked: clicking the *other* word toggles closed (not side-switch); detail sits full-width below (not beside, p13). |
| v9 | **Immersive frame (Track B)** | v8 + the masthead **persists in fullscreen** as the frame: `.detail-view.is-fullscreen` is inset *below* the nav (override of the Designer `inset:0` combo) instead of covering it. The nav gains `.is-immersive` (set by `openFullscreen`/`closeFullscreen` via `setImmersive()`): it **breathes** (margins grow `1rem→1.5rem`) and reveals a `.frame-close` ✕ tucked in the right corner (frame-breathes, not push-word). The **active realm word lights in the rust accent** (`.h5-nav.is-active` → accent-b-500) — `is-left` column → GIVEAWAYS, `is-right` → HIDEAWAYS (⚠️ verify that column→realm mapping). New hooks: `.nav.is-immersive`, `.frame-close`, `.h5-nav.is-active`. |
| v10 | **Fullscreen state-4 polish (Track B)** | v9 + three deeper fullscreen edits. **(1) Realm hover cue:** hovering `.wrapper-content.is-left/.is-right` lights its masthead word in rust (`lightRealm()` shared with the fullscreen lock; skipped while immersive). **(2) Strip + close→close:** the whole `.detail-bar` is hidden in fullscreen (`display:none`) and the frame ✕ now **animates into place** (opacity + `scale(.85→1)`) — the close hands off. **(3) Fit-to-height + caption below:** `.detail-view.is-fullscreen` is a flex column — `.detail-image.is-fullscreen` is `flex:1` (fills height, contain) and `.caption-drawer.is-fullscreen` shows below (overrides `.is-collapsed`). Navigation in fullscreen is **arrow keys** for now. |
| v11 | **Fullscreen fixes (Track B)** | Fixes the v10 fullscreen bugs from Seth's screenshots. **Fill/z-index:** the modal now **fills the viewport** (`.detail-view.is-fullscreen` `inset:0`, opaque ink) with `padding:calc(4vh+3rem) 1.5rem 1.5rem` holding the image below the masthead — so the archive columns are fully covered (no bleed-through), and the nav floats on top via `z-index:1000` in immersive (modal 999). *(A body-level backdrop was tried first but a `position:fixed` ancestor stacking context would have painted it over the image — the fill approach avoids that.)* **Slide counter:** `.fs-count` is prepended into `.caption-content` (bottom-left, before the caption), updated in `paintDetail`, shown only in fullscreen. **Caption footer:** `.caption-content.is-fullscreen` left-aligned + baseline for a cleaner row. **Nav alignment:** ✕ tucked to the corner (`right: space-1`), outer words aligned to the image edges (`nav-content` padding-left 0 / right 3rem). Fine nav/caption styling is Seth's in the Designer. On-screen hover/drag/pinch controls = **v12**. |

| v12 | **Scroll-to-zoom (depth gesture)** | First gesture promoted off the catalog bench. In fullscreen, the **scroll wheel zooms** the image toward the cursor (clamped at the image's natural scale, capped 4×); wheel-up zooms back, and at 1× it releases so the page scrolls. **Replaces click-to-zoom** (per Seth — clicking in fullscreen no longer toggles zoom). Pan-drag still works while zoomed; state drawers stay click-driven (scrolling through them felt too fast). Zoom math proven in `gesture-catalog.html` (incl. a wheel-direction sign fix) before porting. Touch pinch = a later variant. |
| v13 | **Zoom + pan (native model)** | v12 reworked to the **native image-viewer model** Seth chose on the bench — adds the pan he was missing. **Pinch** (ctrl+wheel) ramps zoom toward the cursor; once zoomed, **two-finger scroll OR drag** pans; **scroll-down at 1×** enters zoom; back at 1× it releases to the page. Pan is **clamped to frame** (`zoomApply` bounds = image layout box × scale). New helpers `zoomSet`/`zoomApply` replace `zoomIn`; pan handlers are now **pointer-based** (trackpad/mouse/touch). Whole model verified in `gesture-catalog.html` before porting (pinch / scroll-pan / drag-pan / clamp / reset all exercised). Sensitivity (`0.02` pinch, jump-to-`2×` entry) is tunable. |
| v14 | **Arrangement — drag to curate** | v13 + the **ephemeral drag-drop** Seth loved on the bench, now on the real CMS entries. Drag a **closed** `.trigger-accordion` to reorder it within its column or carry it across; a move-threshold keeps it from fighting tap-to-open, the post-drag click is swallowed, and the drop **settles with the drawer easing** (FLIP). Crossing columns flashes the conceptual label — *giving away ↗* (into `is-left`) / *hiding away ↘* (into `is-right`). **DOM-only — resets on reload; the canonical CMS order is untouched.** Designer hooks: `.arrange-ghost`, `.arrange-placeholder`, `.wrapper-content.arrange-over`, `.arrange-hint`. Drag mechanic proven on the bench; the new risk is the **tap-vs-drag coexistence** on the live accordions — first thing to test. |

| v16 | **Slide-strip** | v15 with the inter-slide transition removed — prev/next now swaps **directly** (no slide animation), per Seth ("clear direct felt right"). Swipe still tracks the finger; the commit snaps. Chevrons kept as bare Designer hooks. Zoom model (mouse click-step vs layered cross-device) under discussion. |
| v15 | **Slideshow nav in fullscreen (state 4)** | v14 + prev/next in fullscreen — fills the arrow-only gap left when v10 stripped the bar. **Hover-reveal chevrons** at the edges (`.fs-nav` zones, `.fs-chev` glyph reveals on hover; the whole edge strip navigates) + a **haptic swipe** (drag the image, it follows your finger; past ~18% it slides to the neighbour and settles, else eases back — the bench-proven feel). Single image, so the slide swaps **off-screen** (current eases out one side, new eases in the other) via `slideTo()`. Shown only when fullscreen + multi-image + not zoomed (`body.is-fs` / `is-fs-zoom` flags from `setImmersive` + the zoom fns). Coexists with zoom/pan/arrange (all gated). Swipe feel + slide timing are tunable. |

| v17 | **Layered zoom (state 4)** | The zoom Seth's mouse wanted, made cross-device. **Click-step:** clicking the fullscreen image cycles 1×→2×→4×→(natural cap)→exit toward the click, pan persistent (`zoomStepClick`); steps **cap at the image's real resolution** so it never goes soft. **Pinch** (ctrl+wheel) still zooms for trackpad/touch; **drag** pans every device; Esc→1×. Plain scroll no longer enters zoom (click/pinch do). Click-vs-drag disambiguated by `dragMoved` (swipe + pan both set it) — a tap zooms, a drag swipes/pans. |

> **Bookmarks (Seth, 2026-06-09):** zoom → delivered as **v17** (layered click-step); lateral swipe → **v15**, slide stripped in **v16**. Remaining polish is Designer-side (caption/credit + chevron styling — Seth's). Promotion of the winning vN → root `lungitz-interactions.js` still pending.

> ⚠️ **Base new variants (v7+) on current production `c745464`, not v1–v6** —
> those predate the 2026-06-09 fullscreen→Designer migration and still inject
> the old fullscreen CSS (now conflicts with the Designer combos).

_Zone alternatives if Option 1 doesn't feel right: left/right halves nav (button+Esc
close), or hover-chevron hotspots only. Spin as v8 once v6/v7 are felt._

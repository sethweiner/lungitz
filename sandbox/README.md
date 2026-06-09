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
| v11 | **Fullscreen fixes (Track B)** | Fixes the v10 fullscreen bugs from Seth's screenshots. **Fill/z-index:** a lazy full-viewport `.fs-backdrop` (ink-900, `z-index:998`, fades with `.is-shown`) fills behind the inset modal so the archive columns no longer bleed through the margins/top strip; nav rises to `z-index:1000` in immersive (modal stays 999). **Slide counter:** `.fs-count` is prepended into `.caption-content` (bottom-left, before the caption), updated in `paintDetail`, shown only in fullscreen. **Caption footer:** `.caption-content.is-fullscreen` left-aligned + baseline for a cleaner row. **Nav alignment:** ✕ tucked to the corner (`right: space-1`), outer words aligned to the image edges (`nav-content` padding-left 0 / right 3rem). Fine nav/caption styling is Seth's in the Designer. On-screen hover/drag/pinch controls = **v12**. |

> ⚠️ **Base new variants (v7+) on current production `c745464`, not v1–v6** —
> those predate the 2026-06-09 fullscreen→Designer migration and still inject
> the old fullscreen CSS (now conflicts with the Designer combos).

_Zone alternatives if Option 1 doesn't feel right: left/right halves nav (button+Esc
close), or hover-chevron hotspots only. Spin as v8 once v6/v7 are felt._

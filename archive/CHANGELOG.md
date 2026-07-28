# Lungitz Interactions — Archive Changelog

Snapshots up to 2026-06-07 are dated `.js` files in this folder. **As of 2026-06-08 the script moved to git**
(`github.com/sethweiner/lungitz`, served via GitHub Pages, loaded by Webflow as `<script src>`). Git history
is now the version archive; roll back with `git`, not by pasting. Full 2026-06-08 detail:
`../Lungitz_Claude-Webflow_Session_2026-06-08/SESSION-LOG_2026-06-08.md`.

---

## 2026-06-08 — git migration, sandbox workflow, engaged state

**Moved to git + GitHub Pages** (push = deploy). Added the `sandbox/vN.js` + `?v=` loader system for 1:1
variant testing on a duplicated `sandbox` page; production script bails on `/sandbox` to avoid double-binding.

**Shipped to production:**
- Orchestrated accordion close — content fade (120ms) + softer close easing `cubic-bezier(.4,0,.2,1)` +
  140ms stagger before the next entry opens. Scroll starts immediately on entry-switch.
- Scroll kept at v3 (the Chrome sub-pixel accumulator caused a start stutter — reverted, jitter bookmarked).
- Single-image close → **Option C (snap, no motion)**, replacing the flash-prone fullscreen→thumbnail morph.
- **Engaged state** (first full Designer↔code sync): open entry holds rust via `.trigger-accordion.is-engaged`
  (JS toggles it with `.open`); viewed thumbnail keeps veil lifted via `.thumb-hover.is-revealed`. Combo
  styling authored in the Designer via the Webflow MCP.

**Pending promotion:** sandbox `v6` — lightbox trigger zones (edge prev/next, hover chevrons, backdrop-close,
`user-select:none`). Waiting on Seth's tighter lightbox styling + menu in the Designer.

**Gotcha:** the Webflow MCP can't target a combo whose base name is a prefix of another class
(`trigger` / `trigger-accordion`) — use uniquely-named combos. See the session log.

---

## 2026-06-07 v3 — FLIP fullscreen, zoom+pan, scroll polish

**File:** `lungitz-interactions_2026-06-07_v3.js` (621 lines, includes `<script>` wrapper)

### What's in this version

**4-state interaction model (Closed > Preview > Detail > Fullscreen)**
- Accordion open/close via `.open` class toggle on `.trigger-accordion`
- Detail view (State 3): scale-from-thumbnail entrance, hides `.wrapper-images`, paints image/caption/credit/count/nav controls
- Fullscreen (State 4): FLIP animation — `.detail-view` itself promotes to `position:fixed;inset:0` via `.is-fullscreen` class. No separate overlay element. Same-element promotion means controls, captions, and image all travel with the view.
- Single-image entries skip State 3 in both directions (2>4 forward, 4>2 back). On close, `transitionend` triggers instant cleanup (no CSS transition flash).

**Zoom + Pan (State 4b)**
- Click to zoom in (scale to `max(2, min(naturalSize, 4x))`), click again to zoom out
- `transform-origin` set at click point for natural zoom feel
- Mouse drag to pan while zoomed; `dragMoved` flag distinguishes click from drag
- Escape from zoom steps back to fullscreen (not all the way out)

**Keyboard**
- Escape: zoom > fullscreen > detail > accordion (steps back one level)
- ArrowLeft/Right: prev/next image (resets zoom first)

**Scroll-to-trigger** (the hard one)
- Smoothed-target lerp: starts immediately on click, tracks trigger position as accordion layout shifts
- Target low-pass filtered at 0.35 to absorb layout-shift jitter
- 2-frame warm-up: smoothed target tracks for ~33ms before scroll begins (prevents start shiver)
- Lerp factor 0.08 for gentle feel
- Stop threshold 1.5px with no final snap (prevents landing jump)
- `pad = 64px` offset below navbar

**Injected CSS**
- Scrollbar: 8px, black thumb, dark track via `color-mix(in srgb, var(--_lungitz---color-ink-900), #000 20%)`
- Detail-view transitions: `transform 400ms cubic-bezier(0.16,1,0.3,1), opacity 300ms ease`
- Column-aware transform-origin: `.is-left` = left top, `.is-right` = right top
- Fullscreen: `position:fixed;inset:0;z-index:999`, background from CSS variable
- Fullscreen image: `width/height:100%;object-fit:contain`, zoom/pan cursors
- Theme-color meta tag injected from `--_lungitz---color-ink-900`

### Architecture notes

- All behavior via class toggles + inline styles; no Webflow IX2
- Delegated event listeners (one per concern, bound to `document`)
- State held in module-scoped vars: `detail`, `fs`, `zoom`, `panState`, `dragMoved`
- `void element.offsetHeight` trick forces layout read between display change and transition start
- Progressive enhancement: real `<a href>` links intercepted by JS; content is in the HTML

### Known issues at this snapshot

- Scroll landing feel: nearly there but could use a final touch of softness
- Single-image close (4>2): transitionend fix deployed, needs live testing to confirm flash is gone
- Hi-res images not yet replaced (CMS still has low-res)

### Changes from previous session (v2, not archived)

- Replaced overlay-based fullscreen with same-element FLIP promotion
- Added zoom + pan (State 4b)
- Added single-image entry shortcuts (skip State 3)
- Added arrow key navigation
- Reworked scroll-to-trigger through 7+ iterations:
  - `window.scrollTo` > `col.scrollTo` > `scrollIntoView` > manual eased scroll > lerp chase > delayed scroll > smoothed-target lerp with warm-up and no-snap landing
- Scrollbar colors changed from hardcoded rgba to `color-mix()` with CSS variables
- Removed `paintFullscreen()` and all overlay-specific code

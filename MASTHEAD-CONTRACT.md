# Masthead / Menu — ownership contract

**Principle:** the **Webflow Designer is the single source of visual truth.**
Code carries **only** what Webflow physically cannot express — and every such
rule is listed below with the reason. If a rule isn't in the "Code-only" table,
it does **not** belong in the script.

The test: *what the canvas shows at rest should be what renders live at rest.*

Status legend: ✅ already in the Designer · ⬜ to migrate (currently injected) · 🔧 fix needed

---

## 1. Owned by the Designer — you see / touch / tweak (values live on the class)

| class | role | key properties | status |
|---|---|---|---|
| `.nav.wide` | masthead frame, rest | `grid-template-rows: auto 0fr`, `grid-row-gap:0`, `align-items:stretch`, `width:97vw`, padding/radius | ✅ (align-items:stretch confirmed published 2026-06-10 → code stopgap removed) |
| `.nav.wide.is-open` | menu-open state | `grid-template-rows: auto 1fr`, `padding-bottom: space-5`, dashed `accent-b-500` border, `border-radius: space-2` | ⬜ |
| `.nav-content` | 3-up centering row | `display:grid`, `grid-template-columns: 1fr auto 1fr`, `align-items:center` | 🔧 (flex now) |
| `.nav-giveaways` / `.nav-lungitz` / `.nav-hideaways` | the three words | `justify-self: start / center / end` | 🔧 |
| `.nav-body` | collapsing drawer row | `overflow:hidden`, `min-height:0`; **`display:none`** = canvas-tidiness knob (re-added 2026-06-12) — the script's `.nav.wide .nav-body{display:block}` overrides it at runtime, where the `0fr` row does the live collapse. ⚠ the *component editor* reveals it anyway, so judge resting state on a page/live | ✅ |
| `.nav-menu` | 2-column menu | `display:grid`, `grid-template-columns: 1fr 1fr`, gaps `space-3`/`space-4`, padding `space-2 space-1 0` | ⬜ (empty now) |
| `.nav-panel` | one column | `display:flex`, `flex-direction:column`, row-gap `space-1` | ⬜ |
| `.nav-panel.is-giveaways` / `.is-hideaways` | column alignment | `align-items: flex-start / flex-end` | ⬜ |
| `.h5-nav.nav-item` | a menu item label | `flex:0 0 auto`, `cursor:pointer`, `text-decoration:none`, `display:block` | ⬜ |
| `.nav-item.is-current` | selected item | `color: ink-100` | ⬜ |
| `.nav-detail` | reveal drawer (static) | `grid-column: 1 / -1`, `display:grid`, `grid-template-rows: 0fr` | ⬜ + make real element |
| `.nav-detail-body` | reveal content | `overflow:hidden`, `min-height:0`, `color: ink-100`, `padding-top: space-2` | ⬜ |
| `.nav-item-body` | per-item body (the reveal source) | your call — type/size/spacing | ✅ (yours) |
| `.frame-close` (+ `:hover`) | the ✕ — look, position **and** resting hide | size, dashed border, color, `position:absolute`, `right: space-2`, **`opacity:0` at rest** | ✅ (opacity:0 added 2026-06-10 so the canvas matches the live resting look; reveal → opacity:1 stays in code) |
| `.nav.wide.is-immersive` | fullscreen frame breathe | `margin:1.5rem`, `width:auto`, `z-index:1000` | ✅ (drop redundant injected copy) |
| `.nav-menu` @ ≤ small | stack to 1 column | `grid-template-columns: 1fr` | ⬜ → breakpoint |

---

## 2. Owned by code — cannot be authored in Webflow (with the reason)

| rule | why it must stay in code |
|---|---|
| `transition` on `.nav.wide` `grid-template-rows` | Webflow's invalid-styles audit **blocks publishing** on grid-row transitions |
| `transition` on `.nav-detail` `grid-template-rows` | same audit block (the reveal motion) |
| `.nav-panel .nav-item-body { display:none }` | **descendant selector** — Webflow can't author it. Hides bodies at rest; the script *moves* the chosen one out into the reveal, where it shows |
| `.nav.wide.is-immersive .frame-close { opacity / transform }` | descendant + JS-set state — the ✕ reveal **motion** |
| `.nav.wide.is-immersive .nav-hideaways { padding-right: 2.75rem }` | descendant + JS state — the equal-margin knob |
| `.nav-detail.is-hideaways .nav-detail-body { text-align:right }` | descendant + JS state |
| `.nav-detail-body p { max-width: 60ch; margin }` | descendant (the rich-text paragraphs) |
| `.detail-view.is-fullscreen` family (frame fill, `z-index:999`, `margin:0`) | the shared `is-fullscreen` modifier the **MCP can't write** (it collapses every `is-fullscreen` combo to one). **You can author these by hand** if you'd rather they be native |
| FLIP morph · `<body>` portal · zoom math · scroll | runtime-computed values — no static CSS can express them |
| `transition` on `.container-landing` **appended two frames late** (v34) | *timing*, not values — CSS can't say "not on the first paint". Webflow ships `.container-landing` already `.is-active` in every page's HTML; the script loads async and strips it on Home, so an armed transition played the whole menu collapsing as the page appeared (the click-navigation "jump"; back/forward was clean because bfcache restores the settled DOM). The durations are unchanged — only when they start applying. Change the values on the class; leave the arming to `armMotion()` |
| `.container-landing.is-active .nav.wide.landing{height:calc(100vh - 32px)}` (v38) | **descendant selector** — and it must be state-scoped: the RESTING word row must never get a height or it becomes a full-screen invisible block over the index (verified: `elementFromPoint` still hits the index). 32px = the panel's own `margin:16px` top and bottom. Everything else in that fix is on the classes, in the Designer: `.landing-content` lost `height:88vh` (the actual overflow) and gained `min-height:0` + `height:100%` + `4px` vertical margin; `.nav.wide.landing` went from ONE declared row to `auto 1fr auto` with `row-gap:0` |
| `.trigger-accordion:hover h4`, `.category-content:hover h4` → accent-b (v37) | **descendant selector** — Webflow can't author it. `:hover` sets `color`, which only INHERITS, so the `<h4>` children (`.type`, `.author`, `.edition`) carrying the bare `h4{color:accent-a}` tag style ignored the hover entirely. Nothing is misconfigured on the canvas; an explicit rule simply beats an inherited one. Change the hover colour on `.trigger-accordion`; this rule only forwards it to the h4s |
| sitewide scrollbars duplicated into **SITE HEAD custom code** (v37) | *timing* — loaded only by the async script they painted as the browser default first and then restyled. The script keeps an identical copy so `/sandbox` and any page without the head block still match. Edit **both** or they drift |
| **`html.lz-rest` landing gate — SITE HEAD custom code, not the script** (v35) | the only code on the site that runs *before first paint*. v34 made the arrival settle instant instead of animated, but both still painted the menu open and then changed it — and an instant snap of a fullscreen element reads as a **flash**, worse than the animation it replaced. The gate decides Home's landing state synchronously in `<head>`, so the wrong state is never painted at all. It mirrors `landingModal`'s rule exactly — **change one and you must change the other**. `landingModal` removes `lz-rest` once it owns the state, so `.is-active` alone rules afterwards and LUNGITZ still opens the menu. Home-only; menu and entry pages keep `.is-active` permanently and the gate skips them |

---

## 3. JS-toggled states — how to preview/style them natively

These classes are added by the script at runtime, so they read as **0-instance**
in the Style Manager. To style one: select the element → in the selector, **add
the combo** (e.g. `is-open`) → style it → **remove the combo from the element**
(the style definition persists and still compiles). **Never run "Clean Up /
Remove Unused Styles"** — it purges these.

**Tidy by default:** menu items' bodies (`.nav-item-body`) are `display:none` at rest,
so the canvas shows only labels. Add `is-shown` to a body to pop it open and style it.

| state combo | on | meaning / "pop open to edit" |
|---|---|---|
| `.is-open` | `.nav.wide` | menu drawer open |
| `.is-current` | `.nav-item` | selected menu item |
| `.is-shown` | `.nav-detail` | the reveal drawer open |
| `.is-shown` | `.nav-item-body` | a menu item's body shown (the script adds this on reveal) |
| `.is-immersive` | `.nav.wide` | fullscreen frame active |
| `.is-fullscreen` | the modal + every descendant (via `propagateFs`) | fullscreen |

---

## 4. Structure

The masthead is a **Webflow Component** — "Masthead", id
`186c9bae-930f-3099-2354-95368857e131` — built 2026-06-10 from the sandbox masthead
via `transform_element_to_component`, which **preserved the CMS Collection List
bindings**. ✅ Feasibility confirmed: a CMS Collection List *can* live inside a
Webflow component. Instanced on **Home + sandbox** (build once → propagates); the
old hand-copied Home masthead was removed. Both scripts (`lungitz-interactions.js`
and `sandbox/v18.js`) **find-or-reuse** the component's `.nav-menu` and wire the
reveal — they build nothing when the component is present.

---

## 5. `durabilityPolish()` — Thread B pile, promoted 2026-06-11 (CODE-OWNED)

The durability/UX pile folded into `lungitz-interactions.js` (the `durabilityPolish`
IIFE) after sandbox proof (v18→v25). Code-owned because each is a runtime / descendant
/ pseudo / `clamp()`-on-a-class rule Webflow can't author — except the ⬜ rows, which
could migrate to the Designer as plain breakpoint styles.

| rule | why it's code |
|---|---|
| `.nav.wide` @≤767 `position:fixed` + ink bg + `z-index:100` + `width:auto` | mobile masthead sticky + scrollbar-safe (was `absolute`, scrolled away). ⬜ width/margin are Designer-able; `fixed`+bg is the behavior knob |
| `.h5-nav` @≤767 `font-size: clamp(…)` | **Webflow styles can't hold `clamp()`** — only Variables can |
| `.wrapper-content.is-left/.is-right` @≤767 `padding: 1rem` | ⬜ Designer-able — resets the desktop inner-gutter on the stacked mobile edge |
| `html` @≤767 custom scrollbar (`::-webkit-scrollbar*`) | pseudo-elements Webflow can't author |
| `.nav.wide.is-immersive .nav-hideaways/.nav-giveaways` padding | descendant + JS state |
| `.frame-close{display:none}` + LUNGITZ / backdrop close + ✕ / ← / → cursors | the runtime fullscreen close (Option A) + SVG cursors |
| `.fs-chev` → state-3 `.button` look (`::before` ←/→) | pseudo + descendant; covers fullscreen slides **and** `.entry-nav` |
| ~~`.author`/`Rich Text Block`/`.type`/`.number-list`/`.button`/`.button-copy` `line-height` = fixed px~~ | ✓ **RESOLVED 2026-06-12** — migrated to the Designer: `line-height` is now fixed-px on each class (20/16/32px), unbound from the space tokens, verified live on `lungitz.shared.f0022a466.css`. The masking px-pins were removed from `durabilityPolish()`. No longer code-owned. |

Phase 2 fluid **space** (`space-5…24` clamps) and the fluid **type** scale live in the
Webflow **Variables**, not here. Bounce-fix (`width` dropped from the nav transition) is
in the navMenu transition.

---

_Maintained by Seth + Claude. Edit freely — this file is the agreement._

---

## ★ v32 — THE LANDING/MENU MODAL ERA (promoted 2026-07-25)

**The "Landing Modal" component IS the masthead.** Everything above this line
describing the drawer menu, the `.nav-body` reveal, `?realm=`, the landing
veil, and the `.is-immersive` fullscreen frame is HISTORICAL — retired in v32.

Designer-owned (Seth): `.container-landing` (rest = the word-row masthead)
· `.is-active` (expanded landing/menu) · `.immersive-overlay` (rest) ·
`.is-viewing` (open fullscreen) · `.category-content` / `.is-expanded` ·
all mode blocks, rows, type, color.

Code-owned (the script): toggling those class names · the rest-collapse
descendant rules (`.container-landing:not(.is-active) …{display:none}`) ·
session greet gate (`lz-landing-seen`) + `?menu=1` arrival · LUNGITZ is
BEHAVIORAL everywhere (menu in place on the index, `/?menu=1` elsewhere —
overrides Designer links) · realm words → `#info-*` per page (href-gated
delegation) · fullscreen growth in/out FLIP + history-back close + gestures
+ runtime painting (title/counter/captions) · index detection ignores hidden
duplicated columns (offsetParent) · external links → new tab · `/sandbox`
bail + `window.__lzLoaded` double-load guard.

Old Masthead component: still instanced ONLY on the entry templates (their
legacy fullscreen frame). Swap → Landing Modal + Immersive Overlay instances
there = the last retirement step.

---

## 6. TEMPORARY overrides living in SITE HEAD custom code (move these into the Designer)

| override | why it is there, and what to do |
|---|---|
| `@media (max-width:767px){.wrapper-content.is-left,.is-right{overflow:visible}}` | At ≤767px the columns **stack** and the page scrolls — the column scrolls nothing (`scrollHeight === clientHeight`), yet the combo still carried `overflow:auto`. That leaves a composited scroll layer with no content to scroll, and **Android Chrome fails to invalidate it**, so scrolled entries leave ghost trails that accumulate. Desktop columns *are* real scrollers (verified at 991px: side-by-side, 709/3307) so the base rule must not change. It sits in head code only because the winning rule is a combo on `is-left`/`is-right`, which are **shared modifier names** (also on `.h5-nav`) — rewriting a shared-modifier combo over MCP is the recorded collapse hazard. **By hand in the Designer this is safe: set Overflow → Visible on `.wrapper-content.is-left` and `.is-right` at the Mobile landscape breakpoint, then delete the head block.** |

---

## 7. Touch vs the arrange (drag) feature — v46/v47

**Arranging is mouse-only.** It does not arm on touch or pen, by design.

On a touch screen a scroll *is* a `pointermove`: a swipe starting on a closed entry
cleared the 6px threshold, so `begin()` lifted that entry into a `position: fixed`
`.arrange-ghost`. The browser then fires **`pointercancel`, not `pointerup`**, when it
takes the gesture over for scrolling — so `drop()` never ran and the ghost stayed
welded to the viewport. Every entry swiped past piled up: *"each entry remains fixed
and accumulates while scrolling, like a magnet."* It read exactly like a repaint bug
and is not one.

Two rules now hold, and both must survive any future edit to `arrange()`:

1. `pointerdown` returns unless `e.pointerType === 'mouse'`.
2. Cleanup can never depend on a callback that might not run — there is a
   `pointercancel` handler, and `drop()`'s FLIP reset has a timer fallback because
   `requestAnimationFrame` does not run in a backgrounded tab.

Anchoring is also measured, not assumed: `anchorPad()` reads the fixed masthead's real
bottom edge (+23px breathing room) instead of the old hard-coded 64px, which was a
desktop constant from when the masthead was 41px tall and wrong at every other size.

---

## 8. The `#info-*` arrival belongs to the script (v52)

The head gate **stashes and strips** the `#info-*` hash before `<body>` parses, so the
browser never performs its own anchor jump. That jump was the whole problem: it happens
at parse time, then the web fonts and the lazy CMS images reflow everything above the
target and it slides out from under the position just set — ~100px low by the time the
page settled, and no amount of correcting afterwards landed it reliably.

With no jump there is no wrong position to correct, only a right one to set. The script
polls until the target reads the same twice in a row, then restores the hash so the URL
stays shareable, and abandons on any real scroll. **Polling, not observing, is
deliberate**: `setTimeout` keeps running where `requestAnimationFrame` and
`ResizeObserver` do not, so it behaves identically in a backgrounded tab — and it is the
only version of this that could be verified. With JS off the head block never runs, the
hash survives and the native jump behaves as it always did.

The offset is **measured, never assumed**: `anchorPad()` reads the masthead's real bottom
edge + 23px. The masthead is `fixed` where the document scrolls and `absolute` where it
does not, so the test is "is it at the top of the scrollport", not "is it fixed".

**Motion is dropped where layout is expensive.** At ≤767px the columns stack into one
very long document with 215 lazy images, so transitioning `grid-template-rows` costs a
full-page relayout every frame — that is the "ratchet and lag". Below 767px the expand
changes state instantly; colour and border still ease. Desktop keeps the tween, verified.

**v85 (2026-07-27) amendment: the entry tween is back at every width.** The ratchet had
four authors and the other three were fixed independently after v52 wrote the ban
(webflow.js's second scroll authority unbound in §11/v61, thumb footprints reserved v62,
scroll-follow separated from the grow v63). Re-measured at 500px on the real page: open
25 steps / close 31 steps at ~16ms cadence, zero frames >34ms, entry-switch lands at
masthead+23 exactly with no reversals, stable at t+2s. `.trigger-accordion` now keeps
its desktop motion at ≤767px, and the accordion caption-drawer kill (v83 scoping) is
unchanged. **v86 (same day, Seth-approved): `.category-content` (the realm "+" drawers)
too** — its motion is the Designer's (`all .2s`, both states his); the kill was simply
removed and nothing injected in its place, so the Designer transition now runs at every
width (measured: 13 steps / ~190ms / 0 long frames both directions at 606px). The ≤767
media block in `injectCSS` now contains ONLY the caption-drawer rule. If a future phone
measurement ratchets, the kill to restore is that media rule — but measure first; do
not re-inherit the ban.

---

## 9. The `#info-*` anchor is a LAYOUT constant, not a scroll problem 🔧

`#info-giveaways` and `#info-hideaways` are the **first elements in their columns**.
Measured: `columnScrollTop 0`, `canScrollUpFurther false`. Nothing can push them further
down — **their clearance is `.wrapper-content`'s `padding-top` and nothing else.** Every
scroll fix attempted against this was arguing with geometry it could not move.

The mismatch: `padding-top: 8vh` scales with the **viewport**, while the masthead's height
scales with the **type**. At 1280×720 that is **50.4px against a masthead ending at 58**,
so the info heading sits ~8px underneath it; wanting 23px of breathing room makes the
shortfall ~31px. The masthead also *grows as the webfonts land* (measured 37px early,
58px settled), which is why any runtime measurement of it is a moving target.

**The fix belongs on the class**, in the Designer: `.wrapper-content` `padding-top` must
be ≥ masthead height + breathing room, expressed in a unit that tracks the type rather
than the viewport — a `rem`/space-token value, not `vh`. At the current type scale that is
roughly **5rem (~80px)** where `8vh` currently gives 50.4px. Set it once and the anchor,
the scroll padding and the layout all agree.

Code deliberately does **not** write this. v56/v57 tried and it was wrong twice: it
overwrote a Designer value, and it measured a masthead that had not finished growing, so
it wrote 60px where 81 was wanted. Reverted in v58.

Verify with `?lzdebug=1` (see §10): the `INFO top / want / off_by` line should read
`off_by=0`.

---

## 10. `?lzdebug=1` — the on-screen readout

Append `?lzdebug=1` to any URL for a fixed panel showing the build, viewport, whether the
≤767px media query matched, the live `transition-property` on `.trigger-accordion`,
whether the `#info` hash was intercepted, the measured pad, the info block's offset from
where it should be, pending image count, and the last 16 trace entries. **Strictly
opt-in** — without the parameter nothing runs and nothing is added to the page.

It exists because the in-app browser pane reports `document.hidden` permanently, which
suspends rendering: `requestAnimationFrame` and `ResizeObserver` callbacks never fire
there, so load-time scroll and animation behaviour cannot be verified in it. Inferring
across that gap cost far more time than the bugs did. One screenshot from a real device
settles more than an afternoon of reasoning.

---

## 11. webflow.js's own smooth scroll is UNBOUND (v61) — do not re-enable

webflow.js ships a `scroll` module that delegates `click.wf-scroll` on every
`a[href*="#"]`. It does not check `defaultPrevented`, `pushState`s the hash itself, and
tweens `window.scroll` to the target's **raw** `offset().top` over `472·ln(dist)−2000` ms
(≈1.4–1.6s at index distances). Its fixed-header selector is `header, .header, .w-nav` —
the `.nav.wide` masthead is none of those — so its offset is 0, and it ignores
`scroll-padding`/`scroll-margin` entirely.

That made it a **second scroll mechanism** fighting the script's glide on the very same
click: the 620ms error-paydown walk landed at pad and then Webflow's longer tween
re-landed the block at raw top — measured at 470px: click GIVEAWAYS from y=1500 → the
walk lands y=12 (`gTop=68=pad`), then the tween drags it to y=80 (`gTop=0`), the intro
decapitated under the masthead. This is why 2026-07-26's "verified off_by 0" was true at
walk-end and false two seconds later, and why only single column showed it: at 2 columns
the document doesn't scroll, so the tween's `window.scroll` writes were no-ops.

The script unbinds it once, the Webflow-sanctioned way:
`Webflow.push(function(){ jQuery(document).off('click.wf-scroll') })` (§masthead, v61).
`click.wf-empty-link` (the `href="#"` no-op guard) **stays bound**. Links keep their
meaning: clicks the script doesn't smooth fall through to the browser's **native** anchor
jump, which *does* honour the synced scroll-padding — strictly better than the tween.
The smoothed glide now records the hash itself (`replaceState`) so the URL stays honest.
Verified 1-col click/arrival `off_by=0`, 2-col `off_by=−1`, wide 2-col `off_by=−3`
(the §9 first-in-column geometry, not a scroll bug).

## 12. The production script's cache pin lives in SITE FOOTER custom code (T-10, 2026-07-26)

The site footer loads `lungitz-interactions.js?v=NN` with a **pinned** build tag.
It was `?v=' + Date.now()` during iteration — that made every navigation re-download
the ~106KB script and widened every load-timing race. Pinned, the second navigation
serves from browser cache (GitHub Pages sends `max-age=600`, so at worst a cheap 304
revalidation after 10 minutes).

**The pin is part of the promote procedure**: after copying a sandbox build to
`lungitz-interactions.js` and pushing, bump `?v=NN` in the site footer (MCP
`data_scripts_tool` → `set_site_freeform_code`) and publish the site. Forgetting the
bump means visitors keep the previous build until the CDN/browser cache expires.
`/sandbox` is unaffected — its page-footer loader has its own `?v=` selector.

## 13. The overlay never arrives open — html.lz-ov-rest (v72, 2026-07-26)

Webflow publishes whatever state classes are toggled on the canvas (§3's own
preview workflow). A 2026-07-26 publish shipped `.immersive-overlay.is-viewing` on
the component root and every page arrived covered by the open overlay (full-viewport
at 1-col). Two-part fix, same architecture as the landing gate:

- **SITE HEAD** adds `lz-ov-rest` to `<html>` unconditionally and hides
  `.immersive-overlay` under it — no arrival flow opens fullscreen, so this is
  always correct pre-paint.
- **The script** settles the overlay at init (strips `is-viewing`/`is-open`/
  `is-fullscreen` from the element) and removes `lz-ov-rest`.

**Lockstep: change either half only with the other.** Styling overlay states on the
canvas is now safe to publish — leave `is-viewing` toggled in the Designer as long
as you like. Note: sandbox builds < v72 never remove `lz-ov-rest`, so their
fullscreen opens invisibly — test old builds only by removing the class by hand.

## 14. `.is-pending` — the navigation cue state (v78, 2026-07-26, SETH-NAMED)

Seth: "ni=3 is good, and call the state .is-pending." The class is a real Designer
global (`color` = the rust accent-b token, collision-checked clean before creation)
— restyle it on canvas any time; add it as a combo to preview the pending state.
The script (§navCue) applies it to the CLICKED link and to the visible
`.nav-lungitz` (the chrome lamp) at click, for real document navigations only, and
removes it on pageshow/pagehide/12s-failsafe.

Code-owned (contract §2, injected — Webflow cannot author these): the descendant
colour reach (`.is-pending h1…h5/p/div{color:inherit}` — the v37 shortfall), two
specificity backstops for the lamp (its own class colour and media-query rules
outrank a bare state class), and the `lz-pending-pulse` keyframes.

Flags: `?ni=0` cue off · `?ni=1` link only · `?ni=2` page dim (held, inline) ·
`?ni=3` = the shipped default. Session-sticky; the lzdebug panel shows the mode.

**Measurement trap, recorded twice now: backgrounded tabs freeze CSS transitions.**
`.h5-nav` transitions colour over 200ms; in a `document.hidden` tab that transition
never advances, so computed colour reads frame-zero forever — even inline
`!important` writes appear to "not apply". Kill the transition
(`el.style.transition='none'`) before measuring colour in a hidden tab.

---

## 15. The lightbox drawer protocol — `data-detail` slots + `data-entry` leaves (v87, 2026-07-27)

Seth rebuilt the overlay drawer as **labeled slots**: a wrapper div holding a label
paragraph (styled `.caption-name`) and a value element (styled `.caption-edition`).
The paint addresses VALUES by attribute, never by class or position:

| slot (`data-detail=`) | painted with | source |
|---|---|---|
| `count` | "01 / 02" (zero-padded) | script state |
| `title` (bar) | entry name — NO slide number | trigger `.title` |
| `name` (bar) | contributors ", " | trigger `.author` leaves |
| `edition` | Edition | trigger `.edition` leaf (visible Designer leaf) |
| `format` | Material/Format | trigger `[data-entry=format]` hidden leaf |
| `photo-credit` | per-image credit | `.thumb-credit` via getImages |
| `link` | href only (text = Seth's glyph) | trigger `[data-entry=weblink]` hidden leaf; `target=_blank rel=noopener` painted |

**Rules.** (1) Classes are pure styling — rename/restyle freely, the attribute is the
wiring. (2) **An empty value hides its whole WRAPPER** (`parentElement`) — no orphan
labels; hideaways have no edition/format and that must read as absence. (3) Passive
slots (`count/title/name/edition/format/photo-credit/link`) fall through the control
delegation — `link` especially MUST, or the blanket preventDefault swallows the
navigation. (4) `[data-entry]` leaves are code-hidden (`display:none!important`
injected) — do NOT style them with `.hide`: that class exists only as combos and the
MCP style resolver once expanded it to `container-landing.is-active.hide` (caught
live, 2026-07-27). (5) The `.fs-count` injection is retired; the count is Seth's
element. (6) Leaves exist on **Home + /sandbox only** — entry templates have no
edition/weblink/format leaves, so those wrappers hide in entry-page lightboxes until
leaves are added there.

**v88 addendum — the cursor is the navigation.** The script-built `.fs-nav` edge zones
are retired; Seth's `[data-detail=prev/next]` buttons are the one arrow pair. On a
hover pointer, multi-image, unzoomed: the image's outer 30% thirds show the ←/→
cursors and click prev/next (capture phase); the **middle third keeps the click-step
zoom mouse model**. Zoomed or single-image = pure zoom behavior, touch = swipe,
unchanged. `lz-cur-prev/next` are code plumbing classes, never Designer states. The
cursor artwork (✕/←/→) is code-SVG at module scope — Designer cannot author image
cursors; making the art Seth-editable means swapping to Webflow-hosted asset URLs
(decision open). `.fs-chev` CSS now serves ONLY the entry pages' `[data-entry-nav]`
arrows. Leaves now also exist on both entry templates (edition h4 + weblink/format on
Giveaways, weblink on Hideaways) and the sandbox page has Home-parity (edition h4).

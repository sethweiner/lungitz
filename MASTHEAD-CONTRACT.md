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
| `.nav-body` | collapsing drawer row | `overflow:hidden`, `min-height:0` — **not** `display:none` (the collapsed `0fr` row hides it) | 🔧 |
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

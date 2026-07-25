# Designer Handoff — Landing/Menu Modal arc (v32, 2026-07-25)

Supersedes DESIGNER-HANDOFF_2026-07-24.md (the drawer/veil concept it describes
is retired). `sandbox/v32.js` is live on `…/sandbox?v=32` and finds your
elements wherever they exist — each piece activates on its own.

## Verified working already (on /sandbox?v=32, with your overlay)
- Full ladder into **your `.immersive-overlay`**: paint (bar title "N · Entry
  Title", slide counter, caption + credit), bar ←/→/✕ via the existing
  `data-detail` hooks, zoom/swipe/keys, Esc, backdrop click.
- **Browser Back closes fullscreen** (the Antoine fix) — ✕ and Esc route through
  the same history state; the keyboard hint chip advertises "✕ / back" when the
  browser itself is fullscreen.
- Closing keeps the entry engaged (rust + revealed thumbnail), single-image
  entries still jump straight to fullscreen.
- Contributors: `Featured work (Giveaway)` + `Featured work (Hideaway)` fields
  exist and are **auto-populated + published for 35 of 37** (artists → first
  work by exhibition order; institutions → their credited hideaway; only
  eSeL and Flora Fellner matched nothing). You + Antoine: override yours in the
  CMS whenever (custom/overall-project entries welcome — it's one dropdown).

## ASSEMBLED VIA MCP 2026-07-25 (per Seth's ask — all of it editable Webflow)

The sandbox page now carries the full working state; **code toggles YOUR
class pairs**, nothing visual is injected:

- **Overlay**: your curtain mechanic is the whole story — base
  `.immersive-overlay` (opacity 0 + clip-path, your transitions) ↔ new combo
  **`.is-viewing`** (opacity 1, clip open, pointer-events auto; created via
  MCP because the Designer name "is-open" is already taken by the old nav —
  restyle the combo freely). Code adds/removes `is-viewing`.
- **Landing modal**: code toggles **your `.is-active`** (shown ↔ your
  display:none rest). Restyling either class restyles the behavior — e.g.
  evolving the rest state into a collapsed word-row bar later. `.hide` was
  removed from the sandbox instance so it participates (and is clickable on
  canvas again).
- **Masthead component instance on /sandbox**: visibility restored so the
  index has its persistent nav after dismissal (flip the prop back off if the
  modal's own word row should be the only masthead — words are wired by
  delegation now, so both navs work either way).
- **`#info-giveaways` / `#info-hideaways`**: real `.category-content` blocks
  added at the top of both sandbox columns (Home's text copied — edit away).
  Style `.category-content` + its `.is-expanded` combo (code flips it on click).
- Site **published to staging** so all of it is live on
  `lungitz.webflow.io/sandbox?v=32`.

## Still yours (taste, whenever)

1. Overlay bar/caption look; the old fullscreen chevron edge-zones still
   exist — once you feel the bar's ←/→, say if you want the zones retired.
2. The modal's link wiring on the sandbox instance (its word row is unlinked
   raw structure — clicking any non-link inside just dismisses; bind the
   words/bottom row like the component version whenever).
3. `.category-content.is-expanded` styling (the "+" expand).
4. **Participants page**: wrap each contributor name in a link bound to
   `Featured work (Giveaway)` → item's page, with conditional visibility
   (field is set); a second link bound to `Featured work (Hideaway)` for the
   institutions (visible when giveaway is empty + hideaway set). The script
   rewrites those hrefs to the index-arrival (`/?entry=…`) automatically.
   Then paste the sandbox loader into `sandbox-participants` Page Settings so
   the rewrite + arrival can be tested.
5. **Real slugs later**: `sandbox-landing`/`sandbox-participants` are canvas
   references; the real Impressum/Resources pages instance the same component
   with their mode boolean.

## Content flags
- Ziegelwerk image 2 resolves to the transparent Lungitz logo PNG (CMS
  image-set data — probably not intended).
- Client texts still needed: landing blurb final, impressum/resources bodies.

## Promote
When v32 feels right (+ real-device pass): I fold it into production
`lungitz-interactions.js`, update MASTHEAD-CONTRACT rows (modal gate, overlay
fullscreen, anchor masthead; retire drawer/frame rows), push, and you publish.

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

## Yours in the Designer (each activates the moment it exists)

1. **`.immersive-overlay` states** — the base (rest) should be hidden
   (display:none is fine ON YOUR CLASS — canvas-honest), and `.is-open` needs
   its open geometry (e.g. inset:0 / full-viewport; it currently opens at 0×0
   because only code's class toggle exists). Bar/caption styling all yours.
   Note: the old fullscreen chevron edge-zones still exist — once you feel the
   bar's ←/→, say if you want the edge zones retired.
2. **Landing modal on the index**: instance `container-landing-modal`
   (landing mode) on Home — and on `/sandbox` for testing. Style
   `.is-dismissed` (the dismissed state — code adds a fade/lift transition;
   opacity/transform end-state is yours to override). Wire its links:
   giveaways → `#info-giveaways`, hideaways → `#info-hideaways`, LUNGITZ →
   anywhere (clicks on it dismiss), bottom row → the three pages.
3. **`#info-giveaways` / `#info-hideaways` on /sandbox** — the anchors exist on
   Home but not the sandbox page; add them there (or re-duplicate) so the
   masthead words can be felt in the sandbox. Style `.category-content` +
   `.category-content.is-expanded` (code only flips the class on click).
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

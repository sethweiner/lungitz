# Session prompt — 2026-07-26 · iron out the last details

Read `CLAUDE.md` FIRST (working agreement — Webflow is the source of truth,
links carry meaning, routing keys off hrefs never classes, code smooths only).
Ownership ledger: `MASTHEAD-CONTRACT.md` (v32 section). Yesterday's full state:
memory `lungitz-build-state` + git log 2026-07-25.

## Where things stand (all live on lungitz.webflow.io staging)

v32 PROMOTED. The "Landing Modal" component IS the masthead (rest = word row,
`.is-active` = landing/menu; session-gated greet; `?menu=1`; LUNGITZ = menu
everywhere). "Immersive Overlay" = fullscreen (`.is-viewing`, growth in/out,
Back/Esc/✕ close). Both instanced on Home, both entry templates, and the three
menu pages (/participants /impressum /resources). Old Masthead +
container-landing-modal components unregistered. Props wired on Landing Modal
(Words / Menu row groups — labels bind on the INNER HEADINGS, links on the
Link wrappers; never bind text on a wrapper, it destroys children). Sitewide
uniform scrollbars. Contributors' `featured-work-giveaway/-hideaway` ref
fields auto-populated + published (35/37; eSeL + Flora Fellner empty).

## №1 — Participants links (Seth's top flag)

Target behavior: clicking a contributor name lands on the index **with that
entry OPEN** (state 2 — accordion expanded), not just scrolled/highlighted.

1. Designer half (Seth, or MCP with his go): wrap each name in
   `.content-participants` in a link bound to `Featured work (Giveaway)` →
   item's page, + conditional visibility (field is set); optional second link
   for `Featured work (Hideaway)` (institutions).
2. Code half: the participants→index rewrite (`participantsToIndex()` in the
   script) already converts `/giveaways/<slug>` → `/?entry=giveaways/<slug>`.
   Extend `arrive()` in the wayfinding module: after the scroll + rust cue,
   OPEN the entry (`trigger.querySelector('.header-accordion').click()` —
   mind CLOSE_STAGGER and don't fight the highlight-clear listeners).
3. Verify: participants page → click a name → index, entry open + lit.
   Multi-work overrides (Seth/Antoine custom picks) happen in the CMS.

## №2 — Bug sweep ("there's still some bugs" — walk every flow with Seth)

Known residuals & suspects to check one by one:
- Landing blurb lost its manual line breaks (flows as one paragraph now) —
  re-break in the component (Seth) or leave.
- `nav-item` combo hitchhiked onto the giveaways + participants headings
  (harmless cursor/display rules) — strip in Designer if it reads off.
- Modal expand/collapse SNAPS (display none/block) — motion is Seth's call:
  restyle the states (e.g. grid-rows drawer collapse; the injected transition
  list already covers grid-rows/opacity/transform/padding).
- `.category-content.is-expanded` styling not designed yet ("+" toggle works).
- Overlay bar/caption taste; decide keep-or-kill for the old fullscreen
  edge-chevron zones (`.fs-nav`) now the bar has ←/→.
- Delete orphaned overlay combos in Style panel: `is-open`, `is-active`,
  `is-fullscreen` (only `is-viewing` is wired). MCP must NOT touch shared-name
  combos (collapse gotcha).
- Keyboard arc re-verify against the modal (⏎/Esc/arrows; hint chip states).
- Mobile viewport pass + Seth's real-device pass (remember the in-app browser
  gotchas: hidden pane freezes transitions; mobile screenshots 2× scale).
- Ziegelwerk image 2 resolves to the transparent logo PNG (CMS image-set data).
- One transient Webflow 500 seen on staging (/?menu=1) — watch, likely noise.

## №3 — Retirements & content (when convenient)

- Menu Entries CMS collection + `/menu-entries` template + `sandbox-landing`
  page: retirable (confirm nothing binds them first).
- Client texts: final landing blurb, impressum/resources bodies.
- FINDABILITY-GO-LIVE.md stays domain-gated (robots/sitemap/JSON-LD ready).

## Mechanics

Script edits: `sandbox/v32.js` → test `/sandbox?v=32` → promote = copy to
`lungitz-interactions.js` with the production header (bail + `__lzLoaded`
guard; python splice pattern in yesterday's log). Push = deploy (~45s).
Site publish via MCP → webflow.io staging. Site id `69e8e0cd2f30bc2f64a90a92`;
components: Landing Modal `bdb90549-3f13-237f-1f24-16539c192f22`, Immersive
Overlay `10f6d3e0-9d1b-d9e7-7406-f3deb957b72c`.

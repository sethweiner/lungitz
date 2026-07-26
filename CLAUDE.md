# Lungitz — Working Agreement (read before ANY action)

This is a **Webflow project**. Webflow is the source of truth; code is a thin
behavior layer. Violating this is the #1 recurring failure — do not repeat it.

## The rules (Seth's, hard-won 2026-07-25)

1. **Links are the truth.** Navigation semantics live on real Designer links
   (`/#info-giveaways`, `/?menu=1`, page links). NEVER strip, bypass, or
   preventDefault-away a Designer link's meaning. The script only SMOOTHS
   links in place (glide instead of reload when the target is on-screen;
   toggle instead of reload on the index) and always yields otherwise.
2. **Elements, classes, and props live in Webflow.** Never build UI in JS,
   never inject visual styling (only: audit-blocked motion like grid-rows
   transitions, descendant selectors Webflow can't author, FLIP math —
   each one recorded in MASTHEAD-CONTRACT.md).
3. **Speak Seth's state classes** (`.is-active`, `.is-viewing`,
   `.is-expanded`…). NEVER invent a state name — if a state is missing, ask
   him to create it, named his way. Both states of everything must be
   stylable on the canvas.
4. **Components carry props.** When creating/transforming a component, wire
   link/text props immediately (transform_element_to_component creates NONE —
   add them or the component is dead weight in the properties panel).
5. **Wireframe-first**: Seth builds, code wires. Ask before any code-side
   experiment that touches the canvas. One behavior per round, verified on
   the live URL before the next.
6. **MCP gotchas that bite**: shared-modifier combos collapse (never
   create/update a combo whose modifier name already exists elsewhere, e.g.
   `is-open`); pages duplicated from Home may carry hidden index copies
   (`container-content.hide`) — index detection must use visible columns;
   element `id` attr is set via set_dom_id, not set_attributes;
   **binding `text` on a WRAPPER element (Link, Block) DESTROYS its child
   elements irreversibly** — bind text only on leaf text elements (Heading,
   Paragraph) that own their styling; link bindings on Links are safe.

## Current architecture (v32, promoted 2026-07-25)

- **"Landing Modal" component IS the masthead** (`bdb90549-…f22`): rest =
  word row (`.container-landing`), expanded = landing/menu (`.is-active`).
  Session-gated greet; `?menu=1` opens it on arrival; LUNGITZ toggles it.
  Props wired: 6 links + 6 labels + landing text.
- **"Immersive Overlay" component** (`10f6d3e0-…72c`) = fullscreen view;
  `.is-viewing` = open; growth in/out FLIP; browser Back closes.
- Both instanced on: Home, Giveaways/Hideaways templates, menu pages.
  The old Masthead + container-landing-modal components are unregistered.
- Script: `lungitz-interactions.js` (repo root) ← promoted from
  `sandbox/v34.js`. Deploy = git push → GitHub Pages (~45s). Sandbox testing:
  `/sandbox?v=N`. Site publish via MCP to the webflow.io staging subdomain.
- **Custom code lives in three places.** SITE **head** = the `html.lz-rest`
  landing gate (v35) — the only code that runs before first paint; it mirrors
  `landingModal`'s show/rest rule and **must be changed in lockstep with it**.
  SITE **footer** = the production script tag (loads everywhere). PAGE footer =
  the sandbox loader, on `/sandbox` ONLY — never copy it onto a real page:
  sandbox builds carry no `__lzLoaded` guard, so alongside production they
  double-bind every handler. It had been duplicated onto /participants
  /impressum /resources (they were duplicated from a page that had it) and 404'd
  on every view; cleared 2026-07-26. **Duplicating a page duplicates its custom
  code — check the footer block after any duplicate.**
- **Arrival state is a pre-paint problem, not a motion problem.** Webflow ships
  `.container-landing` already `.is-active` everywhere; the script loads async,
  after paint. Anything it has to *correct* is visible — animated it reads as a
  jump, instant it reads as a flash. Fix the paint (the head gate), never the
  timing of the correction. Learned the hard way 2026-07-26.
- Ownership ledger: `MASTHEAD-CONTRACT.md` (v32 section; above it is
  historical). Site id `69e8e0cd2f30bc2f64a90a92`.

## When editing the script

**Never read `location.search` / `location.hash` for an arrival decision** — read
`INITIAL_SEARCH` / `INITIAL_HASH` (captured at script start). Modules clean up
after themselves with `replaceState` (`arrive()` drops `?entry=`, `landingModal`
drops `?menu=1`), and those same flags are how *later* modules decide what to do,
so whoever runs second sees a URL the first one already erased. That is exactly
how a participant-name click opened an entry and then greeted the reader over it
(v36). Test arrival flows in a **cold session** — `seen=1` masks this whole class
of bug.

Edit `sandbox/vNN.js`, test on `/sandbox?v=NN`, then promote by copying to
`lungitz-interactions.js` with the production header (the `/sandbox` bail +
`window.__lzLoaded` guard — see current file head). Never push untested code
straight to the production filename.

**Promote step 2 — BUMP THE CACHE PIN (T-10, pinned 2026-07-26).** The SITE
FOOTER custom code loads the script with a **pinned** `?v=NN` (no more
`Date.now()`, which re-downloaded ~106KB every navigation). The pin is the cache
key: after every promote, edit the site footer (MCP `data_scripts_tool` →
`set_site_freeform_code`, location `footer`) to the new build number and publish
the site — **or visitors keep running the previous build indefinitely**. A
promote is not live until git push AND pin bump AND site publish have all
happened. Verify with `?lzdebug=1` (panel shows the build) on a hard reload.

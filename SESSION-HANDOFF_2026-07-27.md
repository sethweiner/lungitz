# Lungitz — handoff, 2026-07-27 (session end)

Read `CLAUDE.md` first, then `MASTHEAD-CONTRACT.md` (§15 = the lightbox drawer
protocol, added today — read it before touching the overlay). Script:
`lungitz-interactions.js` = **v88**, footer pin **`?v=88`**, site published.
Site `69e8e0cd2f30bc2f64a90a92` · staging `lungitz.webflow.io`.
Previous handoff (`SESSION-HANDOFF_2026-07-26-NIGHT.md`) is historical — everything
open in it is resolved or re-listed below.

**PROMOTE = THREE STEPS (contract §12): push the script → bump the footer cache pin
(`?v=NN`, MCP `set_site_freeform_code`) → publish the site.** Not live until all three.

## Shipped and verified today (v85 → v88, all Seth-approved on his devices or live)

| what | the one-line truth |
|---|---|
| 1-col entry open/close "not tuned like desktop" | wasn't a bug — v52's deliberate ≤767 transition kill; its ratchet had 4 authors and the other 3 were long fixed (v61/62/63), so v85 re-measured and retired it: entries keep their desktop tween at every width (25/31-step tweens, 0 long frames, exact landing) |
| Realm "+" drawers popped at 1-col | v86 — same kill, removed by pure subtraction; the Designer's own `all .2s` runs everywhere. The ≤767 injectCSS block now holds ONLY the accordion caption-drawer rule |
| Lightbox drawer (Seth's rebuild) | v87 — labeled slots addressed by `data-detail` (count zero-padded "01 / 02", edition, format, photo-credit, link), **empty value hides the whole wrapper** (no orphan labels), title = entry name only, external link = real `<a target=_blank>` painted from the entry's Web link, `.fs-count` injection + first-two-paragraphs paint retired. Protocol = contract §15 |
| Cursor + nav | v88 — one arrow pair (Seth's `[data-detail=prev/next]` buttons); script edge zones retired; image outer thirds show ←/→ cursors and click prev/next (capture phase); **middle third keeps Seth's click-step zoom untouched**; zoomed/single = pure zoom; touch = swipe, unchanged |
| Leaf coverage | hidden `[data-entry=weblink/format]` CMS leaves + visible `.edition` h4 now on Home, /sandbox AND both entry templates — entry-page lightboxes show full drawers |

## The whole to-do list

### Seth's open decisions (blocking their rounds, nothing else)
1. **"Photo" label** — per-image credits self-describe ("Photo © Jürgen Grünwald",
   "Design – Anna Weberberger"); the static label doubles/contradicts them.
   Recommendation on the table: delete the label paragraph. Alternative: CMS pass
   normalizing Credit-individual values (loses the Design/Photo role nuance).
2. **Cursor artwork** — code-SVG today (✕ ← →, off-white, module-scope constants).
   To make it Seth-editable: he uploads 26×26 SVGs as Webflow **Assets**, code swaps
   to the asset URLs once, art is his forever. Designer cannot author image cursors.
3. **Name the key-press flash state** — the a11y round wants arrow-key presses to
   visibly flash his prev/next buttons; that's a state class HE names (both states
   canvas-stylable, contract rule 3). Blocks the a11y round below.

### Next code round, specced and ready: ACCESSIBILITY (the "standard crisp lightbox" finish)
- `role="dialog"` + `aria-modal` on the overlay; focus moves in on open, Tab trapped
  inside, focus returns to the opening thumbnail on close.
- Arrow keys keep navigating + flash the matching button (needs decision 3).
- `aria-live="polite"` on the count slot; aria-labels exist already (Seth added them).
- **Alt text**: Image Sets has `alt-text` (draft values, `alt-status` tracks editorial
  state). Bind alt on the thumbnail images in the Designer (native binding), overlay
  copies it to `.immersive-image` when painting. Cheap, real win.

### Seth's Designer pile
- **Delete the dead `.detail-view` blocks** — in BOTH Home triggers, both templates,
  sandbox. Dead since the v66 ladder cut; now also 44 published copies of
  `data-detail="count/prev/next/expand/close"` noise. Paint is overlay-scoped so
  they're harmless, but they're weight and confusion. (Templates carry them with
  `is-active` combos.)
- Delete the drawer's stray **"Paragraph 2 — Credit"** paragraph (old build leftover).
- Decide the "Photo" label (decision 1) and delete it if agreed.
- Style the new template `.edition` h4 if its Home styling doesn't carry.
- Optional: rename the second `wrapper-photo-credit` (reused on the Link wrapper) if
  their styling should ever diverge — code doesn't care, attributes address values.
- Count slot: its mock spans got flattened to plain text — if current/total should be
  styled separately, name two spans and code repoints (one line).
- T-11 (old): move the ≤767 `.wrapper-content.is-left/.is-right{overflow:visible}`
  head override into the Designer, then delete that head block ONLY.
- Restyle `.is-pending` / `.is-realm` if those baselines aren't final.

### Code-side crumbs
- **T-15 (RUNNING in a separate background session)**: image-heavy entries load
  thumbs slowly on the phone. Delivery not motion. Leads recorded in the 07-26 handoff
  §T-15: no touch warm head-start (press IS the open), measure published srcset/
  transfer sizes first, staging adds ~2s. Check that session's outcome before
  starting fresh.
- **T-13**: keep or strip `?lzdebug` + flight recorder at sign-off.
- **T-14**: retire Menu Entries collection + `/menu-entries` template +
  `sandbox-landing` page once nothing binds them; sandbox `vNN.js` ≤ v87 prunable.
- **T-05**: final eye-check that phantom slivers are gone (half-confirmed).
- Phone feel-check of v85/v86 was done by Seth (approved); v87/v88 phone check pending
  (cursor round is hover-only so phones see no change; drawer worth one look).

### Design questions parked (not bugs)
- 15-image entries at phone width lay the strip in ONE row → ~19px thumbs; lightbox
  close into such an entry reads as shrink-to-sliver because that IS where the image
  lives. Layout decision (wrap the strip?), Seth's call.
- One undifferentiated "→" link arrow covers both PDFs and websites — label
  distinction wanted?

### Launch (beyond code)
- Client texts (landing blurb, impressum/resources bodies), Ziegelwerk
  transparent-PNG flag, findability go-live steps (domain-gated —
  FINDABILITY-GO-LIVE.md). Re-measure nav speed on the real domain (staging HTML
  adds ~2s).

## Traps that cost time today — read before debugging

- **`element_builder` set_style expands combo-only class names to a full WRONG combo
  chain** — `["hide"]` came back `["container-landing","is-active","hide"]` (the open
  modal's classes, on entry leaves). Caught and stripped live. Never pass a combo-only
  name; hidden data leaves are unstyled + hidden by injected `[data-entry]` CSS.
- **Eye-hidden elements are NOT published at all** (old memory, re-confirmed relevant)
  — never visibility-hide data leaves; CSS-hide them.
- **The control delegation `preventDefault()`s every `[data-detail]` click** — any new
  passive/link slot MUST be added to the early-return list or its clicks are swallowed
  (v87 learned this for the external link).
- **The sandbox page has its OWN trigger copies** — canvas edits to Home don't reach
  /sandbox; leaf-dependent features must be wired there too or sandbox tests lie.
- **Backgrounded/hidden tabs**: rAF dead, transitions frozen at frame zero, renderer
  can hang mid-evaluate. Motion measurements need a visible, active window (AppleScript
  front + resize worked). Structural/paint assertions are safe headless.
- GitHub Pages `head -N | grep` verification: mind the header growing past N — a
  "missing" build was just a too-short head window.

Sandbox record: v85–v88 in `sandbox/` (one behavior per build; git log tells the story).
Artifact: "Lungitz — Lightbox Anatomy" (claude.ai artifact, 07-27) maps the overlay
pre-rebuild; contract §15 supersedes it for wiring truth.

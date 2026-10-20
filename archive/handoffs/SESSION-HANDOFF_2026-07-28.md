# Lungitz — handoff, 2026-07-28 (session end — THE LIGHTBOX ARC IS DONE)

Read `CLAUDE.md` first, then `MASTHEAD-CONTRACT.md` **§15 + its v88/v89 addenda** —
that section IS the lightbox now. Script: `lungitz-interactions.js` = **v91**, footer
pin **`?v=91`**, site published. Site `69e8e0cd2f30bc2f64a90a92` · staging
`lungitz.webflow.io`. Older handoffs live in `archive/handoffs/`; sandbox builds
≤ v84 in `archive/sandbox/` (git history has everything).

**PROMOTE = THREE STEPS (contract §12): push script → bump footer pin (`?v=NN`, MCP
`set_site_freeform_code`) → publish site.** Not live until all three.

## This session (v89 → v91) — every open decision closed, all Seth-verified on device

| what | the one-line truth |
|---|---|
| Photo/Format/Edition/Link labels | Seth deleted them by hand; slots are value-only, paints unaffected |
| Cursor art is Seth's | three hidden `[data-cursor=close/prev/next]` Images in the overlay hold the artwork as ordinary assets (seeded `lightbox-cursor-*` in the Asset panel, exact copies of the old code SVGs); the script reads their src at init — **swap art in the asset picker, publish, done. No code.** Inline SVGs are only the fallback |
| `.is-active-key` (SETH-NAMED) | arrow keys press-flash the matching prev/next button 180ms; **the combo is UNSTYLED — Seth's canvas to-do** |
| Dialog a11y | role/aria-modal/aria-label = Designer attrs on the overlay root; focus in on open (tabindex -1), Tab wraps inside, focus returns to opener on close (preventScroll; never strands in the hidden dialog); count = aria-live polite |
| Per-slide alt text | thumbs bind Image Sets → Alt text (all six lists: Home ×2, sandbox ×2, templates ×2); the overlay image inherits per slide. Alt values are largely `draft-contextual` — the CMS `alt-status` field tracks the editorial pass still owed |
| Mobile stale-image flash | each slide seeds from the thumb's already-decoded srcset variant, upgrades to the full asset on load (guarded against fast arrows) |
| Mobile zoom = NATIVE | `touch-action: pan-y pinch-zoom`; tap-step zoom off on `hover:none`; custom layer is mouse/trackpad-only |
| Zoomed-in panning locked (v90) | the v89 script-guard wasn't enough — the BROWSER also needed permission: `visualViewport.scale > 1.05` flips the image's inline touch-action to `auto` (native owns all gestures), back at rest (swipe re-arms) |
| Desktop zoom cursors | `zoom-in` at rest (side thirds keep ←/→), `grab` zoomed, `grabbing` panning — native CSS cursors; promotable to `[data-cursor]` assets on request |
| Keyboard hint chip ("browse tooltip") | hidden site-wide (one `display:none` line in the kb module, v91) — keyboard nav fully intact; un-hide = delete that line |

Also this day, other session: **T-15 RESOLVED** — all 129 CMS thumbs re-uploaded via
the Designer/CMS UI path, full srcset live (karl 5.7MB→787KB, 7.3×). Standing rules:
**new CMS images upload through the Designer/CMS UI only** (API/CSV = no responsive
variants; Cmd+Shift+I does NOT backfill CMS files), finish with **SITE publish**
(item publish alone ships a bare img — srcset writes only at site publish), and
verify any new image by probing its `-p-500` URL (200 = good, 403 = bare). Full
mechanics + automation recipe: T-15 entry in
`archive/handoffs/SESSION-HANDOFF_2026-07-26-NIGHT.md` + auto-memory. Optional
polish: published `sizes` is the `100vw` fallback — a Cmd+Shift+I re-scan + site
publish may write measured values (phones then pick even smaller variants).
Housekeeping: delete unused test asset `6a6883ed…giveaway-nordfassade-01.jpeg`
from the Assets panel (T-15 leftover, invisible to the site).

## The to-do list (all that remains)

### Seth's Designer pile
- **Style `.is-active-key`** on `.button` (combo trick, contract rule 3) — until then
  the key-press flash is invisible.
- **Delete the "Paragraph 2 — Credit" stray** in `.caption-content` — it renders as
  literal static "Credit" text in the live drawer (flagged three times now).
- **Delete the dead `.detail-view` blocks** — Home ×2 triggers, both templates,
  sandbox ×2. Dead since v66; 44 published copies of `data-detail` noise.
- Style the template `.edition` h4 if Home's styling doesn't carry.
- Optional renames: second `wrapper-photo-credit` (Link wrapper), count-slot spans if
  current/total should style separately (then one-line repoint).
- T-11 (old): move the ≤767 `.wrapper-content.is-left/.is-right{overflow:visible}`
  head override onto the classes, then delete that head block only.
- Alt-text editorial pass: `alt-status` field tracks draft→confirmed per image.

### Code crumbs
- **T-13**: strip `?lzdebug` + flight recorder at sign-off, or keep (costs nothing).
- **T-14**: retire Menu Entries collection + `/menu-entries` template +
  `sandbox-landing` page once nothing binds them. (Sandbox file pruning DONE —
  ≤ v84 archived.)
- **T-05**: final phantom-sliver eye-check (half-confirmed, none seen since v62).
- If Seth wants the zoom cursors (zoom-in/grab/grabbing) as his assets: extend the
  `[data-cursor]` pattern — three more hidden Images + three CUR reads.

### Design questions parked (not bugs)
- 15-image entries at phone width: one-row strip → ~19px thumbs → lightbox close
  reads as shrink-to-sliver (truthful geometry). Layout decision: wrap the strip?
- One "→"/"LINK" arrow covers PDFs and websites alike — want a label distinction?

### Launch (beyond code) — the content+polish+publish round
- Client texts: landing blurb, impressum/resources bodies.
- Ziegelwerk transparent-PNG flag.
- Findability go-live (domain-gated): FINDABILITY-GO-LIVE.md.
- Re-measure nav speed on the real domain (staging HTML adds ~2s; on 07-28 staging
  measured 111 ms TTFB, so likely a non-issue — confirm once live).
- After connecting the custom domain: publish to BOTH targets, re-verify the
  cache-pinned script loads, and re-run arrival flows in a **cold session**
  (`seen=1` masks arrival bugs — CLAUDE.md rule).

## Traps recorded this session — read before debugging

- **A script-side guard is not permission.** v89 stood the swipe down while natively
  zoomed, but `touch-action` still denied the BROWSER pan-x — panning locked with
  nobody handling it. Gesture ownership needs BOTH: JS yields AND touch-action allows.
- **Swapping img.src keeps the OLD bitmap painted until the new file decodes** —
  invisible on warm caches, a real flash on mobile. Seed from the already-decoded
  variant, upgrade on load.
- **Webflow assets can't be replaced in place** (new upload = new URL) — never
  hardcode asset URLs for Seth-editable art; read them from hidden Designer-owned
  elements at runtime (`[data-cursor]` pattern, contract §15 v89 addendum).
- **`element_builder` set_style expands combo-only class names** to a full wrong
  combo chain (the `.hide` → `container-landing.is-active.hide` incident, 07-27).
  Data leaves stay unstyled; hide via attribute-keyed injected CSS.
- The eye toggle **omits elements from publish entirely** — CSS-hide data leaves.
- **A hidden/minimized Chrome tab stalls Designer uploads** and times out CDP —
  browser automation in Seth's Chrome needs the tab visible on screen (T-15).
- claude-in-chrome clicks are in **screenshot space** = CSS px × (screenshot
  width / `innerWidth`) — measure rects in JS, scale before clicking (T-15).
- **Webflow's CMS uploader dedupes identical bytes server-side** — re-uploading
  the same file can silently no-op; salt the bytes (trailing junk after EOI) to
  force a fresh file (T-15).

Sandbox record: v85–v91 in `sandbox/` (one behavior per build; git log tells the
story). The "Lungitz — Lightbox Anatomy" artifact is historical; contract §15 is
the wiring truth.

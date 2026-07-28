# Lungitz — handoff, 2026-07-26 (session end)

Read `CLAUDE.md` first, then `MASTHEAD-CONTRACT.md` (§2 code-owned rules, §6–§10 added
today). Script: `lungitz-interactions.js`, promoted from `sandbox/v58.js`.
Site `69e8e0cd2f30bc2f64a90a92` · staging `lungitz.webflow.io`.

## How to see what the site is actually doing

Append **`?lzdebug=1`** to any URL. A panel shows the build, viewport, whether the
≤767px media query matched, the live `transition-property`, whether the `#info` hash was
intercepted, the measured pad, `off_by` for the info block, pending image count, and a
trace. **Strictly opt-in** — nothing runs without the parameter. Contract §10.

Use it on a real device. The in-app browser pane reports `document.hidden` permanently,
which suspends rendering: `requestAnimationFrame` and `ResizeObserver` never fire there.
**Load-time scroll and animation behaviour cannot be verified in that pane.** Most of
today's lost time came from inferring across that gap.

---

## Fixed and verified today

| what | evidence |
|---|---|
| Participant names → index with entry open | 18 names live; cold click lands with the entry open and lit |
| Participants link firing "half the time" | 139ms race between page-clickable and href rewrite; routing moved into the head gate, pre-paint |
| Arrival greeted over the entry it opened | `arrive()` stripped `?entry=` before `landingModal` read it; both now read `INITIAL_SEARCH` |
| Menu-collapse flash on arrival | server ships `.is-active`; head gate decides pre-paint |
| Scrollbars flashing browser-default | declarations moved into site head |
| Entry anchor inconsistent | easing never reached its target (45px vs 67px by travel distance); now exact |
| Hover accent skipping type/author/edition | bare `h4` tag colour beats inherited; descendant rule added |
| Modal overflowing the frame | `.landing-content` had `height:88vh`; grid had one declared row |
| Masthead 5/9 asymmetry | row-gap rendered below a collapsed track |
| Mobile ghost trails ("like a magnet") | **the drag feature** — a scroll is a `pointermove`, so swiping lifted entries into `position:fixed` ghosts that `pointercancel` never dropped. Arrange is now mouse-only |
| Mobile anchors never worked | columns stack and the *page* scrolls; every routine wrote `column.scrollTop` |
| `#info` anchor | **`.wrapper-content.is-left/.is-right` had `padding-top:7vh` (50.4px) under a masthead ending at 58** — the first item in a column cannot be scrolled down, so its clearance is padding and nothing else. Now `5rem`. Verified `off_by=0` mobile, `-1` desktop |
| Viewport chrome cutting the bottom | `vh` → `dvh` |
| **1-column anchor did nothing** | two scroll paths existed and only arrivals had been migrated; the click path still picked a scroller and tweened it. Measured: `scrollY` 2200 before and after a GIVEAWAYS click. Both paths now ease through one error-paydown walk — verified single column −2120 → 68 (`off_by 0`), two column −1420 → 80 (`off_by −1`) |
| Blue tap flash | `-webkit-tap-highlight-color` |

**Partly solved:** the entry expand's *cause* is now confirmed and half the fix shipped; the
remaining half is one Designer value (T-01).

---

## Open tickets

### Blocking / functional

**T-01 — Entry expand animation — PARTLY REVERSED 2026-07-26 (late)**
> **Seth overruled the Designer half**: "you clobbered the thumbnail heights, it
> totally fucks up the layout." The ragged 73/62/73 heights ARE the design.
> `aspect-ratio: 3/2` is REMOVED from `.wrapper-thumbnail` (via MCP, snapshot-verified,
> published; ragged heights confirmed on staging). Never re-impose a uniform ratio.
> Measured consequence of the revert: 0/3 vs 3/3 images = 238 → 402px (`entryGrewBy 164`)
> — the cold-cache jump is structurally back; v60's warming only wins on fast networks.
> Replacement candidate: **sandbox/v62.js** stamps each `.wrapper-thumbnail` with its own
> image's natural ratio (inline, per image) at warm time — reservation without uniformity,
> ragged heights preserved exactly. Verified at 1-col (stamps `2400/1598, 2400/1350,
> 5616/3744`; heights identical with 0/N and N/N loaded; cold click grew 0). NOT yet
> verified at 2-col (the Chrome window went `document.hidden` mid-session — same rAF
> trap as the pane, it starves the glide too) and NOT promoted — Seth should see it
> first. Original T-01 record below, for the diagnosis.

**T-01 (original record) — Entry expand animation — FIXED (verify on your machine)**
Cause, confirmed by measurement: `.wrapper-thumbnail` had **no width or height of its
own**, so the strip was sized entirely by whatever the image turned out to be — and every
thumbnail is `loading="lazy"` with no height attribute. Until each image decoded it
occupied nothing, so the entry's height jumped as they arrived, during and after the
transition. No easing can smooth a box whose contents keep resizing, which is why every
attempt at the animation itself failed.

Two changes:
- `.wrapper-thumbnail { aspect-ratio: 3/2 }` (Designer) — reserves the space before the
  image exists. Chosen from measurement: thumbnails are a fixed 110px wide, and 3:2 is the
  dominant source ratio, so this is exactly the size they already occupied. Side effect:
  the strip is now a uniform row rather than ragged 73/62/73 heights — tidier, and change
  the ratio if you want it otherwise.
- v60: images fetch on hover and on press, so they are rarely still arriving at all.

**Verified:** an entry's height with images 0/5 loaded vs 5/5 loaded — `entryGrewBy: 0`.
The box no longer changes size as images land.

**T-02 — Fullscreen collapse targets the wrong image, and skews**
Collapsing from fullscreen returns to the *trigger* image, not the one being viewed, and
the image skews on the full→medium step. The FLIP in `closeFullscreen()` measures the
original trigger thumbnail; it should measure the thumbnail at `detail.idx`. Skew implies
non-uniform scale — likely mismatched aspect between measured and target rects.

**T-03 — No way out of zoom in the fullscreen lightbox**
Used to be a trigger cycle; now you must close the modal to unzoom. Regression in the
zoom step handler (`Click-step zoom`, around the `zoom` state).

**T-04 — Entry pages: landing modal appears first; colour scheme off**
`https://lungitz.webflow.io/giveaways/tearing-up`. The head gate is **Home-only**
(`p === '/'`), so entry pages get no pre-paint decision and the modal shows before the
script settles it. Accent/hover colours also wrong on these pages. Wants arrival straight
to CMS content.

**T-05 — Image sliver, Chrome only, clears on hover — LIKELY FIXED BY T-01, re-check**
Clearing *on hover* was the tell: hover triggered both a repaint and (since v60) the
fetch. With the space now reserved (T-01) a partly-decoded image can no longer show a
sliver of a box that has not been sized yet. Re-check in Chrome; if it survives, it is a
genuine paint bug and needs its own look.

**T-06 — Participant → open index entry loads slowly**
Full page navigation plus `@view-transition` holding the old page. Staging HTML measured
`responseEnd ≈ 1985ms`. See T-10.

### Design / system

**T-07 — Site-wide animation principle**
Nothing is shared: easings and durations are scattered across the script
(`SETTLE cubic-bezier(.16,1,.3,1)`, `CLOSE_EASE cubic-bezier(.4,0,.2,1)`, 450/500/620ms,
plus a 300ms view-transition). Consolidate into Designer variables and drive everything
from them, so the site reads as one system.

**T-08 — Page transitions / menu animation feel stiff away from the index**
E.g. participants → open index entry. Reuse the entry expand/collapse easing so a
navigation reads like the same gesture as an expand.

**T-09 — Page flash, Chrome only, ~half the time**
Suspect light/dark: cross-document view transitions paint a backdrop between documents.
Check `html { color-scheme }` and a solid background on `html`, plus
`::view-transition-old/new(root)` backgrounds. `@view-transition{navigation:auto}` is
injected by the script.

### Housekeeping before launch

**T-10 — Pin the script cache-buster.** Site footer appends `?v=' + Date.now()`, so the
~106KB script is re-downloaded on every navigation and never cached. Deliberate for
iteration; costly for visitors and it widens every load-timing race.

**T-11 — Migrate the TEMPORARY head override into the Designer.** Contract §6:
`.wrapper-content.is-left/.is-right { overflow: visible }` at ≤767px. Done by hand in the
Designer it is safe; I avoided MCP because `is-left`/`is-right` are shared modifier names.
*(Note: I did edit those combos today for padding and verified `.h5-nav.is-left/.is-right`
survived intact — so the hazard is real but detectable.)*

**T-12 — Keyboard focus / arrival cue don't tint the `h4` children.** They set colour
inline on the trigger, so there is no class for a descendant rule. **Needs a state class
you name** — I won't invent one.

**T-13 — Remove `?lzdebug=1` and the flight recorder** when the site is signed off, or
keep them; they cost nothing when unused.

**T-14 — Retirements.** Menu Entries collection + `/menu-entries` template +
`sandbox-landing` page, once nothing binds them.

---

## Things that will bite the next session

- **Verify on a real device.** The pane's `document.hidden` makes rAF/ResizeObserver dead.
  Prefer `setTimeout` + direct writes for anything load-timing related — that is the only
  reason the arrival fix was finally testable.
- **Which element scrolls is not a breakpoint fact.** It changes *during load*: the
  document is briefly tall before the columns take their height. Never branch on the
  breakpoint; measure, or pay down the error (`settleExactly`).
- **The masthead's height is type-driven** and grows as webfonts land (37px → 58px).
  Anything derived from it must be re-read, never cached.
- **Combos with shared modifier names** (`is-left`, `is-right`, `is-open`) can collapse
  when written over MCP. Snapshot the other users of that modifier first, write, then
  verify — that worked today.
- **A thing at scroll 0 cannot be scrolled further.** If the first item in a container is
  wrong, it is a layout value, not a scroll bug. This cost hours.

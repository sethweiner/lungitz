# Designer Handoff — 17.6 feedback round (2026-07-24)

The wireframe-first split, per the contract: **you build the elements in the
Webflow Designer; the code only wires state.** `sandbox/v31.js` is live on
`…/sandbox?v=31` and already looks for everything below — each piece activates
the moment your element exists. Production is untouched until we promote v31.

## 1. Elements to build in Webflow (code is already waiting for them)

### `.landing-veil` — the landing moment (client: "Landing page")
- A div in the **Home page body** (top level), class `landing-veil`.
- Style it entirely in the Designer: ink ground, dashed rust rule, title,
  intro text (client to supply), an "enter" affordance. It can echo the
  split-screen concept — the composition is yours.
- Code owns only: `position:fixed; inset:0; z-index:2000` + the dismiss motion
  (`.is-dismissed` fade/lift) + scroll-lock + skip on `?entry=`/`?realm=` deep
  links. Dismiss = click / ⏎ / Esc / space / first scroll. Shows every load;
  `?veil=0` suppresses it while testing.
- **Nothing renders until this element exists** (scaffold was removed per your call).

### `.nav-menu-toggle` — the menu's new handle
- Small element inside the **Masthead component** (a dashed `+`, the word
  "Index" — your call), class `nav-menu-toggle`.
- Why: GIVEAWAYS / HIDEAWAYS now **travel to their columns** (the client's
  "clicking should bring you there"), so the menu needs its own control.
- Interim fallback until it exists: **LUNGITZ toggles the menu on the index**
  (off the index LUNGITZ still means "home").

### Menu Entries template page (`/menu-entries/*`) — "submenus open a page"
- The page already exists (Webflow auto-created it; currently unstyled).
  Instance the masthead component on it, style the Body rich text, add a back
  affordance if wanted (browser-back and LUNGITZ→home are already wired).
- **Bind each `.nav-item` label as a link to Current Item's page** (wrap in a
  link block or make the label a text link). The moment an item has a real
  href, the code stops intercepting it and it navigates like a normal link —
  the inline reveal remains as fallback for unlinked items.
- Impressum as a real page also satisfies the Austrian Impressumspflicht.
- ⚠ Content prereq (client): real bodies for Friends / Supporters / Gusen III /
  Mauthausen / Resources (currently placeholder).

### Edition (already bound — needs your finishing)
- The client's "Edition field not showing up": nothing rendered it. I added an
  **h4, class `author`, bound to Giveaways → Edition**, right after the
  description in the Home giveaways list.
- Yours: restyle/reposition as taste dictates, and add **conditional
  visibility** (Edition is set) — the small `+` under Visibility in Element
  Settings — so empty editions don't leave a gap.

## 2. Styling taste (client feedback, your hands — exact targets)

| Client note | Where it lives |
|---|---|
| "Text entry (change style to white)" + "colors dark, text difficult to read" | Entry titles are `.title` (h1) and metadata `.number-list` / `.type` / `.author` — all on the ink-100/300 ramp. Lightening the **type-color tokens** cascades everywhere (23 type + 131 space refs are token-wired). |
| "Bottom line of dotted marks on layover misaligned / doesn't cover blue lines" | Diagnosed: sibling **thumbnails render at different natural heights** (e.g. Ziegelwerk: 193px vs 180px), so the veiled blue blocks (`.thumb-hover`, solid `accent-a-500`, inset 0) end at ragged bottoms inside the dashed frame. Fix in Designer: uniform thumb height on the `.wrapper-images` row (fixed height + `object-fit: cover` on `.image-thumbnail`, or align-stretch the row). |
| "Navigation icons above images only in giveaways column" | Not missing — both columns carry identical `.detail-bar`s. **Single-image entries skip state 3 entirely** (thumbnail → straight to fullscreen), and most hideaways are single-image, so the bar never appears there. By design; if the client insists, the option is routing singles through state 3 (code change, say the word). |

## 3. Already handled in v31 (code-side, nothing for you to do)

- GIVEAWAYS/HIDEAWAYS words → scroll + rust-light their realm (`?realm=` from
  entry/menu pages); transient cue like the `?entry=` arrival.
- Fullscreen ✕ restored **on touch devices only** (desktop keeps the clean
  frame; your `.frame-close` styling + reveal motion unchanged).
- Open menu drawer scrolls on mobile when taller than the viewport (the
  Impressum trap): `max-height: calc(100dvh - 1.5rem)` + momentum scroll,
  injected at ≤767px (breakpoint unified with the fixed masthead).
- External links open in a new tab (`noopener`), site-wide, just-in-time.
- LUNGITZ → home wired on every non-index page (menu template pages included).

## 4. Client items resolved by decisions (no build)

- **EN/DE toggle** — dropped for launch.
- **"Subpage for further infos?"** — submenus ARE pages now (see §1).
- **Mobile "text accumulates"** — does not reproduce after the June durability
  pass; verified stacking + accordion at 375px. Ask for a screenshot if the
  client still sees it (their device/browser version matters).
- **"Where to?" descriptions as first entry in each column** — content: client
  supplies the two texts; I can insert them via CMS in one pass.

## 5. Order of operations

1. You: build §1 elements (any order; each activates independently).
2. Client ping: menu bodies, column intros, veil intro text.
3. Feel it on `…/sandbox?v=31` (add `?veil=0` to skip the veil while iterating).
4. Say the word → I fold v31 into production `lungitz-interactions.js`, update
   MASTHEAD-CONTRACT rows, push, and you publish in Webflow.

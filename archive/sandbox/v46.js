(function () {
'use strict';

// Lungitz production interaction script. Promoted from sandbox/v17 (the cumulative
// winner: masthead menu drawer, immersive fullscreen frame, slideshow nav, layered
// zoom/pan, arrangement). Loaded by the Home page — bail on /sandbox so it doesn't
// double-bind with the loader's sandbox/vN.js. The injected CSS scaffold below is
// being migrated to Designer combos; motion + grid-rows transitions stay here.
// [sandbox v32] production's /sandbox bail is removed so this standalone build runs here.
// v32 — LANDING/MENU MODAL CONCEPT (Seth's wireframes, 2026-07-25):
//   · §landingModal: Seth's container-landing modal IS the landing + the menu — greets on
//     arrival at the index, dismisses on any click outside its links, LUNGITZ re-opens it
//     (dormant until the modal is instanced on the page — wireframe-first)
//   · §masthead (focused): GIVEAWAYS/HIDEAWAYS → #info-giveaways / #info-hideaways anchors
//     (+ rust cue); LUNGITZ → the modal / home; .category-content "+" toggles .is-expanded
//   · fullscreen: Seth's .immersive-overlay becomes the state-4 view when present (paint,
//     .is-open, light FLIP in); the proven gesture layer retargets; legacy portal path is the
//     fallback until the overlay exists on the index
//   · browser BACK closes fullscreen (history state — the Antoine fix: Esc is never the only
//     way out; the hint chip advertises "✕ / back" in browser-fullscreen)
//   · participants links rewrite to /?entry=<coll>/<slug> — index arrival highlight
// v46 (2026-07-26) — DRAG IS OFF ON TOUCH; anchors MEASURE the masthead.
//   · The 64px anchor pad was a desktop constant from when the masthead was 41px.
//     It is 39px at 375px and changes with the word row's type at every breakpoint,
//     so the offset was right on desktop and arbitrary everywhere else. anchorPad()
//     now reads the fixed masthead's actual bottom edge and adds the same breathing
//     room, so entries, #info glides and hash arrivals all clear the real thing.
// v46 (2026-07-26) — DRAG IS OFF ON TOUCH, and a lifted entry can never be orphaned.
//   The mobile 'ghost trails that accumulate like a magnet' were not a repaint bug at
//   all: a scroll IS a pointermove, so a swipe starting on an entry lifted it into a
//   position:fixed .arrange-ghost, and the browser then fired pointercancel (not
//   pointerup) when it took the gesture over — so drop() never ran. Arrange now arms
//   for mouse only, and pointercancel always cleans up.
// v45 (2026-07-26) — the #info re-anchor WATCHES the cause instead of guessing when
//   it ends. Fixed timers were a guess at when the page stops reflowing; on a slow
//   connection the last pass still fired too early and the info text stayed low.
//   A ResizeObserver reacts to the actual reflows (fonts, images, CMS lists), so it
//   is right whether the page settles in 200ms or four seconds. Hard 6s ceiling,
//   cancelled by any real scroll/touch/keypress.
// v44 (2026-07-26) — and it re-settles until the page stops moving. One pass at
//   fonts.ready was still landing in a layout that kept reflowing (images, CMS
//   lists), so the info text stayed 80px low. Now re-applied across the first 1.4s,
//   cancelled by any real scroll/keypress so it cannot yank a reader.
// v43 (2026-07-26) — that re-anchor CORRECTS, it does not perform. Sliding the page
//   80px over 620ms on arrival reads as the thing moving under you; arrive() already
//   settled this argument for ?entry=. scrollToTrigger takes an `instant` flag now.
//   Measured against the real drifted page: info block 144 -> 64, exactly on the mark.
// v42 (2026-07-26) — the info text's hash arrival, finished. v41's scroll-padding got
//   the browser's jump into the right neighbourhood, but the browser jumps at parse
//   time and the web fonts reflow everything above the target afterwards: measured
//   80px of drift deep in the stacked mobile layout. Re-anchor once fonts AND images
//   have settled, through the same scrollToTrigger everything else uses.
// v41 (2026-07-26) — and the INFO text's hash arrival, the other half of that.
//   v40 fixed the JS glide by asking which element scrolls. Native #info-* hash
//   jumps take a different route entirely: the browser does them, and it honours
//   scroll-padding only on the real scroller. 64px sat on .wrapper-content — the
//   scroller on desktop, but not at the mobile breakpoint, where the columns stack
//   and the document scrolls. So a hash arrival parked the info block under the
//   fixed masthead with its first lines cut. Now on html too, and in the head gate
//   because the hash scroll happens during load, before this script exists.
// v40 (2026-07-26) — THE ANCHORS NEVER WORKED ON MOBILE. Answering Seth's "do all the
//   anchor points work on the breakpoints?": no. Desktop gives each column its own
//   scroll container; at the mobile breakpoint the columns STACK and the page scrolls,
//   so the column is just a tall block. scrollToTrigger wrote col.scrollTop either
//   way, which on mobile sets a property nothing reads — opening an entry, the #info
//   words and the ?entry= arrival all silently did nothing. It now asks which element
//   actually scrolls and measures against that scrollport.
// v39 (2026-07-26) — undo v38's Designer-invisible layout, and light the open entry:
//   · The modal frame height moved OUT of here and onto .nav.wide.landing in the
//     Designer, so the component renders correctly on canvas (v38 kept it injected,
//     which is why the canvas looked broken while the published page was fine, and
//     why the modal painted at the wrong height for a frame on load). Code now owns
//     only the RESET: a resting word row must not inherit a full-frame height or it
//     becomes an invisible block over the index. Head gate carries the same reset.
//   · .open h4 joins the hover rule — the open entry was lighting everywhere except
//     its type/author/edition, the same h4-tag-colour-beats-inheritance shortfall.
// v38 (2026-07-26) — the sweep, continued:
//   · SCROLL RATCHET: scrollToTrigger re-timed. v37's exponential never reached its
//     target and snapped the last ~19px on exit; it now eases on elapsed time
//     (easeOutCubic) so it arrives exactly, with velocity already at zero.
//   · MODAL FITS THE FRAME: height cap + explicit third grid row + min-height:0,
//     scoped to .is-active so the resting word row never gets a height.
//   Paired with a Designer change (row-gap 0 on .nav.wide.landing, 4px margin on
//   .landing-content) that fixes the 5px/9px asymmetry under the resting word row.
// v37 (2026-07-26) — DESIGN BUG SWEEP (Seth's list), code half:
//   · ANCHOR: scrollToTrigger now lands EXACTLY on the mark. Its easing closed ~8%
//     of the gap per frame and gave up after 60, so where an entry settled depended
//     on how far it travelled — short hop exact, long scroll ~16px short.
//   · #info-giveaways / #info-hideaways use that same anchor instead of
//     scrollIntoView({block:'start'}), which aligned them under the fixed masthead.
//   · HOVER: .trigger-accordion:hover sets `color`, which only inherits; the <h4>
//     children (.type/.author/.edition) carry the bare h4 tag colour and so ignored
//     it. Descendant rule added — the one thing the Designer cannot author.
//   Still Seth's in the Designer: the modal overflowing the viewport, and the 4px
//   row-gap that renders below the resting word row (see the reply / contract).
// v36 (2026-07-26) — THE ARRIVAL URL IS READ-ONCE. arrive() drops ?entry= from the
//   URL (so a refresh won't re-fire), and it runs EARLIER in this file than
//   landingModal — which was reading location.search to decide whether to greet.
//   On the first visit of a session a participant-name click therefore opened the
//   entry and then greeted the reader straight over the top of it. Both modules now
//   read INITIAL_SEARCH / INITIAL_HASH, captured before anything can rewrite them.
//   Only surfaced once the names were really bound — with dead '#' links the flow
//   was unreachable, and a warm session (seen=1) masked it.
// v35 (2026-07-26) — KILL THE ARRIVAL FLASH AT THE SOURCE. v34 made the arrival
//   settle instant instead of a 450-600ms collapse, but BOTH still painted the
//   menu open first and then changed it — an instant snap of a fullscreen element
//   reads as a flash, which is worse, not better (Seth: "it was cleaner before").
//   The real fix is to never paint the wrong state: site HEAD custom code decides
//   synchronously, before first paint, whether Home should rest as the word row and
//   sets html.lz-rest. This module drops that class once it has set the real state,
//   so from then on .is-active alone rules and LUNGITZ still opens the menu.
//   No-JS safe: the head gate never sets lz-rest for ?menu=1, and LUNGITZ is a real
//   link to /?menu=1, so the menu is reachable with the script absent entirely.
// v34 (2026-07-26) — PAGE-TRANSITION JUMP: the modal's motion is armed only after the
//   arrival state has painted. Webflow ships .container-landing .is-active in every
//   page's HTML; the async script strips it on Home, and with motion armed from the
//   start that played a 450-600ms collapse of the whole menu as the page appeared.
//   Back/forward looked perfect because bfcache restores the settled DOM. See §landingModal.
// v33 (2026-07-26) — PARTICIPANTS ARRIVAL, two code-side halves of Seth's №1 ticket:
//   · arrive() now OPENS the entry it lands on (state 2), not just scrolls + lights it —
//     the target behavior for a contributor-name click. Deep links (/?entry=…) get it too.
//   · a contributor name whose Designer link is still an empty "#" no longer yanks the page
//     to the top of the list — a link with no destination now does nothing (code smooths a
//     link that cannot act; it strips no meaning, there is none in "#").
//   The other half is Seth's: bind each name in .content-participants to Featured work
//   (Giveaway) → the item's page, so the href reads /giveaways/<slug>. The MCP cannot
//   author a reference→collection-page link (tried: it publishes as "#"). Once bound,
//   participantsToIndex() rewrites it and this arrival opens it — no further code needed.
//   · RETIRED: the drawer menu (v8→v31), the landing veil, ?realm= wayfinding, the
//     is-immersive masthead frame (the overlay carries its own bar/✕)
//   · kept from v31: external links → new tab (noopener)

var TRIGGER    = '.trigger-accordion',
    HEADER     = '.header-accordion',
    CONTENT    = '.content-accordion',
    W_THUMB    = '.wrapper-thumbnail',
    IMG_THUMB  = '.image-thumbnail',
    DETAIL     = '.detail-view',
    DETAIL_IMG = '.detail-image',
    CAPTION    = '.caption-drawer',
    CAP_BODY   = '.caption-content',
    TRANSITION = 500,
    SETTLE     = 'cubic-bezier(0.16, 1, 0.3, 1)',
    CLOSE_EASE = 'cubic-bezier(0.4, 0, 0.2, 1)',
    CLOSE_STAGGER = 140;

// The URL AS THE READER ARRIVED, captured before any module can rewrite it.
// Several modules clean up after themselves with history.replaceState (arrive()
// drops ?entry= so a refresh won't re-fire; landingModal drops ?menu=1), and
// those flags are also how LATER modules decide what to do. Reading
// location.search directly means whoever runs second sees a URL the first one
// already erased — which is exactly how a participant-name click ended up
// greeting the reader over the entry it had just opened. Ask these, not the URL.
var INITIAL_SEARCH = location.search,
    INITIAL_HASH   = location.hash;

var detail      = null,
    fs          = null,
    fsHome      = null,
    zoom        = null,
    panState    = null,
    dragMoved   = false,
    pendingOpen = null,
    modalToggle = null,    // set by §landingModal; used by §masthead (LUNGITZ)
    goInfo      = null,    // set by §masthead; used by §landingModal (anchor links)
    fsPushed    = false;   // fullscreen pushed a history entry (back closes it)

// State-4 view (v32): Seth's Designer-owned overlay when it exists on the page
// (wireframe-first find-or-reuse); the legacy promoted detail-view otherwise.
var OVERLAY = document.querySelector('.immersive-overlay');
var FS_IMG  = '.immersive-image, .detail-image';
function fsImage() { return fs ? fs.view.querySelector(FS_IMG) : null; }

// "Am I on the index?" — only VISIBLE columns count. Menu pages built by
// duplication can carry a hidden copy of the index (.container-content.hide);
// offsetParent is null inside display:none, so hidden copies don't fool this.
function onRealIndex() {
    var col = document.querySelector('.wrapper-content.is-left, .wrapper-content.is-right');
    return !!(col && col.offsetParent !== null);
}

// ── Soft page transition (entry ↔ index) ──
// Opt into the cross-document View Transitions API so same-origin navigations
// cross-fade instead of hard-cutting. Progressive: unsupported browsers just
// hard-navigate (the @rule is ignored). Injected site-wide, early.
(function softNav() {
    var s = document.createElement('style');
    s.textContent = '@view-transition{navigation:auto}'
        + '::view-transition-old(root),::view-transition-new(root){'
        + 'animation-duration:300ms;animation-timing-function:ease}';
    (document.head || document.documentElement).appendChild(s);
}());

// ── Injected styles (scrollbars + detail animation) + theme-color ──
(function injectCSS() {
    var INK = 'var(--_lungitz---color-ink-900)',
        css = [
            // ENTRY ACCENT IN THE OPEN STATE (v39). Same inheritance shortfall the
            // hover rule below fixes: the <h4> children carry the bare h4 tag
            // colour, so they ignore any colour inherited from the trigger — which
            // is how the open entry lit up everywhere EXCEPT its type/author/edition
            // (Seth: "when an entry's focused, not all of the elements accept the
            // accent"). .open is the class the ladder already sets, so no new state
            // name is invented here. The keyboard ring and the arrival cue set colour
            // INLINE on the trigger and so still fall short — fixing those needs a
            // real state class, which is Seth's to name.
            '.trigger-accordion.open h4,',
            '.category-content.open h4{',
            '  color:var(--_lungitz---color-accent-b-500);',
            '}',
            // HOVER ACCENT REACHES THE WHOLE ENTRY (v37). .trigger-accordion:hover
            // sets `color`, which only INHERITS — so any child carrying its own
            // color ignores it. Every element that stayed put is an <h4> (.type,
            // .author, .edition) picking up the bare `h4{color:accent-a}` tag
            // style, and an explicit rule always beats an inherited one. Nothing
            // is misconfigured in the Designer; it just cannot author a
            // descendant selector, which is the only thing that fixes this
            // (contract §2). Hover only — the rust arrival cue has the same
            // shortfall, but naming a state for it is Seth's call, not code's.
            '.trigger-accordion:hover h4,',
            '.category-content:hover h4{',
            '  color:var(--_lungitz---color-accent-b-500);',
            '}',
            // SITEWIDE scrollbars (Seth, 2026-07-25: "make all the scrollbars
            // uniform, like the home page"). Universal because scrollbar-color
            // doesn't inherit — every scroll container on every page gets the
            // same thin dark treatment. Code-owned: Webflow can't author
            // ::-webkit-scrollbar. (Supersedes the old per-container rules.)
            // NOTE: these same declarations are also in the site HEAD custom code
            // so they apply before first paint — this async copy would otherwise
            // let the browser's default scrollbars show and then restyle.
            '*{',
            '  scrollbar-width:thin;',
            '  scrollbar-color:#000 color-mix(in srgb,' + INK + ',#000 20%);',
            '}',
            '*::-webkit-scrollbar{width:8px;height:8px}',
            '*::-webkit-scrollbar-track{',
            '  background:color-mix(in srgb,' + INK + ',#000 20%);',
            '}',
            '*::-webkit-scrollbar-thumb{',
            '  background:#000;border-radius:4px;',
            '}',
            '*::-webkit-scrollbar-thumb:hover{',
            '  background:#1a1a1a;',
            '}',
            // Native #info-* hash jumps must clear the fixed masthead, on WHICHEVER
            // element is doing the scrolling — scroll-padding only counts on the
            // actual scroller. The column is it on desktop; at the mobile breakpoint
            // the columns stack and the document scrolls, and html had no padding, so
            // a hash arrival parked the info block under the masthead with its first
            // lines cut off. Same 64px the JS anchor uses, so both routes agree.
            // Also in the site HEAD, because the browser performs the hash scroll
            // during load — before this async script exists. Keep the two in step.
            'html,.wrapper-content{scroll-padding-top:64px;}',
            '.detail-view{',
            '  transform:scale(0.95);opacity:0;',
            '  transition:transform 400ms ' + SETTLE + ',opacity 300ms ease;',
            '}',
            '.detail-view.is-active{transform:scale(1);opacity:1}',
            '.is-left .detail-view{transform-origin:left top}',
            '.is-right .detail-view{transform-origin:right top}',
            '.content-accordion{',
            '  transition:opacity 120ms ease;',
            '}',
            // Arm `padding` on the base trigger transition (the Designer one omits it)
            // so the open-padding (space-6) ↔ base (space-3) change ANIMATES. A
            // transition present only on .is-closing is SKIPPED (not armed before the
            // change) — which is why the close still snapped ~10px while the grid-rows
            // collapse (armed on the base) was smooth. Replicates the Designer base
            // transition verbatim + adds padding; existing easings unchanged.
            '.trigger-accordion{',
            '  transition:grid-template-rows .45s ' + SETTLE + ',color .175s,border-color .25s ' + SETTLE + ',border-radius 75ms,padding .45s ' + SETTLE + ';',
            '}',
            '.trigger-accordion.is-closing{',
            // Also ease `padding`: the open entry has padding-top/bottom space-6
            // (~22px) vs the base space-3 (12px); without this it SNAPS on close
            // (.open removed) and the contents — incl .author — jump ~10px.
            '  transition:grid-template-rows 500ms ' + CLOSE_EASE + ',padding 500ms ' + CLOSE_EASE + '!important;',
            '}',
            '.trigger-accordion.is-closing .content-accordion{',
            '  opacity:0;',
            '}',
            // Caption-drawer collapse motion lives here in code, not the Designer:
            // Webflow's "invalid styles" audit rejects a transition on
            // grid-template-rows and blocks publishing. The Designer keeps only the
            // static grid (display:grid; rows auto 1fr → auto 0fr on .is-collapsed);
            // the smooth collapse is injected (our motion-in-code split). Remove the
            // grid-template-rows transition from .caption-drawer in the Designer.
            '.caption-drawer{',
            '  transition:grid-template-rows .45s ' + SETTLE + ';',
            '}'
        ],
        style = document.createElement('style'),
        ink, meta;
    style.textContent = css.join('\n');
    document.head.appendChild(style);

    ink = getComputedStyle(document.documentElement)
        .getPropertyValue('--_lungitz---color-ink-900').trim();
    if (ink) {
        meta = document.querySelector('meta[name="theme-color"]');
        if (!meta) {
            meta = document.createElement('meta');
            meta.name = 'theme-color';
            document.head.appendChild(meta);
        }
        meta.content = ink;
    }
}());

function getImages(trigger) {
    var thumbs = trigger.querySelectorAll(W_THUMB),
        out = [];
    thumbs.forEach(function (t) {
        var img = t.querySelector(IMG_THUMB);
        out.push({
            src:     img ? (img.src || img.getAttribute('src')) : '',
            caption: t.getAttribute('data-caption') || '',
            credit:  t.getAttribute('data-credit')  || ''
        });
    });
    return out;
}

function thumbIndex(trigger, thumb) {
    var all = trigger.querySelectorAll(W_THUMB),
        i;
    for (i = 0; i < all.length; i += 1) {
        if (all[i] === thumb) {
            return i;
        }
    }
    return 0;
}

// Settle an element to `pad` below the top of its scrolling column.
//
// v38 — TIME-BASED, so it ARRIVES instead of asymptoting. The original eased by
// closing ~8% of the remaining gap per frame and bailing after 60 frames: an
// exponential like that never actually reaches its target, so where an entry
// came to rest depended on how far it had travelled (measured: 45px after a long
// scroll, 67px after a short one, against an intended 64). v37 papered over that
// by snapping to the target on exit — which fixed the landing spot but jumped the
// last ~19px in a single frame. That is the ratchet just before it lands.
//
// Easing on elapsed TIME with easeOutCubic fixes both at once: progress reaches
// exactly 1, so the final position is exact with no snap, and the curve's velocity
// is already ~0 by then, so it glides in. The destination is re-read every frame
// (it moves while a sibling collapses and this entry expands — 140ms stagger plus
// a .45s grid-rows transition), and DUR outlasts that settling so the last frames
// track the final layout.
// How far below the top of the scrollport anything should come to rest: clear the
// fixed masthead, then breathe. MEASURED, not assumed — 64px was a desktop constant
// baked in from when the masthead was 41px tall, and the masthead is a different
// height at every breakpoint (39px at 375, and it grows with the word row's type),
// so a fixed number was right on desktop and arbitrary everywhere else. Reading it
// means the entry anchor, the #info glide and the hash arrival all clear the real
// masthead at whatever size it currently is.
function anchorPad() {
    var mast = document.querySelector('.nav.wide'), r;
    if (!mast) { return 64; }
    r = mast.getBoundingClientRect();
    if (getComputedStyle(mast).position !== 'fixed' || r.height === 0) { return 64; }
    return Math.round(r.bottom + 23);      // 23px = the breathing room 64 gave at 41px
}

function scrollToTrigger(trigger, instant) {
    var col = trigger.closest('.wrapper-content'),
        pad = anchorPad(), DUR = 620, scroller, docScroll, from, start = null;
    // WHICH THING ACTUALLY SCROLLS (v40). On desktop the two columns are their own
    // scroll containers, so the column is the scroller. At the mobile breakpoint the
    // columns stack and the PAGE scrolls instead — the column is just a tall block.
    // Every scroll here used to write col.scrollTop unconditionally, which on mobile
    // set a property nothing reads: opening an entry, the #info words and the ?entry=
    // arrival all silently failed to move. Ask the element whether it scrolls rather
    // than assuming the desktop layout.
    scroller = (col && col.scrollHeight > col.clientHeight + 1)
        ? col : (document.scrollingElement || document.documentElement);
    docScroll = scroller === (document.scrollingElement || document.documentElement);
    if (!col && !docScroll) {
        return;
    }
    from = scroller.scrollTop;
    function aim() {                       // absolute destination, stable as we scroll
        // measure against the scrollport's top: the viewport when the page scrolls,
        // the column's own box when the column does
        var top = docScroll ? 0 : scroller.getBoundingClientRect().top;
        return Math.max(0, scroller.scrollTop
             + trigger.getBoundingClientRect().top - top - pad);
    }
    function step(now) {
        if (start === null) { start = now; }
        var p = Math.min(1, (now - start) / DUR),
            eased = 1 - Math.pow(1 - p, 3);
        scroller.scrollTop = from + (aim() - from) * eased;
        if (p < 1) { requestAnimationFrame(step); }
    }
    if (instant) {                     // arrivals correct themselves, they don't perform
        scroller.scrollTop = aim();    // (the arrive() precedent: a slide on load reads as jumpy)
        return;
    }
    requestAnimationFrame(step);
}

// ── State 3 : Detail ──

function paintDetail(view) {
    var img, n, el, count, caps, prev, next;
    if (!detail) {
        return;
    }
    img = detail.images[detail.idx];
    n   = detail.images.length;

    el = view.querySelector(FS_IMG);       // .immersive-image (overlay) or .detail-image
    if (el && img.src) {
        el.src = img.src;
    }

    count = view.querySelector('[data-detail="count"]');
    if (count) {
        count.textContent = (detail.idx + 1) + ' / ' + n;
    }

    // Overlay bar title (v32): "N · Entry Title" — N pages with the slides.
    var bar = view.querySelector('[data-detail="title"]');
    if (bar) {
        var tEl = detail.trigger.querySelector('.title');
        bar.textContent = (detail.idx + 1) + ' · ' + (tEl ? tEl.textContent.trim() : '');
    }

    // Fullscreen slide counter — sits first in the caption row (bottom-left,
    // before the caption). Shown only in fullscreen; the state-3 bar carries
    // the other one. Created lazily per detail-view.
    var capRow = view.querySelector(CAP_BODY);
    if (capRow) {
        var fsCount = capRow.querySelector('.fs-count');
        if (!fsCount) {
            fsCount = document.createElement('span');
            fsCount.className = 'fs-count';
            capRow.insertBefore(fsCount, capRow.firstChild);
        }
        fsCount.textContent = (detail.idx + 1) + ' / ' + n;
    }

    caps = view.querySelectorAll(CAP_BODY + ' p');
    if (caps[0]) {
        caps[0].textContent = img.caption;
    }
    if (caps[1]) {
        caps[1].textContent = img.credit;
    }

    prev = view.querySelector('[data-detail="prev"]');
    next = view.querySelector('[data-detail="next"]');
    if (prev) {
        prev.style.display = n > 1 ? '' : 'none';
    }
    if (next) {
        next.style.display = n > 1 ? '' : 'none';
    }
}

function openDetail(trigger, idx, images) {
    var content    = trigger.querySelector(CONTENT),
        detailView = content ? content.querySelector(DETAIL) : null,
        thumb, thumbRect, contentRect, originX, originY;
    if (!detailView) {
        return;
    }

    // Engaged state: clear any previously-revealed thumbnail veil in this entry.
    trigger.querySelectorAll(W_THUMB).forEach(function (t) {
        var th = t.querySelector('.thumb-hover');
        if (th) { th.classList.remove('is-revealed'); }
    });

    thumb = trigger.querySelectorAll(W_THUMB)[idx];
    if (thumb && content) {
        thumbRect   = thumb.getBoundingClientRect();
        contentRect = content.getBoundingClientRect();
        originX = (thumbRect.left + thumbRect.width / 2 - contentRect.left) + 'px';
        originY = (thumbRect.top + thumbRect.height / 2 - contentRect.top) + 'px';
        detailView.style.transformOrigin = originX + ' ' + originY;
    }

    var imgWrap = content.querySelector('.wrapper-images');
    if (imgWrap) {
        imgWrap.style.display = 'none';
    }

    detailView.style.opacity = '0';
    detailView.style.transform = 'scale(0.95)';
    detailView.classList.add('is-active');
    void detailView.offsetHeight;
    detailView.style.opacity = '';
    detailView.style.transform = '';

    detail = { trigger: trigger, idx: idx, images: images };
    paintDetail(detailView);
}

function closeDetail(trigger) {
    var content = trigger.querySelector(CONTENT),
        detailView;
    if (!content) {
        return;
    }
    detailView = content.querySelector(DETAIL);

    if (detailView) {
        detailView.classList.remove('is-active');
    }

    var imgWrap = content.querySelector('.wrapper-images');
    if (imgWrap) {
        imgWrap.style.display = '';
    }

    if (detail && detail.trigger === trigger) {
        // Engaged state: keep the thumbnail you were viewing revealed (veil
        // lifted) on return — styled in Designer via .thumb-hover.is-revealed.
        var thumbs = trigger.querySelectorAll(W_THUMB);
        if (thumbs[detail.idx]) {
            var th = thumbs[detail.idx].querySelector('.thumb-hover');
            if (th) { th.classList.add('is-revealed'); }
        }
        detail = null;
    }
}

// ── State 4 : Fullscreen (FLIP — same element promotes to fixed) ──

// Propagate the .is-fullscreen state to every descendant so children can be
// styled per-element in the Designer via `.child.is-fullscreen` combos (which
// revert on close). Webflow can't author `.detail-view.is-fullscreen .child`
// descendant rules, so the state class cascades instead.
function propagateFs(view, on) {
    var els = view.querySelectorAll('*'), i;
    for (i = 0; i < els.length; i += 1) {
        if (on) { els[i].classList.add('is-fullscreen'); }
        else { els[i].classList.remove('is-fullscreen'); }
    }
}

// Return the portal'd modal to its home slot in the entry (see openFullscreen).
function fsRestore(view) {
    if (fsHome && fsHome.parent) {
        fsHome.parent.insertBefore(view, fsHome.next);
    }
    fsHome = null;
}

// Realm highlight: light a masthead word in the rust accent. Shared by the
// hover cue (states 1–3) and the fullscreen lock (state 4).
function lightRealm(side) {
    var g = document.querySelector('.nav-giveaways .h5-nav'),
        h = document.querySelector('.nav-hideaways .h5-nav');
    if (g) { g.classList.toggle('is-realm', side === 'giveaways'); }
    if (h) { h.classList.toggle('is-realm', side === 'hideaways'); }
}

// Fullscreen side-state. v32: with the Designer overlay the masthead stays
// itself (the overlay carries its own bar/✕) — the .is-immersive frame only
// applies on the LEGACY path. Body flags for the chevrons + the realm word
// cue apply to both.
function setImmersive(on, trigger) {
    var nav, side;
    // Toggle the body flag the slideshow chevrons key off (multi-image only).
    document.body.classList.toggle('is-fs', on && !!detail && detail.images.length > 1);
    if (!on) { document.body.classList.remove('is-fs-zoom'); }
    if (on && trigger) {
        side = trigger.closest('.wrapper-content.is-right') ? 'hideaways'
             : (trigger.closest('.wrapper-content.is-left') ? 'giveaways' : null);
        lightRealm(side);
    } else {
        lightRealm(null);
    }
    if (OVERLAY) { return; }                 // overlay world: no masthead frame
    nav = document.querySelector('.nav.wide, .nav.expand');
    if (nav) { nav.classList.toggle('is-immersive', on); }
}

// ── History-backed close (the Antoine fix) ── opening state 4 pushes an entry
// so browser BACK closes fullscreen — Esc is never the only way out (in
// browser-fullscreen the browser eats Esc). UI closes route through
// history.back() so the history stays consistent.
function pushFsState() {
    try { history.pushState({ lzFs: 1 }, ''); fsPushed = true; } catch (e) {}
}
window.addEventListener('popstate', function () {
    if (fs) { fsPushed = false; closeFullscreenNow(); }
});

function openFullscreen() {
    var view, first, last, dx, dy, sx, sy;
    if (!detail) {
        return;
    }

    // ── v32 overlay path: GROWTH IN (Seth, 2026-07-25: "growth in, growth
    // out — restore the old feel"): the WHOLE overlay FLIP-morphs from the
    // source image's rect to the full frame — the same math and easing as the
    // old promoted detail-view. The curtain transition is retired from the
    // Designer base; the rest state is a static hide (opacity 0, clipped).
    if (OVERLAY) {
        var srcEl = detail.trigger.querySelector(DETAIL_IMG),
            srcRect = srcEl && srcEl.getBoundingClientRect();
        if (!srcRect || !srcRect.width) {
            srcEl = detail.trigger.querySelectorAll(W_THUMB)[detail.idx];
            srcRect = srcEl && srcEl.getBoundingClientRect();
        }
        fs = { view: OVERLAY };
        OVERLAY.classList.add('is-viewing');
        paintDetail(OVERLAY);
        setImmersive(true, detail.trigger);
        pushFsState();
        if (srcRect && srcRect.width) {
            var oLast = OVERLAY.getBoundingClientRect(),
                oDx = srcRect.left + srcRect.width / 2 - (oLast.left + oLast.width / 2),
                oDy = srcRect.top + srcRect.height / 2 - (oLast.top + oLast.height / 2),
                oSx = srcRect.width / oLast.width,
                oSy = srcRect.height / oLast.height;
            OVERLAY.style.transition = 'none';
            OVERLAY.style.transform = 'translate(' + oDx + 'px,' + oDy + 'px) scale(' + oSx + ',' + oSy + ')';
            requestAnimationFrame(function () {
                OVERLAY.style.transition = 'transform ' + TRANSITION + 'ms ' + SETTLE;
                OVERLAY.style.transform = 'none';
                setTimeout(function () {
                    OVERLAY.style.transition = '';
                    OVERLAY.style.transform = '';
                }, TRANSITION);
            });
        }
        return;
    }

    // ── legacy path (no overlay on this page): promote the detail view ──
    view = detail.trigger.querySelector(DETAIL);
    if (!view) {
        return;
    }

    first = view.getBoundingClientRect();
    view.classList.add('is-fullscreen');
    propagateFs(view, true);
    // PORTAL: re-home the modal to <body> for the fullscreen run. Inside the
    // columns, any styled ancestor (position+z-index, transform, filter) traps
    // its stacking context — entry text bled through the frame exactly that
    // way. At body level the D5 stack is law: columns < modal 999 < nav 1000.
    fsHome = { parent: view.parentNode, next: view.nextSibling };
    document.body.appendChild(view);
    last = view.getBoundingClientRect();

    dx = first.left + first.width / 2 - (last.left + last.width / 2);
    dy = first.top + first.height / 2 - (last.top + last.height / 2);
    sx = first.width / last.width;
    sy = first.height / last.height;

    view.style.transition = 'none';
    view.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(' + sx + ',' + sy + ')';

    fs = { view: view };
    setImmersive(true, detail.trigger);
    pushFsState();

    requestAnimationFrame(function () {
        view.style.transition = 'transform ' + TRANSITION + 'ms ' + SETTLE;
        view.style.transform = 'none';
    });
}

// Public close: route through history when we pushed (Back and ✕ behave the
// same); popstate calls closeFullscreenNow directly.
function closeFullscreen() {
    if (!fs) { return; }
    if (fsPushed) { history.back(); return; }
    closeFullscreenNow();
}

function closeFullscreenNow() {
    var view, trigger, wasSingle, first, last, dx, dy, sx, sy;
    if (!fs) {
        return;
    }
    fsPushed = false;
    view = fs.view;
    trigger = detail ? detail.trigger : null;
    wasSingle = detail && detail.images.length === 1;

    if (zoom) {
        resetZoom();
    }

    fs = null;
    setImmersive(false);

    // ── v32 overlay path: GROWTH OUT — the overlay FLIP-shrinks back to the
    // state-3 detail image beneath (still engaged). Single-image entries keep
    // the Option-C snap (no in-flow view to land on; the snap is bulletproof).
    if (view === OVERLAY) {
        var oImg = OVERLAY.querySelector('.immersive-image');
        if (oImg) { oImg.style.transition = ''; oImg.style.transform = ''; }
        var tEl = !wasSingle && trigger && trigger.querySelector(DETAIL_IMG),
            tRect = tEl && tEl.getBoundingClientRect();
        if (!tRect || !tRect.width) {                       // snap (single-image / no target)
            OVERLAY.classList.remove('is-viewing');
            OVERLAY.style.transition = '';
            OVERLAY.style.transform = '';
            if (wasSingle && trigger) { closeDetail(trigger); }
            return;
        }
        var cFirst = OVERLAY.getBoundingClientRect(),
            cDx = tRect.left + tRect.width / 2 - (cFirst.left + cFirst.width / 2),
            cDy = tRect.top + tRect.height / 2 - (cFirst.top + cFirst.height / 2),
            cSx = tRect.width / cFirst.width,
            cSy = tRect.height / cFirst.height;
        OVERLAY.style.transition = 'transform ' + TRANSITION + 'ms ' + SETTLE;
        OVERLAY.style.transform = 'translate(' + cDx + 'px,' + cDy + 'px) scale(' + cSx + ',' + cSy + ')';
        setTimeout(function () {
            OVERLAY.style.transition = 'none';
            OVERLAY.classList.remove('is-viewing');         // rest state is static (opacity 0)
            OVERLAY.style.transform = '';
            void OVERLAY.offsetHeight;
            OVERLAY.style.transition = '';
        }, TRANSITION);
        return;
    }

    // OPTION C (adopted): single-image close snaps instantly, no motion.
    // The fullscreen-to-thumbnail morph was flash-prone; a clean snap back to
    // the preview is bulletproof, and the entry stays engaged (rust + revealed
    // thumbnail) so it doesn't feel abrupt.
    if (wasSingle) {
        view.style.transition = 'none';
        view.style.transform = '';
        view.classList.remove('is-fullscreen');
        propagateFs(view, false);
        fsRestore(view);
        if (trigger) { closeDetail(trigger); }
        return;
    }

    first = view.getBoundingClientRect();
    view.classList.remove('is-fullscreen');
    propagateFs(view, false);
    fsRestore(view);
    last = view.getBoundingClientRect();

    dx = first.left + first.width / 2 - (last.left + last.width / 2);
    dy = first.top + first.height / 2 - (last.top + last.height / 2);
    sx = first.width / last.width;
    sy = first.height / last.height;

    view.style.transition = 'none';
    view.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(' + sx + ',' + sy + ')';

    requestAnimationFrame(function () {
        view.style.transition = 'transform ' + TRANSITION + 'ms ' + SETTLE;
        view.style.transform = 'none';
        setTimeout(function () {
            view.style.transition = '';
            view.style.transform = '';
        }, TRANSITION);
    });
}

// ── State 4b : Zoom + Pan ──

// Apply the zoom state to the image, clamping pan so it can't slide out of frame
// (bounds = the image's own layout box at the live scale).
function zoomApply(img, animate) {
    if (!zoom) { return; }
    var mx = img.clientWidth * (zoom.scale - 1) / 2,
        my = img.clientHeight * (zoom.scale - 1) / 2;
    zoom.panX = Math.max(-mx, Math.min(mx, zoom.panX));
    zoom.panY = Math.max(-my, Math.min(my, zoom.panY));
    img.style.transition = animate ? 'transform 90ms linear' : 'none';
    img.style.transformOrigin = zoom.ox + '% ' + zoom.oy + '%';
    img.style.transform = 'translate(' + zoom.panX + 'px,' + zoom.panY + 'px) scale(' + zoom.scale + ')';
}

// Set the zoom scale (native model). Entering from 1× anchors the origin at the
// cursor; dropping back to 1× exits zoom. Used by pinch + scroll-enter.
function zoomSet(img, s, clientX, clientY) {
    var rect = img.getBoundingClientRect(), natS;
    if (!zoom) {
        natS = Math.max(img.naturalWidth / rect.width, img.naturalHeight / rect.height);
        zoom = { scale: 1, ox: 50, oy: 50, panX: 0, panY: 0, max: Math.max(1.5, Math.min(natS, 4)) };
    }
    if (zoom.scale <= 1.001 && s > 1) {
        zoom.ox = Math.max(0, Math.min(100, (clientX - rect.left) / rect.width * 100));
        zoom.oy = Math.max(0, Math.min(100, (clientY - rect.top) / rect.height * 100));
        zoom.panX = zoom.panY = 0;
    }
    zoom.scale = Math.max(1, Math.min(zoom.max, s));
    if (zoom.scale <= 1.001) { zoomOut(img); return; }
    img.classList.add('is-zoomed');
    document.body.classList.add('is-fs-zoom');   // hide the slideshow chevrons while zoomed
    zoomApply(img, true);
}

// Click-step zoom (Seth's mouse model, layered with pinch + drag). Each click
// cycles 1× → 2× → 4× → exit, toward the click point; pan persists across steps;
// Esc → 1× via the keydown handler. The cap is floored at 4× — these CMS scans are
// ~screen-res, so a natural-resolution cap collapsed to 2× (Seth, 2026-06-09).
// Pinch (trackpad/touch) + drag (everywhere) still work alongside this.
function zoomStepClick(img, clientX, clientY) {
    var steps = [2, 4],                              // 1×→2×→4×→exit
        cur = zoom ? zoom.scale : 1, next = null, i;
    for (i = 0; i < steps.length; i += 1) {
        if (steps[i] > cur + 0.05) { next = steps[i]; break; }
    }
    if (next === null) { zoomOut(img); return; }   // past the last step → exit to 1×
    zoomSet(img, next, clientX, clientY);
}

function zoomOut(img) {
    img.style.transition = 'transform 300ms ' + SETTLE;
    img.style.transform = 'none';
    img.classList.remove('is-zoomed');
    img.classList.remove('is-panning');
    document.body.classList.remove('is-fs-zoom');
    zoom = null;
    panState = null;
    setTimeout(function () {
        if (!zoom) {
            img.style.transition = '';
            img.style.transformOrigin = '';
        }
    }, 300);
}

function resetZoom() {
    var img;
    if (!zoom || !fs) {
        return;
    }
    img = fsImage();
    if (img) {
        img.style.transition = 'none';
        img.style.transform = 'none';
        img.style.transformOrigin = '';
        img.classList.remove('is-zoomed');
        img.classList.remove('is-panning');
    }
    document.body.classList.remove('is-fs-zoom');
    zoom = null;
    panState = null;
}

// ── State 1 <-> 2 : Accordion ──

function closeAccordion(el) {
    closeDetail(el);
    el.querySelectorAll(W_THUMB).forEach(function (t) {
        var th = t.querySelector('.thumb-hover');
        if (th) { th.classList.remove('is-revealed'); }
    });
    el.classList.add('is-closing');
    el.classList.remove('open', 'is-engaged');
    setTimeout(function () {
        el.classList.remove('is-closing');
    }, 550);
}

document.addEventListener('click', function (e) {
    var header = e.target.closest(HEADER),
        trigger;
    if (!header) {
        return;
    }
    e.preventDefault();
    trigger = header.closest(TRIGGER);
    if (!trigger) {
        return;
    }

    if (trigger.classList.contains('open')) {
        closeAccordion(trigger);
        return;
    }

    if (pendingOpen) {
        clearTimeout(pendingOpen);
        pendingOpen = null;
    }

    var hadOpen = false;
    document.querySelectorAll(TRIGGER + '.open').forEach(function (other) {
        if (other !== trigger) {
            hadOpen = true;
            closeAccordion(other);
        }
    });

    if (hadOpen) {
        scrollToTrigger(trigger);
        pendingOpen = setTimeout(function () {
            pendingOpen = null;
            trigger.classList.add('open', 'is-engaged');
        }, CLOSE_STAGGER);
    } else {
        trigger.classList.add('open', 'is-engaged');
        scrollToTrigger(trigger);
    }
});

// State 2 -> 3 : Thumbnail click
document.addEventListener('click', function (e) {
    var thumb = e.target.closest(W_THUMB),
        trigger, images, idx;
    if (!thumb) {
        return;
    }
    e.preventDefault();
    trigger = thumb.closest(TRIGGER);
    if (!trigger) {
        return;
    }

    images = getImages(trigger);
    idx    = thumbIndex(trigger, thumb);

    if (detail && detail.trigger === trigger) {
        detail.idx = idx;
        paintDetail(trigger.querySelector(DETAIL));
        return;
    }

    openDetail(trigger, idx, images);

    if (images.length === 1) {
        openFullscreen();
    }
});

// State 3 -> 4 : Detail image click / fullscreen zoom toggle
document.addEventListener('click', function (e) {
    var img = e.target.closest(FS_IMG);
    if (!img) {
        return;
    }
    e.preventDefault();

    if (fs) {
        // Click-step zoom (Seth's mouse model). A click that ended a pan or swipe
        // drag is swallowed (dragMoved); a clean click steps the zoom toward the
        // click point. Pinch + drag layer in for trackpad/touch.
        if (dragMoved) { dragMoved = false; return; }
        zoomStepClick(img, e.clientX, e.clientY);
        return;
    }

    if (detail) {
        openFullscreen();
    }
});

// Control delegation
document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-detail]'),
        action, view, c;
    if (!btn) {
        return;
    }
    action = btn.getAttribute('data-detail');
    if (action === 'count' || action === 'title') {
        return;
    }

    e.preventDefault();

    if (fs && detail) {
        view = fs.view;
        if (action === 'close') {
            closeFullscreen();
            return;
        }
        if (action === 'prev') {
            detail.idx = (detail.idx - 1 + detail.images.length) % detail.images.length;
            paintDetail(view);
            return;
        }
        if (action === 'next') {
            detail.idx = (detail.idx + 1) % detail.images.length;
            paintDetail(view);
            return;
        }
        if (action === 'toggle-caption') {
            c = view.querySelector(CAPTION);
            if (c) {
                c.classList.toggle('is-collapsed');
            }
            return;
        }
        return;
    }

    if (detail) {
        view = detail.trigger.querySelector(DETAIL);
        if (action === 'close') {
            closeDetail(detail.trigger);
            return;
        }
        if (action === 'prev') {
            detail.idx = (detail.idx - 1 + detail.images.length) % detail.images.length;
            paintDetail(view);
            return;
        }
        if (action === 'next') {
            detail.idx = (detail.idx + 1) % detail.images.length;
            paintDetail(view);
            return;
        }
        if (action === 'expand') {
            openFullscreen();
            return;
        }
        if (action === 'toggle-caption') {
            c = view.querySelector(CAPTION);
            if (c) {
                c.classList.toggle('is-collapsed');
            }
            return;
        }
    }
});

// Pan handlers — pointer-based so trackpad press-drag, mouse, and touch all pan.
document.addEventListener('pointerdown', function (e) {
    var img;
    if (!fs || !zoom || zoom.scale <= 1.001) {
        return;
    }
    img = e.target.closest(FS_IMG);
    if (!img) {
        return;
    }
    e.preventDefault();
    dragMoved = false;
    panState = { img: img, x: e.clientX, y: e.clientY };
    img.style.transition = 'none';
    img.classList.add('is-panning');
});

document.addEventListener('pointermove', function (e) {
    var dx, dy;
    if (!panState) {
        return;
    }
    dx = e.clientX - panState.x;
    dy = e.clientY - panState.y;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        dragMoved = true;
    }
    zoom.panX += dx;
    zoom.panY += dy;
    panState.x = e.clientX;
    panState.y = e.clientY;
    zoomApply(panState.img, false);
});

document.addEventListener('pointerup', function () {
    if (!panState) {
        return;
    }
    panState.img.classList.remove('is-panning');
    panState = null;
});

// ── §State 4b : Zoom + pan (v13 — native model, proven on the gesture catalog) ──
// Layered zoom (v17): click-step is the mouse path (see the click handler +
// zoomStepClick). Here, pinch (ctrl+wheel) ramps zoom toward the cursor for
// trackpad/touch, and once zoomed two-finger scroll also pans. Plain wheel no
// longer enters zoom. Drag pans on every device; Esc → 1×.
document.addEventListener('wheel', function (e) {
    var img;
    if (!fs || !detail) { return; }
    img = fsImage();
    if (!img || !fs.view.contains(e.target)) { return; }
    if (e.ctrlKey) {                                   // pinch → ramp zoom toward cursor
        e.preventDefault();
        zoomSet(img, (zoom ? zoom.scale : 1) - e.deltaY * 0.02, e.clientX, e.clientY);
        return;
    }
    if (zoom && zoom.scale > 1.001) {                  // zoomed → two-finger scroll pans
        e.preventDefault();
        zoom.panX -= e.deltaX;
        zoom.panY -= e.deltaY;
        zoomApply(img, false);
        return;
    }
    // Plain wheel at 1× does nothing now — entering zoom is click-step or pinch
    // (scroll-down no longer auto-enters; scroll-up just releases to the page).
}, { passive: false });

// Keyboard: Escape steps back, arrows navigate
document.addEventListener('keydown', function (e) {
    var open, view;
    if (e.key === 'Escape') {
        if (zoom && fs) {
            zoomOut(fsImage());
            return;
        }
        if (fs) {
            closeFullscreen();
            return;
        }
        if (detail) {
            closeDetail(detail.trigger);
            return;
        }
        open = document.querySelector(TRIGGER + '.open');
        if (open) {
            closeAccordion(open);
        }
        return;
    }
    if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && detail) {
        e.preventDefault();
        if (zoom) {
            resetZoom();
        }
        if (e.key === 'ArrowLeft') {
            detail.idx = (detail.idx - 1 + detail.images.length) % detail.images.length;
        } else {
            detail.idx = (detail.idx + 1) % detail.images.length;
        }
        view = fs ? fs.view : detail.trigger.querySelector(DETAIL);
        if (view) {
            paintDetail(view);
        }
    }
});

// Init: clear design-time state
document.querySelectorAll(DETAIL + '.is-active').forEach(function (d) {
    d.classList.remove('is-active');
});

// Progressive enhancement: intercept real links
document.querySelectorAll(HEADER + ' a, ' + W_THUMB + ' a').forEach(function (a) {
    a.addEventListener('click', function (e) {
        e.preventDefault();
    });
});

// ════════════════════════════════════════════════════════════════════════
//  §Masthead (v32 — focused). GIVEAWAYS · LUNGITZ · HIDEAWAYS, nothing else.
//  The drawer menu (v8→v31) is RETIRED — the landing modal (§landingModal,
//  below) is the menu now. What each word does:
//    · GIVEAWAYS / HIDEAWAYS — go to that realm's info entry: on the index,
//      scroll to #info-giveaways / #info-hideaways (Seth's .category-content
//      blocks) with the transient rust cue; off the index, navigate home to
//      the same anchor (native fragment — the ?realm= route is retired).
//    · LUNGITZ — the menu word: on the index it re-opens the landing modal;
//      everywhere else it navigates home, where the modal greets on arrival.
//  The "+" on a .category-content toggles .is-expanded — the look and motion
//  of both states are Seth's in the Designer; code only flips the class.
//  Kept in code: the 3-col centering grid + scroll-margins (anchor arrivals
//  clear the fixed masthead) — things Webflow can't author here.
// ════════════════════════════════════════════════════════════════════════
(function masthead() {
    var nav = document.querySelector('.nav.wide, .nav.expand');
    if (!nav) { return; }

    var css = [
        '.nav-content{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;}',
        '.nav-giveaways{justify-self:start;}',
        '.nav-lungitz{justify-self:center;}',
        '.nav-hideaways{justify-self:end;}',
        // anchor / arrival targets land clear of the fixed masthead
        '.category-content{scroll-margin-top:5rem;}',
        '.wrapper-content{scroll-margin-top:5rem;}'
    ].join('\n');
    var styleEl = document.createElement('style');
    styleEl.textContent = css;
    document.head.appendChild(styleEl);

    var onIndex = onRealIndex();

    function clearRealmCue() {
        lightRealm(null);
        document.removeEventListener('pointerdown', clearRealmCue, true);
        window.removeEventListener('wheel', clearRealmCue, true);
    }
    // Go to a realm's info entry. Instant scroll (the arrive() precedent —
    // programmatic smooth scroll fights transitions and reads as jumpy).
    function goToInfo(side) {
        var el = document.getElementById('info-' + side);
        if (!el) { location.href = '/#info-' + side; return; }
        if (fs) { closeFullscreen(); }
        // Same anchor as an entry (v37 — Seth: the realm words should land where
        // entries land). The info blocks sit in the same .wrapper-content column,
        // so scrollToTrigger gives them the identical pad-from-the-top settle.
        // scrollIntoView({block:'start'}) used to align them to the scrollport
        // top — which is underneath the fixed masthead, so the heading was
        // clipped and the two behaviors disagreed.
        scrollToTrigger(el);
        lightRealm(side);
        setTimeout(function () {
            document.addEventListener('pointerdown', clearRealmCue, true);
            window.addEventListener('wheel', clearRealmCue, { capture: true, passive: true });
        }, 50);
    }
    goInfo = goToInfo;   // shared with the landing modal's anchor links

    // DELEGATED word wiring: the page may carry more than one nav row (the old
    // Masthead component AND the container-landing's own rows — including the
    // bottom PARTICIPANTS/IMPRESSUM/RESOURCES row, which reuses these classes).
    // A word with a REAL href (Designer-bound link) always just navigates; only
    // unlinked words get the behavior. Clicks while the modal is SHOWN never
    // reach here (landingModal's capture handler owns them).
    // THE LINKS ARE THE TRUTH (Designer-owned): GIVEAWAYS→/#info-giveaways,
    // LUNGITZ→/?menu=1, HIDEAWAYS→/#info-hideaways — they work with no script
    // at all, from every page. The script only SMOOTHS them in place:
    //   · a word whose destination is already on-screen glides instead of
    //     reloading (the rust cue rides along);
    //   · LUNGITZ on the index toggles the modal instead of reloading;
    //   · unlinked words (older copies) fall back to the same behavior.
    // Smoothing keys off each link's HREF, never its class (the menu row
    // reuses the word classes). A link is only smoothed when its own
    // destination can happen in place; anything else navigates natively.
    document.addEventListener('click', function (e) {
        var w = e.target.closest('.nav-giveaways, .nav-hideaways, .nav-lungitz');
        if (!w) { return; }
        var a = w.closest('a[href]') || w.querySelector('a[href]'),
            href = (a && a.getAttribute('href')) || '';
        var m = /#info-(giveaways|hideaways)\b/.exec(href);
        if (m) {
            var target = document.getElementById('info-' + m[1]);
            if (target && target.offsetParent !== null) {
                e.preventDefault();                    // destination on-screen → glide
                goToInfo(m[1]);
            }
            return;                                    // else: native anchor navigation
        }
        if (href === '#' || href === '/' || /\?menu=1\b/.test(href) || !href) {
            // the menu intent (LUNGITZ) or an unlinked word
            if (w.closest('.nav-lungitz') || w.classList.contains('nav-lungitz')) {
                e.preventDefault();
                if (typeof modalToggle === 'function') { modalToggle(); }
                else { location.href = '/?menu=1'; }
                return;
            }
            if (!href || href === '#') {               // unlinked realm word fallback
                e.preventDefault();
                goToInfo((w.closest('.nav-hideaways') || w.classList.contains('nav-hideaways'))
                    ? 'hideaways' : 'giveaways');
            }
        }
        // any other real link (menu row pages etc.) navigates natively
    });

    // The realm info entries expand on click ("+"): code flips .is-expanded,
    // the Designer owns both states' look and motion.
    document.addEventListener('click', function (e) {
        var info = e.target.closest('.category-content');
        if (!info || e.target.closest('a[href]')) { return; }
        info.classList.toggle('is-expanded');
    });

    // Universal ✕ (.frame-close — the modal frame's corner close): in
    // fullscreen it closes fullscreen; on a menu page it steps back (or home
    // when arrived cold). One wiring for every instance.
    document.addEventListener('click', function (e) {
        var x = e.target.closest('.frame-close');
        if (!x) { return; }
        e.preventDefault();
        e.stopPropagation();
        if (fs) { closeFullscreen(); return; }
        if (history.length > 1) { history.back(); }
        else { location.href = '/'; }
    });
}());

// ── Standalone-entry wayfinding (Track C — findability) ──
// A per-entry page (/giveaways/<slug>, /hideaways/<slug>) reached cold from search
// needs a way back into the index. The masthead LUNGITZ word returns to Home
// flagged (?entry=coll/slug); on Home that flag scrolls to the entry and lights the
// existing hover-highlight (entry rust + the realm/category word) — reproduced with the
// same tokens, no new CSS. Param-gated — a normal Home visit (no ?entry=) is untouched.
// Entry-to-entry prev/next: TODO.
(function wayfinding() {
    var entry = /^\/(giveaways|hideaways)\/([^\/]+)\/?$/.exec(location.pathname);

    if (entry) {                              // ── on a standalone entry page ──
        // v32: LUNGITZ wiring lives in §masthead now (LUNGITZ → home, where the
        // landing modal greets as the menu). Here only the entry↔entry arrows.
        wireEntryNav(entry[1], entry[2]);
        return;
    }
    // (v31's ?realm= route + non-index LUNGITZ wiring retired — realm words use
    // native /#info-* anchors and §masthead owns LUNGITZ on every page.)

    // Entry→entry prev/next. Controls are [data-entry-nav="prev"|"next"] (styled in the
    // Designer). Their href comes from the neighbours in INDEX order — sourced by reading
    // Home, which renders every entry in order with data-slug per column (works cold; no
    // per-template list needed; cached per session). Wrap-around so both arrows resolve.
    function wireEntryNav(coll, slug) {
        var prev = document.querySelector('[data-entry-nav="prev"]'),
            next = document.querySelector('[data-entry-nav="next"]');
        if (!prev && !next) { return; }
        // The controls share .fs-chev, which the fullscreen module pins to opacity:0 (its
        // edge-reveal). Override it ONLY inside/at a data-entry-nav control so the entry
        // arrows stay visible — !important + higher specificity beats the plain rule, and
        // the scope leaves the real fullscreen chevrons' reveal intact.
        var s = document.createElement('style');
        s.textContent = '[data-entry-nav]{opacity:1}'
            + '[data-entry-nav] .fs-chev,[data-entry-nav].fs-chev{opacity:1!important}';
        document.head.appendChild(s);
        // Neighbours in INDEX order, read from Home (every entry rendered with data-slug per
        // column). Wrap-around so both arrows always resolve; leave controls in place on a miss.
        function link(slugs) {
            var i = slugs.indexOf(slug), n = slugs.length;
            if (i === -1 || n < 2) { return; }
            if (prev) { prev.setAttribute('href', '/' + coll + '/' + slugs[(i - 1 + n) % n]); }
            if (next) { next.setAttribute('href', '/' + coll + '/' + slugs[(i + 1) % n]); }
        }
        // Cache the order per collection for the session — VALIDATED (only trusted if it
        // contains this entry) so a bad list can't poison it — so prev/next clicks don't
        // re-fetch Home. Deferred off the critical page load.
        var key = 'lz-order-' + coll, cached;
        try { cached = JSON.parse(sessionStorage.getItem(key) || 'null'); } catch (e) {}
        if (cached && cached.indexOf(slug) !== -1) { link(cached); return; }
        var column = coll === 'hideaways' ? '.wrapper-content.is-right' : '.wrapper-content.is-left';
        var run = function () {
            fetch('/').then(function (r) { return r.text(); }).then(function (html) {
                var doc = new DOMParser().parseFromString(html, 'text/html'),
                    slugs = [].map.call(doc.querySelectorAll(column + ' [data-slug]'), function (el) {
                        return el.getAttribute('data-slug');
                    });
                if (slugs.indexOf(slug) !== -1) {
                    try { sessionStorage.setItem(key, JSON.stringify(slugs)); } catch (e) {}
                }
                link(slugs);
            }).catch(function () {});
        };
        if (window.requestIdleCallback) { requestIdleCallback(run, { timeout: 1500 }); }
        else { setTimeout(run, 300); }
    }

    var flag = /[?&]entry=([^&]+)/.exec(location.search);   // ── on the index (Home) ──
    if (!flag) { return; }                    // inert for a normal visit
    var ref  = decodeURIComponent(flag[1]).split('/'),
        coll = ref[0], slug = ref[1];
    if (!slug) { return; }

    var column  = coll === 'hideaways' ? '.wrapper-content.is-right'
                : coll === 'giveaways' ? '.wrapper-content.is-left' : null,
        scope   = (column && document.querySelector(column)) || document,
        key     = (window.CSS && CSS.escape) ? CSS.escape(slug) : slug,
        trigger = scope.querySelector('[data-slug="' + key + '"]');
    if (!trigger) { return; }

    function clearHighlight() {
        trigger.style.borderColor = trigger.style.color = trigger.style.borderRadius = '';
        if (typeof lightRealm === 'function') { lightRealm(null); }
        document.removeEventListener('pointerdown', clearHighlight, true);
        window.removeEventListener('wheel', clearHighlight, true);
    }
    function arrive() {
        // Instant (not smooth): a smooth scroll fought the view-transition cross-fade and
        // read as jumpy. Run early (below) so the fade reveals Home already centered here.
        trigger.scrollIntoView({ block: 'center' });
        // Reproduce the existing hover-highlight (no new CSS): rust border + text (the same
        // .trigger-accordion:hover token) + the realm/category word via lightRealm. It's a
        // transient "you are here" cue — it clears on the first interaction (open a drawer,
        // click, or scroll away) so it never sticks. (Programmatic smooth-scroll fires no
        // wheel/pointer events, so the arrival itself won't clear it.)
        trigger.style.borderColor  = 'var(--_lungitz---color-accent-b-500)';
        trigger.style.color        = 'var(--_lungitz---color-accent-b-500)';
        trigger.style.borderRadius = '8px';
        if (typeof lightRealm === 'function') {
            lightRealm(coll === 'hideaways' ? 'hideaways' : 'giveaways');
        }
        document.addEventListener('pointerdown', clearHighlight, true);
        window.addEventListener('wheel', clearHighlight, { capture: true, passive: true });
        // Land with the entry OPEN (state 2) — Seth: a contributor's name should deliver you
        // INTO their work, not merely next to it. Route through the header's own click so the
        // whole open choreography (close-others stagger, .is-engaged, scrollToTrigger's
        // settle) is the one the ladder already runs; nothing is reimplemented here.
        // A synthetic click fires no pointerdown/wheel, so the rust arrival cue survives it.
        if (!trigger.classList.contains('open')) {
            var header = trigger.querySelector(HEADER);
            if (header) { header.click(); }
        }
        // one-shot: drop the flag so a refresh won't re-fire and the URL settles back to /
        if (history.replaceState) { history.replaceState({}, '', location.pathname); }
    }
    // Run as early as the target exists (it's server-rendered) so the instant scroll is
    // reflected in the view-transition snapshot — the fade reveals the entry already
    // centered instead of fading in and then scrolling (the jumpy bit).
    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', arrive); }
    else { arrive(); }
}());

// Realm hover cue (Track B, cross-state): hovering a column lights its masthead
// word in the rust accent — the same signal the fullscreen lock uses. Skipped
// while immersive so the locked realm stays put.
(function realmHover() {
    function immersive() {
        var nav = document.querySelector('.nav.wide, .nav.expand');
        return !!(nav && nav.classList.contains('is-immersive'));
    }
    [['.wrapper-content.is-left', 'giveaways'],
     ['.wrapper-content.is-right', 'hideaways']].forEach(function (pair) {
        var col = document.querySelector(pair[0]);
        if (!col) { return; }
        col.addEventListener('mouseenter', function () {
            if (!immersive()) { lightRealm(pair[1]); }
        });
        col.addEventListener('mouseleave', function () {
            if (!immersive()) { lightRealm(null); }
        });
    });
}());

// ════════════════════════════════════════════════════════════════════════
//  §Arrangement — drag entries to re-curate  (v14; ephemeral, bench-proven)
//
//  Drag a CLOSED entry to reorder it, or carry it across to the other column.
//  Toward giveaways it "gives away" (reveals); toward hideaways it "hides away".
//  Drops settle with the drawer easing. DOM-only — resets on reload; the
//  canonical CMS order is untouched. A move-threshold keeps drag from fighting
//  tap-to-open, and the click that follows a drag is swallowed.
//
//  Hooks for the Designer: .arrange-ghost (lifted entry), .arrange-placeholder
//  (drop slot), .wrapper-content.arrange-over (hovered column), .arrange-hint
//  (the give/hide label). Styling here is feelable scaffold — tune in Designer.
// ════════════════════════════════════════════════════════════════════════
(function arrange() {
    var cols = [].slice.call(document.querySelectorAll('.wrapper-content.is-left, .wrapper-content.is-right'));
    if (cols.length < 2) { return; }

    var V = function (n) { return 'var(--_lungitz---' + n + ')'; },
        css = [
            // Looks migrated to Designer combos (.arrange-ghost, .arrange-placeholder,
            // .wrapper-content.arrange-over, .arrange-hint). Kept here: the fixed
            // positioning / z-index / pointer-events / transitions the drag depends on.
            '.arrange-ghost{position:fixed;z-index:1000;pointer-events:none;transition:none!important;}',
            '.arrange-ghost *{pointer-events:none;}',
            '.arrange-dragging,.arrange-dragging *{user-select:none!important;-webkit-user-select:none!important;}',
            '.arrange-hint{position:fixed;z-index:1001;pointer-events:none;opacity:0;transition:opacity .15s;}'
        ].join('\n'),
        styleEl = document.createElement('style');
    styleEl.textContent = css;
    document.head.appendChild(styleEl);

    var hint = document.createElement('div');
    hint.className = 'arrange-hint';
    document.body.appendChild(hint);

    var drag = null, placeholder = null, THRESH = 6;

    function itemsBox(col) { return col.querySelector('.w-dyn-items') || col; }

    document.addEventListener('pointerdown', function (e) {
        var trigger;
        if (e.button) { return; }
        // MOUSE ONLY (v46 — Seth: "just turn off drag on touch"). On a touch screen a
        // scroll IS a pointermove: a swipe that starts on an entry clears the 6px
        // threshold and begin() lifts it into a position:fixed .arrange-ghost. Worse,
        // the browser fires POINTERCANCEL rather than pointerup when it takes the
        // gesture over for scrolling, so drop() never ran and the ghost stayed welded
        // to the viewport. Every entry swiped past piled up — "like a magnet".
        // Arranging is a desktop curation affordance; on touch it can only fight the
        // scroll, so it does not arm at all there.
        if (e.pointerType !== 'mouse') { return; }
        trigger = e.target.closest(TRIGGER);
        if (!trigger || trigger.classList.contains('open')) { return; }   // closed entries only
        if (!trigger.closest('.wrapper-content.is-left, .wrapper-content.is-right')) { return; }
        drag = {
            node: trigger.closest('.w-dyn-item') || trigger,
            x0: e.clientX, y0: e.clientY, moved: false
        };
    });

    document.addEventListener('pointermove', function (e) {
        if (!drag) { return; }
        if (!drag.moved) {
            if (Math.abs(e.clientX - drag.x0) < THRESH && Math.abs(e.clientY - drag.y0) < THRESH) { return; }
            begin();
        }
        e.preventDefault();
        drag.node.style.left = (e.clientX - drag.dx) + 'px';
        drag.node.style.top = (e.clientY - drag.dy) + 'px';
        place(e.clientX, e.clientY);
    });

    document.addEventListener('pointerup', function () {
        if (!drag) { return; }
        if (drag.moved) { drop(); swallowClick(); }
        drag = null;
    });

    // Never leave a lifted entry behind. pointerup is not guaranteed — the browser
    // fires pointercancel instead whenever it claims the gesture (scroll takeover,
    // window blur, a system gesture). Without this the ghost keeps position:fixed
    // forever. Belt and braces now that touch cannot arm a drag at all.
    document.addEventListener('pointercancel', function () {
        if (!drag) { return; }
        if (drag.moved) { drop(); }
        drag = null;
    });

    function begin() {
        drag.moved = true;
        var node = drag.node, r = node.getBoundingClientRect();
        drag.dx = drag.x0 - r.left;
        drag.dy = drag.y0 - r.top;
        placeholder = document.createElement('div');
        placeholder.className = 'arrange-placeholder';
        placeholder.style.height = r.height + 'px';
        node.parentNode.insertBefore(placeholder, node);
        node.classList.add('arrange-ghost');
        node.style.width = r.width + 'px';
        node.style.left = r.left + 'px';
        node.style.top = r.top + 'px';
        document.body.classList.add('arrange-dragging');
    }

    function place(x, y) {
        var col = null;
        cols.forEach(function (c) {
            var r = c.getBoundingClientRect(),
                over = x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
            c.classList.toggle('arrange-over', over);
            if (over) { col = c; }
        });
        if (!col) { hint.style.opacity = 0; return; }
        // conceptual label when crossing into the other column
        var fromCol = placeholder.closest('.wrapper-content');
        if (fromCol && fromCol !== col) {
            hint.textContent = col.classList.contains('is-right') ? 'hiding away ↘' : 'giving away ↗';
            hint.style.left = (x + 16) + 'px';
            hint.style.top = (y + 16) + 'px';
            hint.style.opacity = 1;
        } else {
            hint.style.opacity = 0;
        }
        // drop slot: first entry whose midpoint is below the pointer
        var box = itemsBox(col),
            kids = [].filter.call(box.children, function (n) {
                return n !== drag.node && n !== placeholder && n.getBoundingClientRect().height > 0;
            }),
            after = null, i, ir;
        for (i = 0; i < kids.length; i += 1) {
            ir = kids[i].getBoundingClientRect();
            if (y < ir.top + ir.height / 2) { after = kids[i]; break; }
        }
        if (after) { box.insertBefore(placeholder, after); }
        else { box.appendChild(placeholder); }
    }

    function drop() {
        var node = drag.node, first = node.getBoundingClientRect(), last, dx, dy;
        placeholder.parentNode.insertBefore(node, placeholder);
        placeholder.remove();
        placeholder = null;
        node.classList.remove('arrange-ghost');
        node.style.left = node.style.top = node.style.width = '';
        document.body.classList.remove('arrange-dragging');
        cols.forEach(function (c) { c.classList.remove('arrange-over'); });
        hint.style.opacity = 0;
        last = node.getBoundingClientRect();
        dx = first.left - last.left;
        dy = first.top - last.top;
        node.style.transition = 'none';
        node.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
        requestAnimationFrame(function () {
            node.style.transition = 'transform 450ms ' + SETTLE;
            node.style.transform = '';
            setTimeout(function () { node.style.transition = ''; node.style.transform = ''; }, 470);
        });
    }

    // Swallow the click that fires right after a drag so it doesn't open the
    // accordion; self-removes after the click or a short timeout (tap still opens).
    function swallowClick() {
        function once(ev) { ev.stopPropagation(); ev.preventDefault(); done(); }
        function done() { document.removeEventListener('click', once, true); clearTimeout(t); }
        document.addEventListener('click', once, true);
        var t = setTimeout(done, 350);
    }
}());

// ════════════════════════════════════════════════════════════════════════
//  §Slideshow navigation (v15) — prev/next in fullscreen
//
//  Hover-reveal chevrons at the edges (desktop) + a haptic swipe (drag the
//  image; it follows your finger, then slides to the neighbour and settles —
//  feel proven on the gesture catalog). Single image, so the slide swaps
//  off-screen: current eases out one side, the new one eases in from the other.
//  Only fullscreen + multi-image + not zoomed (the body.is-fs / is-fs-zoom flags
//  set by setImmersive + the zoom fns drive chevron visibility). Designer hooks:
//  .fs-nav (edge zone) and .fs-chev (the revealed glyph).
// ════════════════════════════════════════════════════════════════════════
(function slideshowNav() {
    var V = function (n) { return 'var(--_lungitz---' + n + ')'; },
        css = [
            // z 1000: above the portal'd modal (999, last body child) so the
            // chevron zones stay clickable.
            '.fs-nav{position:fixed;top:calc(4vh + 3rem);bottom:1.5rem;width:14%;',
            '  z-index:1000;display:none;align-items:center;cursor:pointer;}',
            'body.is-fs .fs-nav{display:flex;}',
            'body.is-fs.is-fs-zoom .fs-nav{display:none;}',
            '.fs-nav.is-prev{left:1.5rem;justify-content:flex-start;padding-left:' + V('space-4') + ';}',
            '.fs-nav.is-next{right:1.5rem;justify-content:flex-end;padding-right:' + V('space-4') + ';}',
            // .fs-chev glyph look migrated to the Designer; kept here: the reveal motion.
            '.fs-chev{opacity:0;transition:opacity .2s,color .2s;}',
            '.fs-nav:hover .fs-chev{opacity:1;color:' + V('color-ink-100') + ';}'
        ].join('\n'),
        styleEl = document.createElement('style');
    styleEl.textContent = css;
    document.head.appendChild(styleEl);

    // Direct swap — no slide transition between images (Seth: the clear, direct
    // swap "felt right"). The swipe still tracks the finger; the commit snaps.
    function slideTo(dir) {
        if (!fs || !detail || detail.images.length < 2 || zoom) { return; }
        var img = fsImage();
        if (!img) { return; }
        detail.idx = (detail.idx + dir + detail.images.length) % detail.images.length;
        paintDetail(fs.view);
        img.style.transition = 'none';
        img.style.transform = 'none';
    }

    function chevron(dir, cls, glyph) {
        var z = document.createElement('div');
        z.className = 'fs-nav ' + cls;
        z.innerHTML = '<span class="fs-chev">' + glyph + '</span>';
        z.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            slideTo(dir);
        });
        return z;
    }
    document.body.appendChild(chevron(-1, 'is-prev', '‹'));
    document.body.appendChild(chevron(1, 'is-next', '›'));

    // Haptic swipe — drag the fullscreen image; past a threshold it slides to the
    // neighbour, otherwise it eases back. Fullscreen + multi-image + unzoomed only.
    var swipe = null;
    document.addEventListener('pointerdown', function (e) {
        var img;
        if (!fs || !detail || detail.images.length < 2 || zoom) { return; }
        img = fsImage();
        if (!img || img._sliding || !fs.view.contains(e.target) || e.target.closest('.fs-nav')) { return; }
        swipe = { x0: e.clientX, img: img, dx: 0 };
        img.style.transition = 'none';
    });

    document.addEventListener('pointermove', function (e) {
        if (!swipe) { return; }
        swipe.dx = e.clientX - swipe.x0;
        if (Math.abs(swipe.dx) > 3) { dragMoved = true; }   // so the click after a swipe won't zoom-step
        swipe.img.style.transform = 'translateX(' + swipe.dx + 'px)';
    });

    document.addEventListener('pointerup', function () {
        if (!swipe) { return; }
        var dx = swipe.dx, img = swipe.img, W = img.clientWidth || 1;
        swipe = null;
        img.style.transition = 'none';
        img.style.transform = 'none';                                  // direct: clear the drag offset
        if (Math.abs(dx) > Math.min(90, W * 0.18)) {
            slideTo(dx < 0 ? 1 : -1);                                   // swiped left → next (direct swap)
        }
    });
}());

// ════════════════════════════════════════════════════════════════════════
//  §Durability promotion (Thread B) — folded from sandbox v18→v25.
//  Mobile masthead (≤767: scrollbar-safe nav width, size cap, symmetric column
//  padding, custom page scrollbar), immersive HIDEAWAYS hard-right, fullscreen
//  close = LUNGITZ + backdrop + Esc (✕ hidden → becomes a cursor over exit
//  targets), and the bulky fullscreen/entry chevrons reborn as the state-3
//  .button arrows (+ directional ←/→ cursors over the nav zones). Phase 2 fluid
//  SPACE lives in the Webflow Variables (space-5..24 clamps), not here.
//  ✓ RESOLVED (2026-06-12): the .author / Rich Text Block / .type / .number-list /
//  .button / .button-copy line-heights are now fixed-px ON THE CLASS in the Designer
//  (unbound from the space tokens), verified live — so the px-pins below were removed.
// ════════════════════════════════════════════════════════════════════════
(function durabilityPolish() {
    var INK   = 'var(--_lungitz---color-ink-900)',
        TRACK = 'color-mix(in srgb,' + INK + ',#000 20%)',
        ACC   = 'var(--_lungitz---color-accent-a-500)',
        RUST  = 'var(--_lungitz---color-accent-b-500)',
        F4    = 'var(--_lungitz---font-size-4)',
        SP3   = 'var(--_lungitz---space-3)';
    var CUR = function (svg) { return "url(\"data:image/svg+xml," + svg + "\") 13 13, pointer"; };
    // ✕ (exit), ← (prev), → (next) cursors — off-white, for the dark frame.
    var XCUR = CUR("%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='26'%20height='26'%3E%3Cg%20stroke='%23e8e2da'%20stroke-width='2'%20stroke-linecap='round'%3E%3Cline%20x1='8'%20y1='8'%20x2='18'%20y2='18'/%3E%3Cline%20x1='18'%20y1='8'%20x2='8'%20y2='18'/%3E%3C/g%3E%3C/svg%3E"),
        LCUR = CUR("%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='26'%20height='26'%3E%3Cg%20fill='none'%20stroke='%23e8e2da'%20stroke-width='2'%20stroke-linecap='round'%20stroke-linejoin='round'%3E%3Cline%20x1='19'%20y1='13'%20x2='7'%20y2='13'/%3E%3Cpolyline%20points='12,8%207,13%2012,18'/%3E%3C/g%3E%3C/svg%3E"),
        RCUR = CUR("%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='26'%20height='26'%3E%3Cg%20fill='none'%20stroke='%23e8e2da'%20stroke-width='2'%20stroke-linecap='round'%20stroke-linejoin='round'%3E%3Cline%20x1='7'%20y1='13'%20x2='19'%20y2='13'/%3E%3Cpolyline%20points='14,8%2019,13%2014,18'/%3E%3C/g%3E%3C/svg%3E");
    var css = [
        // ★ The "author bounce" (state 1↔2). Diagnosed LIVE via the Chrome bridge:
        // .author lives in a NESTED collection-list inside the entry header, and the
        // header is a 2-row grid sitting in the trigger's animating `grid-template-rows`
        // auto row. During the open/close the animation hands the header a transient
        // sliver of extra height; default align-content distributed it INTO the rows,
        // inflating row 1 (~+16px visible / +33px raw) and shoving the author's row
        // down, then it settled — the drop-then-realign. Title HEIGHT stayed constant
        // 71.3px the whole time; it was the grid TRACK thrashing (not padding/leading —
        // those earlier fixes were red herrings, kept as harmless smoothing).
        // align-content:start packs the rows to the top so row 1 can never inflate.
        '.header-accordion{align-content:start;}',
        '@media (max-width:767px){',
        // mobile masthead stays put (was position:absolute → scrolled away as a
        // block). Fixed + opaque ink bg + z-index so content scrolls behind it.
        // (Immersive keeps its own z-index:1000 via the higher-specificity combo.)
        '  .nav.wide{position:fixed;z-index:100;background:' + INK + ';width:auto;left:0;right:0;margin:0.75rem;}',
        '  .h5-nav{font-size:clamp(0.875rem, 4.4vw, 1.375rem)!important;letter-spacing:-0.05rem;}',
        '  .wrapper-content.is-left{padding-right:1rem!important;}',
        '  .wrapper-content.is-right{padding-left:1rem!important;}',
        // (mobile html scrollbar rules removed — the sitewide universal
        // scrollbar treatment in injectCSS covers every page and container)
        '}',
        // v32: the overlay backdrop reads as the exit (✕ cursor); its bar,
        // caption, and image keep their own affordances. Legacy-path rules kept
        // beneath for pages without the overlay.
        '.immersive-overlay.is-viewing{cursor:' + XCUR + ';}',
        '.immersive-overlay .immersive-bar,.immersive-overlay .caption-drawer,.immersive-overlay .immersive-image{cursor:auto;}',
        '.detail-view.is-fullscreen{cursor:' + XCUR + ';}',
        '.caption-drawer.is-fullscreen{cursor:auto;}',
        // Slide counter: hidden at rest (paintDetail seeds it into every caption
        // row), shown inside the overlay / legacy fullscreen caption.
        '.fs-count{display:none;}',
        '.immersive-overlay .fs-count,.caption-drawer.is-fullscreen .fs-count{display:inline-block;color:' + ACC + ';}',
        // LEGACY fullscreen fill (fallback pages without the overlay only —
        // the overlay path never touches these; layout there is Seth's).
        '.detail-view.is-fullscreen{inset:0;margin:0;display:flex;flex-direction:column;z-index:999;padding:calc(4vh + 3rem) 1.5rem 1.5rem;}',
        '.detail-bar.is-fullscreen{display:none;}',
        '.detail-image.is-fullscreen{flex:1 1 auto;min-height:0;height:auto;}',
        '.caption-drawer.is-fullscreen{flex:0 0 auto;grid-template-rows:auto 1fr;}',
        '.fs-nav.is-prev{cursor:' + LCUR + ';}',
        '.fs-nav.is-next{cursor:' + RCUR + ';}',
        '.fs-chev{font-size:0!important;text-shadow:none!important;font-family:inherit!important;padding:' + SP3 + '!important;color:' + ACC + '!important;line-height:1!important;}',
        '.fs-chev::before{font-size:' + F4 + ';line-height:1;}',
        '.fs-nav.is-prev .fs-chev::before,[data-entry-nav="prev"] .fs-chev::before,[data-entry-nav="prev"].fs-chev::before{content:"\\2190";}',
        '.fs-nav.is-next .fs-chev::before,[data-entry-nav="next"] .fs-chev::before,[data-entry-nav="next"].fs-chev::before{content:"\\2192";}',
        '.fs-nav:hover .fs-chev,[data-entry-nav]:hover .fs-chev{color:' + RUST + '!important;}'
        // RESOLVED 2026-06-12 — the line-height px-pins that used to live here are
        // gone: leading is now fixed-px ON THE CLASS in the Designer (.author / .type /
        // Rich Text Block 20px · .number-list 16px · .button / .button-copy 32px),
        // unbound from the fluid space tokens and verified live. The canvas now matches
        // live, so the script no longer needs to mask it. (See MASTHEAD-CONTRACT.md §5.)
    ].join('\n');
    var st = document.createElement('style');
    st.textContent = css;
    document.head.appendChild(st);

    // Fullscreen close = ✕ (data-detail) + backdrop + Back + Esc. The
    // LUNGITZ-closes shortcut survives only on the LEGACY path (with the
    // overlay, LUNGITZ means "menu" and sits beneath it anyway).
    document.addEventListener('click', function (e) {
        if (!fs || OVERLAY) { return; }
        if (e.target.closest('.nav-lungitz')) {
            e.preventDefault();
            e.stopPropagation();
            closeFullscreen();
        }
    }, true);
    document.addEventListener('click', function (e) {
        if (!fs || zoom) { return; }
        var view = fs.view;
        if (!view || !view.contains(e.target)) { return; }
        if (e.target.closest('.detail-image, .immersive-image, .immersive-bar, .caption-drawer, .fs-nav, .nav, [data-detail]')) { return; }
        closeFullscreen();
    }, false);
}());

// ════════════════════════════════════════════════════════════════════════
//  §Landing modal (v32) — Seth's container-landing modal IS the landing AND
//  the menu. It greets on arrival at the index and dismisses IN PLACE on any
//  click outside its links ("click anywhere → the index"); LUNGITZ re-opens it
//  (see §masthead). Every visual knob — BOTH states — is Seth's in the
//  Designer (.container-landing rest + .is-active shown, HIS class pair);
//  code owns only the gate, the click routing, and motion. Deep links (?entry=)
//  and #anchor arrivals skip the landing and land on the index directly.
//  Wireframe-first: dormant until the modal is instanced on the page.
//  ?veil=0 suppresses it for testing.
// ════════════════════════════════════════════════════════════════════════
(function landingModal() {
    var onIndex = onRealIndex();
    if (!onIndex) { return; }                       // menu pages carry their own static modal
    var modal = document.querySelector('.container-landing, .container-landing-modal');
    if (!modal) { return; }

    // ── THE MODEL (worked out with Seth, 2026-07-25 late) ──────────────────
    // The modal IS the masthead — one structure, two states:
    //   · rest (.container-landing, no is-active): ONLY the top word row shows
    //     — that row is .nav.wide, so it *is* the persistent masthead. The
    //     landing content, bottom menu row, and ✕ collapse away (descendant
    //     rules below — structural, Webflow can't author them; the LOOK of
    //     both states stays Seth's).
    //   · expanded (.is-active): the full landing/menu.
    // The old Masthead component retires — no duplicate navs.
    // PERSISTENCE: it greets expanded ONCE per browser session on arriving at
    // the index; after any dismissal (or a deep link) it rests as the word-row
    // masthead. LUNGITZ re-expands it any time — it is the menu.
    // Structure only — no motion yet. The transition list is armed further down,
    // after the arrival state has painted (see armMotion), because every page ships
    // .is-active in its server HTML.
    var st = document.createElement('style');
    st.textContent =
        // rest = word row only (code-owned descendant hides; contract §2)
        '.container-landing:not(.is-active) .landing-content,'
      + '.container-landing:not(.is-active) .nav-content.bottom,'
      + '.container-landing:not(.is-active) .frame-close{display:none;}'
        // …and give the height back. The frame height now lives on
        // .nav.wide.landing in the DESIGNER (v39) so the canvas renders the modal
        // correctly — v38 kept it here, invisible to the Designer, which is why the
        // component looked broken on canvas while the published page was fine. The
        // trade is that the RESTING word row would inherit a full-frame height and
        // become an invisible block over the index, so the reset is code's job.
        // The head gate carries the same reset, or the resting masthead paints
        // full-height for one frame before this lands.
      + '.container-landing:not(.is-active) .nav.wide.landing{height:auto;}';
    document.head.appendChild(st);

    // Arm the modal's motion only once the arrival state is on screen.
    // WHY (v34 — the "page transitions are jumpy on click" ticket): Webflow ships
    // .container-landing ALREADY .is-active in every page's HTML, so a returning
    // visitor's Home paints with the whole landing/menu open, and the script — which
    // loads async, after first paint — then strips the class. With the transition
    // armed from the start that strip played as a 450-600ms collapse of the full
    // menu down to the word row, right as the page appeared. That is the jump, and
    // it is exactly why back/forward looked perfect: bfcache restores the already
    // settled DOM, so nothing collapses. Deferring the arm by two frames makes the
    // arrival state instant (at worst a single-frame flash) while every later
    // open/close — the ones the reader actually triggers — still animates.
    // rAF is throttled to a standstill in a background tab, so pair it with a timer:
    // whichever lands first arms the motion, the flag keeps it to one stylesheet.
    var armed = false;
    function armMotion() {
        if (armed) { return; }
        armed = true;
        var motion = document.createElement('style');
        motion.textContent =
            '.container-landing,.container-landing-modal{'
          + 'transition:grid-template-rows .45s ' + SETTLE + ',opacity .5s ease,transform .6s ' + SETTLE + ',padding .3s;}';
        document.head.appendChild(motion);
    }

    var SEEN = 'lz-landing-seen';

    var prevOverflow = document.documentElement.style.overflow;
    function lock(on) {
        document.documentElement.style.overflow = on ? 'hidden' : prevOverflow;
    }
    function shown() { return modal.classList.contains('is-active'); }
    function dismiss() {
        modal.classList.remove('is-active');
        lock(false);
        try { sessionStorage.setItem(SEEN, '1'); } catch (e) {}
    }
    function show() {
        modal.classList.add('is-active');
        lock(true);
    }
    modalToggle = function () { if (shown()) { dismiss(); } else { show(); } };

    var seen = false;
    try { seen = !!sessionStorage.getItem(SEEN); } catch (e) {}
    // Decide from the ARRIVAL url (INITIAL_SEARCH/HASH), never the live one:
    // wayfinding's arrive() runs earlier in this file and has already dropped
    // ?entry= by now, so location.search would show a bare "/" and this would
    // greet the reader over the entry it just opened — what a participant-name
    // click did on the first visit of a session.
    if (/[?&]menu=1\b/.test(INITIAL_SEARCH)) {
        show();             // LUNGITZ from a sub-page: arrive WITH the menu open
        try {
            history.replaceState({}, '', location.pathname
                + location.search.replace(/([?&])menu=1&?/, '$1').replace(/[?&]$/, '')
                + location.hash);
        } catch (e) {}
    } else if (/[?&]entry=/.test(INITIAL_SEARCH) || /[?&]veil=0\b/.test(INITIAL_SEARCH) || INITIAL_HASH || seen) {
        dismiss();          // deep link / already greeted this session → the word-row masthead
    } else {
        show();             // first arrival of the session: the landing greets
    }

    // The arrival state is now set. Let it paint, THEN arm the motion, so the
    // settle above is instant and every reader-triggered open/close still glides.
    // The head gate (site HEAD custom code) has been holding the landing at rest
    // since before first paint, so the reader never saw the open state we just
    // agreed with. Hand control back now that the real state is set — from here
    // the .is-active class alone decides, and LUNGITZ can open the menu.
    document.documentElement.classList.remove('lz-rest');

    requestAnimationFrame(function () { requestAnimationFrame(armMotion); });
    setTimeout(armMotion, 500);

    // Click routing while the modal holds: its links act (the realm anchors
    // dismiss first, then glide); anywhere else = enter the index. Capture, so
    // the dismissing click never reaches the ladder beneath.
    // Click routing while the menu holds — keyed off HREFS ONLY (never
    // classes: the bottom row reuses the word classes, so class-sniffing
    // hijacks real page links). The links are the truth:
    //   · #info-* anchors → dismiss, then glide in place
    //   · /?menu=1 (LUNGITZ inside the open menu) → just dismiss
    //   · any other real link (PARTICIPANTS/IMPRESSUM/RESOURCES…) → NAVIGATE
    //   · a non-link click anywhere → enter the index
    document.addEventListener('click', function (e) {
        if (!shown()) { return; }
        var a = e.target.closest('a[href]');
        if (a && modal.contains(a)) {
            var href = a.getAttribute('href') || '';
            var m = /#info-(giveaways|hideaways)\b/.exec(href);
            if (m) {
                e.preventDefault();
                e.stopPropagation();
                dismiss();
                if (typeof goInfo === 'function') { goInfo(m[1]); }
                return;
            }
            if (href === '#' || href === '/' || /\?menu=1\b/.test(href)) {
                e.preventDefault();
                e.stopPropagation();
                dismiss();
                return;
            }
            return;                                  // real link → navigate
        }
        e.preventDefault();
        e.stopPropagation();
        dismiss();
    }, true);

    // Esc / ⏎ / space enter the index too (capture — the ladder never sees it).
    document.addEventListener('keydown', function (e) {
        if (!shown()) { return; }
        if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            e.stopPropagation();
            dismiss();
        }
    }, true);
}());

// ── External links → new tab (v31, 17.6 "links should open to a new tab") ──
// Just-in-time on click (capture) so it also covers CMS bodies the menu moves
// around: any http(s) anchor pointing off-host opens in a new tab, noopener.
(function externalNewTab() {
    document.addEventListener('click', function (e) {
        var a = e.target.closest('a[href]');
        if (!a || !a.host || a.host === location.host) { return; }
        if (!/^https?:$/.test(a.protocol)) { return; }
        a.target = '_blank';
        if (!/\bnoopener\b/.test(a.rel || '')) { a.rel = (a.rel ? a.rel + ' ' : '') + 'noopener'; }
    }, true);
}());

// ── Participants → index arrival (v32) ── The Designer binds each contributor
// name to their Featured work's template page (/giveaways/<slug> — the no-JS
// fallback). Landing IN THE INDEX with the rust arrival highlight reads better
// (Seth), so rewrite those hrefs to the ?entry= flag the wayfinding module
// already understands. Progressive enhancement — content and curation stay in
// the CMS.
// ── #info-* hash arrival: re-anchor once the page has stopped moving (v42) ──
// scroll-padding gets the browser's own jump into the right neighbourhood, but the
// browser performs that jump at parse time and the web fonts (Vollkorn, Old Standard
// TT, loaded via WebFont.js) reflow every line above the target afterwards. Deep in
// the stacked mobile layout that accumulated drift measured 80px — the info text sat
// low with a gap under the masthead. No amount of scroll-padding fixes it, because
// the position was correct when it was set and the page moved underneath it.
// So settle it again once fonts AND images are done, through the same anchor
// everything else uses, so a hash arrival lands exactly where a click does.
(function infoHashArrival() {
    var m = /#info-(giveaways|hideaways)\b/.exec(location.hash || '');
    if (!m) { return; }
    var el = document.getElementById('info-' + m[1]);
    if (!el) { return; }
    // WATCH the cause instead of guessing when it ends (v45). The browser performs a
    // hash jump at parse time; fonts, images and CMS lists then land at their own pace
    // and every reflow ABOVE the target shifts it — 80px of accumulated drift measured
    // on the stacked mobile layout. Fixed timers were a guess at when that stops, and
    // on a slow connection the last pass still fired too early. A ResizeObserver reacts
    // to the actual layout changes instead, so it is right whether the page settles in
    // 200ms or four seconds. Bounded by a hard ceiling, and any real scroll, touch or
    // keypress cancels it so it can never yank a reader who has started reading.
    var done = false, deadline = 0, timers = [], ro = null;
    function settle() {
        if (done || el.offsetParent === null) { return; }
        if (deadline && Date.now() > deadline) { stop(); return; }
        scrollToTrigger(el, true);
    }
    function stop() {
        if (done) { return; }
        done = true;
        timers.forEach(clearTimeout);
        if (ro) { ro.disconnect(); }
        window.removeEventListener('wheel', stop, true);
        window.removeEventListener('touchstart', stop, true);
        window.removeEventListener('keydown', stop, true);
        window.removeEventListener('pointerdown', stop, true);
    }
    deadline = Date.now() + 6000;
    window.addEventListener('wheel', stop, { capture: true, passive: true });
    window.addEventListener('touchstart', stop, { capture: true, passive: true });
    window.addEventListener('keydown', stop, true);
    window.addEventListener('pointerdown', stop, true);
    if (window.ResizeObserver) {
        ro = new ResizeObserver(settle);
        ro.observe(document.body);              // anything reflowing above the target
        var colEl = el.closest('.wrapper-content');
        if (colEl) { ro.observe(colEl); }
    }
    [0, 200, 600, 1200, 2500, 5000].forEach(function (d) {   // belt and braces
        timers.push(setTimeout(settle, d));
    });
    setTimeout(stop, 6000);
}());

(function participantsToIndex() {
    var wrap = document.querySelector('.content-participants');
    if (!wrap) { return; }
    wrap.querySelectorAll('a[href^="/giveaways/"], a[href^="/hideaways/"]').forEach(function (a) {
        var m = /^\/(giveaways|hideaways)\/([^\/?#]+)/.exec(a.getAttribute('href'));
        if (m) { a.setAttribute('href', '/?entry=' + m[1] + '/' + m[2]); }
    });
    // Names whose Designer link is still unbound render href="#" — which, on a list this
    // long, scrolls the reader back to the top: the click reads as a broken jump rather
    // than as nothing happening. Until the binding lands, swallow the no-op. Only "#"
    // exactly — every real href (an entry, an external site, a PDF) is left alone.
    wrap.addEventListener('click', function (e) {
        var a = e.target.closest('a[href="#"]');
        if (a && wrap.contains(a)) { e.preventDefault(); }
    });
}());

// ════════════════════════════════════════════════════════════════════════
//  §Keyboard navigation (arc 3 — promoted from sandbox v27→v30) — drive the state ladder from
//  the keys. Spine: ⏎ drills IN · Esc drills OUT (the existing ladder) · arrows
//  move laterally at the current level · +/− zoom in fullscreen. A quiet hint
//  chip surfaces the current level's keys. Additive + a11y-minded:
//    · never preventDefault while typing in a field, or with ⌘/Ctrl/Alt held;
//    · never traps focus — native Tab still works; if a real link/button holds
//      focus, ⏎ falls through to its native activation (no double-fire);
//    · the index/thumbnail focus ring reuses the rust hover tokens (nothing new
//      to style) and scrolls with {block:'nearest'} so it never yanks the page;
//    · a mouse press clears the keyboard ring — the two coexist, mouse wins;
//    · hint chip is aria-hidden + hidden on touch / no-hover pointers.
//  ?ring gate: v1 (full, default) lets the arrows focus the index from a cold
//  start; ?ring=0 (v2) turns that off — the mouse opens the first entry and the
//  keys take over from state 2 onward.
// ════════════════════════════════════════════════════════════════════════
(function keyboardNav() {
    // INDEX_RING also gates on the index columns existing, so on entry pages
    // (no columns) the arrows aren't swallowed and the index hint stays quiet.
    var HAS_INDEX = onRealIndex(),
        INDEX_RING = HAS_INDEX && new URLSearchParams(location.search).get('ring') !== '0',
        RUST = 'var(--_lungitz---color-accent-b-500)';

    function typing(e) {
        var t = e.target;
        return !!(t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable));
    }
    function nativeFocused() {
        var a = document.activeElement;
        return !!(a && a !== document.body && a.matches &&
                  a.matches('a[href],button,[role="button"],input,select,textarea,[tabindex]:not([tabindex="-1"])'));
    }
    function col(side) { return document.querySelector('.wrapper-content.is-' + side); }
    function trigsIn(c) { return c ? [].slice.call(c.querySelectorAll(TRIGGER)) : []; }
    function openTrig() { return document.querySelector(TRIGGER + '.open'); }
    function thumbsOf(t) { return t ? [].slice.call(t.querySelectorAll(W_THUMB)) : []; }

    // ── index focus ring (state 1) — reuses the rust hover-highlight tokens ──
    var kbEntry = null, lastEntry = null;
    function ring(el, on) {
        if (!el) { return; }
        el.style.borderColor  = on ? RUST : '';
        el.style.color        = on ? RUST : '';
        el.style.borderRadius = on ? '8px' : '';
    }
    function focusEntry(el, scroll) {
        if (kbEntry && kbEntry !== el) { ring(kbEntry, false); }
        kbEntry = el || null;
        if (!kbEntry) { if (typeof lightRealm === 'function') { lightRealm(null); } return; }
        ring(kbEntry, true);
        lastEntry = kbEntry;
        if (typeof lightRealm === 'function') {
            lightRealm(kbEntry.closest('.wrapper-content.is-right') ? 'hideaways'
                     : kbEntry.closest('.wrapper-content.is-left') ? 'giveaways' : null);
        }
        if (scroll !== false) { kbEntry.scrollIntoView({ block: 'nearest' }); }
    }
    function blurEntry() {
        ring(kbEntry, false); kbEntry = null;
        if (typeof lightRealm === 'function') { lightRealm(null); }
    }
    function nearestTop(list) {
        var best = null, bestD = Infinity;
        list.forEach(function (t) {
            var d = Math.abs(t.getBoundingClientRect().top - 88);
            if (d < bestD) { bestD = d; best = t; }
        });
        return best;
    }
    function seed() {
        if (kbEntry) { return true; }
        var all = trigsIn(col('left')).concat(trigsIn(col('right')));
        focusEntry((lastEntry && all.indexOf(lastEntry) !== -1) ? lastEntry : nearestTop(all));
        return !!kbEntry;
    }
    function moveEntry(d) {
        if (!seed()) { return; }
        var list = trigsIn(kbEntry.closest('.wrapper-content')), i = list.indexOf(kbEntry);
        if (i === -1) { return; }
        focusEntry(list[Math.max(0, Math.min(list.length - 1, i + d))]);
    }
    function switchCol() {
        if (!seed()) { return; }
        var list = trigsIn(col(kbEntry.closest('.wrapper-content.is-left') ? 'right' : 'left'));
        if (!list.length) { return; }
        var y = kbEntry.getBoundingClientRect().top, best = list[0], bD = Infinity;
        list.forEach(function (t) {
            var dd = Math.abs(t.getBoundingClientRect().top - y);
            if (dd < bD) { bD = dd; best = t; }
        });
        focusEntry(best);
    }

    // ── thumbnail focus ring (state 2) ──
    var kbThumb = -1;
    function ringThumb(t, idx) {
        thumbsOf(t).forEach(function (th, k) {
            th.style.outline = (k === idx) ? '2px solid ' + RUST : '';
            th.style.outlineOffset = (k === idx) ? '2px' : '';
            var hov = th.querySelector('.thumb-hover');   // lift the veil on the focused thumb (matches hover)
            if (hov) { hov.classList.toggle('is-revealed', k === idx); }
        });
    }
    function focusThumb(t, idx) {
        var th = thumbsOf(t);
        if (!th.length) { return; }
        kbThumb = Math.max(0, Math.min(th.length - 1, idx));
        ringThumb(t, kbThumb);
        th[kbThumb].scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }
    function clearThumb() { var t = openTrig(); if (t) { ringThumb(t, -1); } kbThumb = -1; }

    // ── hint chip ──
    var hint = document.createElement('div');
    hint.className = 'kb-hint';
    hint.setAttribute('aria-hidden', 'true');
    var hs = document.createElement('style');
    hs.textContent =
        '.kb-hint{position:fixed;right:1.5rem;bottom:1.5rem;z-index:1200;font-family:inherit;'
      + 'font-size:12px;letter-spacing:.02em;line-height:1;color:color-mix(in srgb,var(--_lungitz---color-accent-a-500),#fff 30%);'
      + 'background:color-mix(in srgb,var(--_lungitz---color-ink-900),#000 8%);'
      + 'padding:.4rem .6rem;border-radius:6px;pointer-events:none;white-space:nowrap;'
      + 'border:1px solid transparent;opacity:0;transition:opacity .25s,border-color .25s;}'
      + '.kb-hint.is-on{opacity:.8;border-color:color-mix(in srgb,var(--_lungitz---color-accent-a-500),transparent 50%);}'
      + '@media (hover:none),(pointer:coarse){.kb-hint{display:none!important;}}';
    document.head.appendChild(hs);
    (document.body || document.documentElement).appendChild(hint);

    var kbMode = false;   // true once the keyboard is in use; a mouse press exits
    // Browser-fullscreen steals Esc (the Antoine case) — advertise the paths
    // that always work there instead. Back genuinely closes (history state).
    function browserFs() {
        return !!document.fullscreenElement || Math.abs(window.innerHeight - screen.height) < 6;
    }
    function levelText() {
        var esc = browserFs() ? '✕ / back' : 'esc';
        if (fs) { return zoom ? '←→ pan · +/− zoom · ' + esc + ' reset' : '←→ image · +/− zoom · ⏎ zoom · ' + esc + ' exit'; }
        if (detail) { return '←→ image · ⏎ fullscreen · esc back'; }
        if (openTrig()) { return '←→ thumbnails · ⏎ view · esc close'; }
        return INDEX_RING ? '↑↓ browse · ←→ switch side · ⏎ open' : '';
    }
    function paintHint() {
        var txt = kbMode ? levelText() : '';
        if (txt) { hint.textContent = txt; hint.classList.add('is-on'); }
        else { hint.classList.remove('is-on'); }
    }
    function reconcile() {            // after a step-out, restore the ring to where you were
        if (INDEX_RING && kbMode && !fs && !detail && !openTrig() && lastEntry) {
            focusEntry(lastEntry, false);
        }
        paintHint();
    }

    // ── zoom via keys (state 4) ──
    function kbZoom(dir) {
        if (!fs) { return; }
        var img = fsImage();
        if (!img) { return; }
        var r = img.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        if (dir > 0) { zoomSet(img, (zoom ? zoom.scale : 1) * 1.6, cx, cy); }
        else if (zoom) {
            var s = zoom.scale / 1.6;
            if (s <= 1.05) { zoomOut(img); } else { zoomSet(img, s, cx, cy); }
        }
    }

    // ── the handler ──
    document.addEventListener('keydown', function (e) {
        if (typing(e) || e.metaKey || e.ctrlKey || e.altKey) { return; }
        var k = e.key;

        if (k === 'Escape') { kbMode = true; setTimeout(reconcile, 0); return; }   // step-out is the main handler's

        if (k === 'Enter') {                       // ⏎ — drill IN
            if (nativeFocused()) { return; }       // a real control owns ⏎ → let it fire
            kbMode = true;
            if (fs) {                          // ⏎ in fullscreen → toggle zoom
                e.preventDefault();
                var fimg = fsImage();
                if (zoom) { zoomOut(fimg); }
                else if (fimg) { var fr = fimg.getBoundingClientRect(); zoomSet(fimg, 2, fr.left + fr.width / 2, fr.top + fr.height / 2); }
                paintHint(); return;
            }
            if (detail) { e.preventDefault(); if (typeof openFullscreen === 'function') { openFullscreen(); } paintHint(); return; }
            var ot = openTrig();
            if (ot) {
                var th = thumbsOf(ot);
                if (kbThumb < 0) { kbThumb = 0; }
                if (th[kbThumb]) { e.preventDefault(); th[kbThumb].click(); }
                paintHint(); return;
            }
            if (INDEX_RING && seed()) {
                e.preventDefault();
                var header = kbEntry.querySelector(HEADER);
                if (header) { ring(kbEntry, false); header.click(); }
                paintHint();
            }
            return;
        }

        if (fs && (k === '+' || k === '=' || k === '-' || k === '_')) {   // +/− zoom
            e.preventDefault(); kbMode = true;
            kbZoom((k === '-' || k === '_') ? -1 : +1);
            paintHint(); return;
        }
        if (fs && k === '0' && zoom) {
            e.preventDefault(); kbMode = true;
            zoomOut(fsImage()); paintHint(); return;
        }

        if (k === 'ArrowUp' || k === 'ArrowDown' || k === 'ArrowLeft' || k === 'ArrowRight') {
            if (fs || detail) { kbMode = true; setTimeout(paintHint, 0); return; }   // existing handler does image nav
            var ot2 = openTrig();
            if (ot2) {                              // state 2 — thumbnails
                if (k === 'ArrowLeft' || k === 'ArrowRight') {
                    e.preventDefault(); kbMode = true;
                    focusThumb(ot2, kbThumb < 0 ? 0 : kbThumb + (k === 'ArrowRight' ? 1 : -1));
                    paintHint();
                }
                return;
            }
            if (!INDEX_RING) { return; }            // state 1 ring off (v2) → page scrolls normally
            e.preventDefault(); kbMode = true;
            if (k === 'ArrowUp') { moveEntry(-1); }
            else if (k === 'ArrowDown') { moveEntry(+1); }
            else { switchCol(); }
            paintHint();
        }
    });

    // Mouse takes over → drop the keyboard rings + hint (mouse wins).
    document.addEventListener('mousedown', function () {
        if (kbEntry) { blurEntry(); }
        clearThumb();
        if (kbMode) { kbMode = false; paintHint(); }
    });
}());

}());

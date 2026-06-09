(function () {
'use strict';

// v7 sandbox variant — based on current production (commit c745464:
// Designer-owned fullscreen CSS + propagateFs), NOT on v1–v6 (which predate
// the fullscreen→Designer migration). No /sandbox bail here: this script is
// loaded BY the sandbox loader, so it is meant to run on /sandbox.
// New in v7: the masthead menu (Track A) — see the §Masthead menu block at end.

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

var detail      = null,
    fs          = null,
    zoom        = null,
    panState    = null,
    dragMoved   = false,
    pendingOpen = null;

// ── Injected styles (scrollbars + detail animation) + theme-color ──
(function injectCSS() {
    var INK = 'var(--_lungitz---color-ink-900)',
        css = [
            '.wrapper-content{',
            '  scrollbar-width:thin;',
            '  scrollbar-color:#000 color-mix(in srgb,' + INK + ',#000 20%);',
            '  scroll-padding-top:64px;',
            '}',
            '.wrapper-content::-webkit-scrollbar{width:8px;height:8px}',
            '.wrapper-content::-webkit-scrollbar-track{',
            '  background:color-mix(in srgb,' + INK + ',#000 20%);',
            '}',
            '.wrapper-content::-webkit-scrollbar-thumb{',
            '  background:#000;border-radius:4px;',
            '}',
            '.wrapper-content::-webkit-scrollbar-thumb:hover{',
            '  background:#1a1a1a;',
            '}',
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
            '.trigger-accordion.is-closing{',
            '  transition:grid-template-rows 500ms ' + CLOSE_EASE + '!important;',
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

function scrollToTrigger(trigger) {
    var col = trigger.closest('.wrapper-content'),
        pad = 64, frames = 0, maxFrames = 60, smoothed;
    if (!col) {
        return;
    }
    function step() {
        var target = Math.max(0, col.scrollTop
                   + trigger.getBoundingClientRect().top
                   - col.getBoundingClientRect().top - pad),
            diff;
        frames += 1;
        if (smoothed === undefined) {
            smoothed = target;
        }
        smoothed += (target - smoothed) * 0.35;
        diff = smoothed - col.scrollTop;
        if (frames <= 2) {
            requestAnimationFrame(step);
            return;
        }
        if ((Math.abs(diff) < 1.5 && Math.abs(target - smoothed) < 1.5) || frames > maxFrames) {
            return;
        }
        col.scrollTop += diff * 0.08;
        requestAnimationFrame(step);
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

    el = view.querySelector(DETAIL_IMG);
    if (el && img.src) {
        el.src = img.src;
    }

    count = view.querySelector('[data-detail="count"]');
    if (count) {
        count.textContent = (detail.idx + 1) + ' / ' + n;
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

// Realm highlight: light a masthead word in the rust accent. Shared by the
// hover cue (states 1–3) and the fullscreen lock (state 4).
function lightRealm(side) {
    var g = document.querySelector('.nav-giveaways .h5-nav'),
        h = document.querySelector('.nav-hideaways .h5-nav');
    if (g) { g.classList.toggle('is-active', side === 'giveaways'); }
    if (h) { h.classList.toggle('is-active', side === 'hideaways'); }
}

// Immersive frame (Track B): in fullscreen the masthead persists as the frame
// instead of being covered. Toggle .is-immersive on .nav (it breathes + animates
// the ✕ into place) and lock the active realm word lit (is-left → giveaways,
// is-right → hideaways). The ✕ + styling live in navMenu.
function setImmersive(on, trigger) {
    var nav = document.querySelector('.nav.expand'), side;
    if (!nav) { return; }
    nav.classList.toggle('is-immersive', on);
    if (on && trigger) {
        side = trigger.closest('.wrapper-content.is-right') ? 'hideaways'
             : (trigger.closest('.wrapper-content.is-left') ? 'giveaways' : null);
        lightRealm(side);
    } else {
        lightRealm(null);
    }
}

function openFullscreen() {
    var view, first, last, dx, dy, sx, sy;
    if (!detail) {
        return;
    }
    view = detail.trigger.querySelector(DETAIL);
    if (!view) {
        return;
    }

    first = view.getBoundingClientRect();
    view.classList.add('is-fullscreen');
    propagateFs(view, true);
    last = view.getBoundingClientRect();

    dx = first.left + first.width / 2 - (last.left + last.width / 2);
    dy = first.top + first.height / 2 - (last.top + last.height / 2);
    sx = first.width / last.width;
    sy = first.height / last.height;

    view.style.transition = 'none';
    view.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(' + sx + ',' + sy + ')';

    fs = { view: view };
    setImmersive(true, detail.trigger);

    requestAnimationFrame(function () {
        view.style.transition = 'transform ' + TRANSITION + 'ms ' + SETTLE;
        view.style.transform = 'none';
    });
}

function closeFullscreen() {
    var view, trigger, wasSingle, first, last, dx, dy, sx, sy;
    if (!fs) {
        return;
    }
    view = fs.view;
    trigger = detail ? detail.trigger : null;
    wasSingle = detail && detail.images.length === 1;

    if (zoom) {
        resetZoom();
    }

    fs = null;
    setImmersive(false);

    // OPTION C (adopted): single-image close snaps instantly, no motion.
    // The fullscreen-to-thumbnail morph was flash-prone; a clean snap back to
    // the preview is bulletproof, and the entry stays engaged (rust + revealed
    // thumbnail) so it doesn't feel abrupt.
    if (wasSingle) {
        view.style.transition = 'none';
        view.style.transform = '';
        view.classList.remove('is-fullscreen');
        propagateFs(view, false);
        if (trigger) { closeDetail(trigger); }
        return;
    }

    first = view.getBoundingClientRect();
    view.classList.remove('is-fullscreen');
    propagateFs(view, false);
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

function zoomIn(img, clientX, clientY) {
    var rect = img.getBoundingClientRect(),
        ox = clientX - rect.left,
        oy = clientY - rect.top,
        natS = Math.max(img.naturalWidth / rect.width, img.naturalHeight / rect.height),
        s = Math.max(2, Math.min(natS, 4));

    zoom = { scale: s, panX: 0, panY: 0 };

    img.style.transformOrigin = ox + 'px ' + oy + 'px';
    img.style.transition = 'transform 300ms ' + SETTLE;
    img.style.transform = 'scale(' + s + ')';
    img.classList.add('is-zoomed');
}

function zoomOut(img) {
    img.style.transition = 'transform 300ms ' + SETTLE;
    img.style.transform = 'none';
    img.classList.remove('is-zoomed');
    img.classList.remove('is-panning');
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
    img = fs.view.querySelector(DETAIL_IMG);
    if (img) {
        img.style.transition = 'none';
        img.style.transform = 'none';
        img.style.transformOrigin = '';
        img.classList.remove('is-zoomed');
        img.classList.remove('is-panning');
    }
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
    var img = e.target.closest(DETAIL_IMG);
    if (!img) {
        return;
    }
    e.preventDefault();

    if (fs) {
        if (dragMoved) {
            dragMoved = false;
            return;
        }
        if (zoom) {
            zoomOut(img);
        } else {
            zoomIn(img, e.clientX, e.clientY);
        }
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

// Pan handlers for zoomed image
document.addEventListener('mousedown', function (e) {
    var img;
    if (!zoom) {
        return;
    }
    img = e.target.closest(DETAIL_IMG);
    if (!img) {
        return;
    }
    e.preventDefault();
    dragMoved = false;
    panState = {
        img: img,
        startX: e.clientX,
        startY: e.clientY,
        basePanX: zoom.panX,
        basePanY: zoom.panY
    };
    img.style.transition = 'none';
    img.classList.add('is-panning');
});

document.addEventListener('mousemove', function (e) {
    var dx, dy;
    if (!panState) {
        return;
    }
    dx = e.clientX - panState.startX;
    dy = e.clientY - panState.startY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        dragMoved = true;
    }
    zoom.panX = panState.basePanX + dx;
    zoom.panY = panState.basePanY + dy;
    panState.img.style.transform = 'translate(' + zoom.panX + 'px,' + zoom.panY + 'px) scale(' + zoom.scale + ')';
});

document.addEventListener('mouseup', function () {
    if (!panState) {
        return;
    }
    panState.img.classList.remove('is-panning');
    panState = null;
});

// Keyboard: Escape steps back, arrows navigate
document.addEventListener('keydown', function (e) {
    var open, view;
    if (e.key === 'Escape') {
        if (zoom && fs) {
            zoomOut(fs.view.querySelector(DETAIL_IMG));
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
//  §Masthead menu  (v8 — Track A; built as a DRAWER, promote → Designer)
//
//  Masthead order: GIVEAWAYS (left) · LUNGITZ (center/home) · HIDEAWAYS (right).
//  The masthead IS a grid-rows drawer, same mechanic/easing as .caption-drawer:
//    row 1 (auto) = .nav-content (the words) — the persistent handle
//    row 2 (1fr↔0fr) = .nav-body — the collapsing menu (mirror of .caption-body)
//  Click a side word → .nav gets .is-open, row 2 animates open (grid-template-rows
//  .45s, injected in code — motion-in-code, so Webflow's audit never sees it).
//  Two columns held inside the nav's 96vw (giveaways left, hideaways right) so
//  the right column can't overflow at ~1900px (the v6-era bug).
//
//  Menu items reuse the masthead's own .h5-nav type (+ a .nav-item combo for
//  item-specific tweaks) so they line up with the words above and stay fully
//  editable in the Designer. .nav-menu shares .nav-content's horizontal padding
//  (var space-1) so items align under their trigger word.
//
//  The TWIST: clicking an item reveals its content in .nav-detail — itself a
//  nested grid-rows drawer (the reveal echoes the hide/reveal scaffold).
//  Close: click LUNGITZ, Esc, or click outside. Mobile stacks the columns.
//  Placeholder copy from the mockups — real sourcing (CMS vs static) is next.
// ════════════════════════════════════════════════════════════════════════
(function navMenu() {
    var nav = document.querySelector('.nav.expand');
    if (!nav) { return; }

    var GIVEAWAYS = [
        { label: 'Participants', html: '<p>Brishty Alam · Abdul Sharif Oluwafemi Baruwa · Flo Karl Berger · Marc-Alexandre Dumoulin · Baptiste El Baz · Julia S. Goodman · Edgar Lessig · Morusiewicz / Maggessi · Stephanie Misa · Johanna Tinzl · Antoine Turillon · Rosabel Rosalind · Anna Weberberger · Seth Weiner</p>' },
        { label: 'Friends',      html: '<p>Friends of the project — placeholder.</p>' },
        { label: 'Supporters',   html: '<p>Supporters — placeholder.</p>' },
        { label: 'Impressum',    html: '<p>Concept — Antoine Turillon, Seth Weiner.</p><p>Thanks to Andrea Wahl, Andreas Haider, Annalise Podor, Felix Vierlinger, Fina Esslinger, Judith Pirkelbauer, Laura Rumpl, Otto Tremetzberger, Tomiris Dmitrievskikh, Wolgang Schmutz, FdR-Team.</p>' }
    ];
    var HIDEAWAYS = [
        { label: 'Lungitz',    html: '<p>Lungitz is a village in the community of Katsdorf, Perg district of Upper Austria. During WWII it was the site of slave labour and the “Gusen III” sub-camp of the Mauthausen-Gusen concentration camp complex.</p>' },
        { label: 'Gusen III',  html: '<p>Gusen III — placeholder.</p>' },
        { label: 'Mauthausen', html: '<p>Mauthausen — placeholder.</p>' },
        { label: 'Resources',  html: '<p>Resources — placeholder.</p>' }
    ];

    // Inject feelable styling (sandbox-only; reuses the live design tokens +
    // the SETTLE easing from the outer scope). On promote this translates to
    // Designer combos on the same class names; the grid-rows transition stays
    // in code (motion-in-code — Webflow's audit rejects grid-template-rows).
    var V = function (n) { return 'var(--_lungitz---' + n + ')'; },
        css = [
            // .nav becomes a 2-row drawer: words (auto) + collapsing body (0fr↔1fr)
            '.nav.expand{',
            '  grid-auto-flow:row;grid-template-columns:1fr;',
            '  grid-template-rows:auto 0fr;height:auto;align-items:stretch;',
            '  transition:grid-template-rows .45s ' + SETTLE + ',',
            '    padding .2s,border-radius .175s,color 75ms,margin .3s,width .3s;',
            '}',
            '.nav.expand.is-open{',
            '  grid-template-rows:auto 1fr;',
            '  padding-bottom:' + V('space-5') + ';',
            '  border:1px dashed ' + V('color-accent-b-500') + ';',
            '  border-radius:' + V('space-2') + ';',
            '}',
            // the collapsing row clips its content (mirror of .caption-body)
            '.nav-body{min-height:0;overflow:hidden;}',
            // two columns, sharing .nav-content's horizontal padding (space-1) so
            // items line up under their trigger word
            '.nav-menu{',
            '  display:grid;grid-template-columns:1fr 1fr;',
            '  grid-column-gap:' + V('space-3') + ';grid-row-gap:' + V('space-4') + ';',
            '  padding:' + V('space-2') + ' ' + V('space-1') + ' 0;',
            '}',
            '.nav-panel{display:flex;flex-direction:column;grid-row-gap:' + V('space-1') + ';}',
            '.nav-panel.is-giveaways{align-items:flex-start;}',
            '.nav-panel.is-hideaways{align-items:flex-end;}',
            // items reuse the masthead .h5-nav type; neutralise its flex:1 and add
            // the click affordance via the .nav-item combo (Seth styles this)
            '.nav-panel .h5-nav{flex:0 0 auto;}',
            '.nav-item{cursor:pointer;text-decoration:none;display:block;}',
            '.nav-item.is-current{color:' + V('color-ink-100') + ';}',
            // the TWIST: selected item content reveals via a nested grid-rows drawer
            '.nav-detail{',
            '  grid-column:1 / -1;display:grid;grid-template-rows:0fr;',
            '  transition:grid-template-rows .45s ' + SETTLE + ';',
            '}',
            '.nav-detail.is-shown{grid-template-rows:1fr;}',
            '.nav-detail-body{',
            '  min-height:0;overflow:hidden;color:' + V('color-ink-100') + ';',
            '  padding-top:' + V('space-2') + ';',
            '}',
            '.nav-detail.is-hideaways .nav-detail-body{text-align:right;}',
            '.nav-detail-body p{margin:0 0 ' + V('space-2') + ';max-width:60ch;}',
            '.nav-detail.is-hideaways .nav-detail-body p{margin-left:auto;}',
            // ── Immersive frame (Track B — fullscreen) ──
            // Fullscreen sits BELOW the persistent masthead instead of covering it
            // (override of the Designer .detail-view.is-fullscreen inset:0 combo),
            // and becomes a column: image fills the height, caption/credit below.
            '.detail-view.is-fullscreen{',
            '  inset:calc(4vh + 3rem) 1.5rem 1.5rem;',
            '  display:flex;flex-direction:column;',
            '}',
            // State-3 control bar is stripped in fullscreen (the frame ✕ is the close).
            '.detail-bar.is-fullscreen{display:none;}',
            // Image fits to the available height; the caption drawer sits below, shown
            // (override .is-collapsed so caption + credit are visible in fullscreen).
            '.detail-image.is-fullscreen{flex:1 1 auto;min-height:0;height:auto;}',
            '.caption-drawer.is-fullscreen{flex:0 0 auto;grid-template-rows:auto 1fr;}',
            // Masthead breathes in fullscreen + opens room on the right for the ✕.
            '.nav.expand.is-immersive{margin:1.5rem;width:auto;}',
            '.nav.expand.is-immersive .nav-content{padding-right:3.25rem;}',
            // Active realm word lit in the rust accent (accent-b-500).
            '.h5-nav.is-active{color:' + V('color-accent-b-500') + ';}',
            // Fullscreen ✕ — animates into place (scale + fade) when immersive.
            '.frame-close{',
            '  opacity:0;transform:scale(.85);pointer-events:none;',
            '  position:absolute;top:0;bottom:0;right:' + V('space-2') + ';',
            '  margin:auto 0;width:2.25rem;height:2.25rem;',
            '  display:flex;align-items:center;justify-content:center;',
            '  background:none;border:1px dashed ' + V('color-accent-a-500') + ';',
            '  border-radius:2rem;color:' + V('color-accent-a-500') + ';',
            '  cursor:pointer;font-family:inherit;line-height:1;',
            '  transition:opacity .3s,transform .3s,color .2s,border-color .2s;',
            '}',
            '.nav.expand.is-immersive .frame-close{opacity:1;transform:scale(1);pointer-events:auto;}',
            '.frame-close:hover{color:' + V('color-ink-100') + ';border-color:' + V('color-ink-300') + ';}',
            '@media (max-width:640px){',
            '  .nav-menu{grid-template-columns:1fr;}',
            '  .nav-panel.is-hideaways{align-items:flex-start;}',
            '  .nav-panel.is-hideaways .nav-item.is-right{text-align:left;}',
            '  .nav-detail.is-hideaways .nav-detail-body{text-align:left;}',
            '  .nav-detail.is-hideaways .nav-detail-body p{margin-left:0;}',
            '}'
        ].join('\n'),
        styleEl = document.createElement('style');
    styleEl.textContent = css;
    document.head.appendChild(styleEl);

    // Hide Seth's early scaffold panel (we render a clean one in its place).
    var scaffold = nav.querySelector('.nav-menu-content');
    if (scaffold) { scaffold.style.display = 'none'; }

    // Nested drawer for the selected item's content (mirror of .caption-drawer).
    var detail = document.createElement('div'),
        detailBody = document.createElement('div');
    detail.className = 'nav-detail';
    detailBody.className = 'nav-detail-body';
    detail.appendChild(detailBody);

    function selectItem(side, item, el) {
        nav.querySelectorAll('.nav-item.is-current').forEach(function (b) {
            b.classList.remove('is-current');
        });
        el.classList.add('is-current');
        detailBody.innerHTML = item.html;
        detail.className = 'nav-detail is-shown is-' + side;
    }

    function buildPanel(side, items) {
        var align = side === 'hideaways' ? 'is-right' : 'is-left',
            panel = document.createElement('div');
        panel.className = 'nav-panel is-' + side;
        items.forEach(function (item) {
            // <a.h5-nav.nav-item> — reuses the masthead word type
            var el = document.createElement('a');
            el.href = '#';
            el.className = 'h5-nav nav-item ' + align;
            el.textContent = item.label;
            el.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                selectItem(side, item, el);
            });
            panel.appendChild(el);
        });
        return panel;
    }

    var body = document.createElement('div'),
        menu = document.createElement('div');
    body.className = 'nav-body';
    menu.className = 'nav-menu';
    menu.appendChild(buildPanel('giveaways', GIVEAWAYS));
    menu.appendChild(buildPanel('hideaways', HIDEAWAYS));
    menu.appendChild(detail);
    body.appendChild(menu);
    nav.appendChild(body);

    // Fullscreen ✕ (frame-breathes) — lives in the masthead frame, hidden until
    // .nav.is-immersive (set by openFullscreen). Closes the immersive view.
    var closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'frame-close';
    closeBtn.setAttribute('aria-label', 'Close fullscreen');
    closeBtn.textContent = '✕';
    closeBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        closeFullscreen();
    });
    nav.appendChild(closeBtn);

    function closeMenu() {
        nav.classList.remove('is-open');
        nav.querySelectorAll('.nav-item.is-current').forEach(function (b) {
            b.classList.remove('is-current');
        });
        detail.className = 'nav-detail';
        detailBody.innerHTML = '';
    }
    function toggleMenu() {
        if (nav.classList.contains('is-open')) { closeMenu(); }
        else { nav.classList.add('is-open'); }
    }

    var gWord = nav.querySelector('.nav-giveaways'),
        hWord = nav.querySelector('.nav-hideaways'),
        lWord = nav.querySelector('.nav-lungitz');
    if (gWord) { gWord.addEventListener('click', function (e) { e.preventDefault(); toggleMenu(); }); }
    if (hWord) { hWord.addEventListener('click', function (e) { e.preventDefault(); toggleMenu(); }); }
    if (lWord) {
        lWord.addEventListener('click', function (e) {
            if (nav.classList.contains('is-open')) { e.preventDefault(); closeMenu(); }
        });
    }

    document.addEventListener('click', function (e) {
        if (nav.classList.contains('is-open') && !nav.contains(e.target)) { closeMenu(); }
    });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && nav.classList.contains('is-open')) { closeMenu(); }
    });
}());

// Realm hover cue (Track B, cross-state): hovering a column lights its masthead
// word in the rust accent — the same signal the fullscreen lock uses. Skipped
// while immersive so the locked realm stays put.
(function realmHover() {
    function immersive() {
        var nav = document.querySelector('.nav.expand');
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

}());

(function () {
'use strict';

// Lungitz production interaction script. Promoted from sandbox/v17 (the cumulative
// winner: masthead menu drawer, immersive fullscreen frame, slideshow nav, layered
// zoom/pan, arrangement). Loaded by the Home page — bail on /sandbox so it doesn't
// double-bind with the loader's sandbox/vN.js. The injected CSS scaffold below is
// being migrated to Designer combos; motion + grid-rows transitions stay here.
if (/\/sandbox\/?$/.test(location.pathname)) { return; }

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
    fsHome      = null,
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

// Immersive frame (Track B): in fullscreen the masthead persists as the frame
// instead of being covered. Toggle .is-immersive on .nav (it breathes + animates
// the ✕ into place) and lock the active realm word lit (is-left → giveaways,
// is-right → hideaways). The ✕ + styling live in navMenu.
function setImmersive(on, trigger) {
    var nav = document.querySelector('.nav.wide, .nav.expand'), side;
    if (!nav) { return; }
    nav.classList.toggle('is-immersive', on);
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
    img = fs.view.querySelector(DETAIL_IMG);
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
    var img = e.target.closest(DETAIL_IMG);
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
    img = e.target.closest(DETAIL_IMG);
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
    img = fs.view.querySelector(DETAIL_IMG);
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
    // The masthead combo was renamed expand→wide in the Designer (2026-06-10).
    // Accept either chain and emit the injected CSS against the one the element
    // actually carries, so a Designer rename can't silently kill the menu again.
    var nav = document.querySelector('.nav.wide, .nav.expand');
    if (!nav) { return; }
    var NAVC = nav.classList.contains('wide') ? '.nav.wide' : '.nav.expand';

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
            // .nav is a 2-row drawer: words (auto) + collapsing body (0fr↔1fr).
            // The static rest grid (auto 0fr, row-gap 0) now ALSO lives on the
            // Designer's .nav.wide combo (caption-drawer precedent); this keeps
            // the values for the expand fallback + carries the motion, which the
            // Designer can't (Webflow's audit blocks grid-template-rows there).
            NAVC + '{',
            '  grid-auto-flow:row;grid-template-columns:1fr;grid-row-gap:0;',
            '  grid-template-rows:auto 0fr;height:auto;align-items:stretch;',
            '  transition:grid-template-rows .45s ' + SETTLE + ',',
            '    padding .2s,border-radius .175s,color 75ms,margin .3s,width .3s;',
            '}',
            NAVC + '.is-open{',
            '  grid-template-rows:auto 1fr;',
            '  padding-bottom:' + V('space-5') + ';',
            '  border:1px dashed ' + V('color-accent-b-500') + ';',
            '  border-radius:' + V('space-2') + ';',
            '}',
            // The collapsing row clips its content (mirror of .caption-body).
            // display:block at .nav.wide .nav-body specificity overrides the
            // Designer's .nav-body{display:none} — Seth's canvas-tidiness knob —
            // so the published class can never kill the runtime drawer (Home's
            // fallback-built menu uses the same class).
            NAVC + ' .nav-body{display:block;min-height:0;overflow:hidden;}',
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
            // The modal FILLS the viewport (opaque ink, inset:0) so the archive
            // columns are fully covered — no bleed-through (the v10 bug). The image
            // is held below the masthead by padding-top; side/bottom padding lets the
            // frame breathe. The nav floats ON TOP via z-index (set below), rather
            // than insetting the modal beneath it (which left gaps showing columns).
            // z-index 999 re-asserts the D5 stack (the Designer combo drifted
            // back to 100000, which buries the masthead frame at 1000). margin:0
            // kills the base .detail-view margin — a fixed element honors margin,
            // so it was shoving the modal off the viewport top (the bleed strip,
            // measured live: margin-top 12px ⇒ rect.top 12).
            '.detail-view.is-fullscreen{',
            '  inset:0;margin:0;display:flex;flex-direction:column;z-index:999;',
            '  padding:calc(4vh + 3rem) 1.5rem 1.5rem;',
            '}',
            // State-3 control bar is stripped in fullscreen (the frame ✕ is the close).
            '.detail-bar.is-fullscreen{display:none;}',
            // Image fits to the available height; the caption drawer sits below, shown
            // (override .is-collapsed so caption + credit are visible in fullscreen).
            '.detail-image.is-fullscreen{flex:1 1 auto;min-height:0;height:auto;}',
            '.caption-drawer.is-fullscreen{flex:0 0 auto;grid-template-rows:auto 1fr;transition:opacity .25s;}',
            // Zoomed = uncluttered: the caption row fades out while the magnifier
            // is active (body.is-fs-zoom — the same flag that hides the chevrons)
            // and returns on zoom-out. Opacity, not display — no layout jump.
            'body.is-fs-zoom .caption-drawer.is-fullscreen{opacity:0;pointer-events:none;}',
            // Caption footer: slide counter first (bottom-left), then caption · credit.
            // One steady caption row: counter + credit never break internally;
            // the caption text wraps naturally and takes the slack. Text LOOK
            // (size/color/family) = Seth's base .caption-content in Designer.
            '.caption-content.is-fullscreen{display:flex;flex-wrap:wrap;justify-content:flex-start;align-items:baseline;column-gap:' + V('space-3') + ';row-gap:.25rem;}',
            '.caption-content.is-fullscreen .fs-count{flex:0 0 auto;white-space:nowrap;}',
            '.caption-content.is-fullscreen p{flex:0 1 auto;min-width:0;margin:0;}',
            '.caption-content.is-fullscreen p + p{flex:0 0 auto;white-space:nowrap;}',
            '.fs-count{display:none;}',
            '.caption-drawer.is-fullscreen .fs-count{display:inline-block;color:' + V('color-accent-a-500') + ';}',
            // Migrated to Designer combos (2026-06-09): masthead breathing
            // (.nav.expand.is-immersive), the rust realm word (.h5-nav.is-realm), and
            // the ✕ LOOK (.frame-close + :hover). Kept here: the 3-col centering grid
            // + descendant rules (Webflow can't author descendants), and the ✕'s
            // position + reveal motion.
            '.nav-content{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;}',
            '.nav-giveaways{justify-self:start;}',
            '.nav-lungitz{justify-self:center;}',
            '.nav-hideaways{justify-self:end;}',
            // Re-homed in code: the migrated .nav.expand.is-immersive Designer
            // combo was orphaned by the expand→wide rename (the MCP can't author
            // the shared is-immersive modifier on a new chain — gotcha).
            NAVC + '.is-immersive{margin:1.5rem;width:auto;z-index:1000;}',
            NAVC + '.is-immersive .nav-hideaways{padding-right:3rem;}',
            // Reveal MOTION only — position/size/look live on the Designer's
            // .frame-close class now (injected position was stomping Seth's
            // Designer tuning, e.g. his right: space-2).
            '.frame-close{',
            '  opacity:0;transform:scale(.85);pointer-events:none;',
            '  font-family:inherit;',
            '  transition:opacity .3s,transform .3s,color .2s,border-color .2s;',
            '}',
            NAVC + '.is-immersive .frame-close{opacity:1;transform:scale(1);pointer-events:auto;}',
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
        var img = fs.view.querySelector(DETAIL_IMG);
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
        img = fs.view.querySelector(DETAIL_IMG);
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

}());

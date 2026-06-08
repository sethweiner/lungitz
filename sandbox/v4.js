(function () {
'use strict';

var TRIGGER    = '.trigger-accordion',
    HEADER     = '.header-accordion',
    CONTENT    = '.content-accordion',
    W_THUMB    = '.wrapper-thumbnail',
    IMG_THUMB  = '.image-thumbnail',
    DETAIL     = '.detail-view',
    DETAIL_IMG = '.detail-image',
    CAPTION    = '.caption-drawer',
    CAP_BODY   = '.caption-content',
    FS_OVERLAY = '.immersive-overlay',
    FS_IMAGE   = '.immersive-image',
    FS_TITLE   = '[data-detail="title"]',
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
            '.detail-view.is-fullscreen{',
            '  position:fixed;inset:0;z-index:999;',
            '  background:' + INK + ';',
            '}',
            '.detail-view.is-fullscreen ' + DETAIL_IMG + '{',
            '  width:100%;height:100%;object-fit:contain;',
            '  cursor:zoom-in;',
            '}',
            '.detail-view.is-fullscreen ' + DETAIL_IMG + '.is-zoomed{',
            '  cursor:grab;',
            '}',
            '.detail-view.is-fullscreen ' + DETAIL_IMG + '.is-panning{',
            '  cursor:grabbing;',
            '}',
            '.content-accordion{',
            '  transition:opacity 120ms ease;',
            '}',
            '.trigger-accordion.is-closing{',
            '  transition:grid-template-rows 500ms ' + CLOSE_EASE + '!important;',
            '}',
            '.trigger-accordion.is-closing .content-accordion{',
            '  opacity:0;',
            '}',
            // v4 / OPTION B: match the thumbnail crop to the fullscreen image
            // (both letterboxed) so the close swap is pixel-identical, no pop.
            '.image-thumbnail{object-fit:contain!important}'
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
        detail = null;
    }
}

// ── State 4 : Fullscreen (FLIP — same element promotes to fixed) ──

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
    last = view.getBoundingClientRect();

    dx = first.left + first.width / 2 - (last.left + last.width / 2);
    dy = first.top + first.height / 2 - (last.top + last.height / 2);
    sx = first.width / last.width;
    sy = first.height / last.height;

    view.style.transition = 'none';
    view.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(' + sx + ',' + sy + ')';

    fs = { view: view };

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

    if (wasSingle) {
        first = view.getBoundingClientRect();
        var sContent = trigger ? trigger.querySelector(CONTENT) : null;
        var sImgWrap = sContent ? sContent.querySelector('.wrapper-images') : null;
        var sThumb = trigger ? trigger.querySelector(W_THUMB) : null;
        if (sImgWrap) { sImgWrap.style.display = ''; }
        last = sThumb ? sThumb.getBoundingClientRect() : first;
        if (sImgWrap) { sImgWrap.style.display = 'none'; }

        dx = (last.left + last.width / 2) - (first.left + first.width / 2);
        dy = (last.top + last.height / 2) - (first.top + first.height / 2);
        sx = last.width / first.width;
        sy = last.height / first.height;

        requestAnimationFrame(function () {
            view.style.transition = 'transform ' + TRANSITION + 'ms ' + SETTLE;
            view.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(' + sx + ',' + sy + ')';
        });

        // Clean synchronous swap at the end — no visibility toggle. Because the
        // thumbnail is now object-fit:contain (matching the fullscreen image),
        // the FLIP lands pixel-identical to the thumbnail underneath, so
        // restoring it + removing the detail view in one task is seamless.
        setTimeout(function () {
            view.style.transition = 'none';
            view.style.transform = '';
            view.classList.remove('is-fullscreen');
            if (trigger) { closeDetail(trigger); }
            requestAnimationFrame(function () { view.style.transition = ''; });
        }, TRANSITION + 50);

        return;
    }

    first = view.getBoundingClientRect();
    view.classList.remove('is-fullscreen');
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
    el.classList.add('is-closing');
    el.classList.remove('open');
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
            trigger.classList.add('open');
        }, CLOSE_STAGGER);
    } else {
        trigger.classList.add('open');
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

}());

(function () {
'use strict';

// ════════════════════════════════════════════════════════════════════════
//  Lungitz sandbox v23 — fresh path. = v22 (Phase 2 fluid macro-space + the
//  accepted mobile masthead / scrollbar fixes) PLUS the fullscreen CLOSE redesign.
//
//  Close = Option A (Seth's pick), at ALL widths:
//   · the bolted-on ✕ is removed;
//   · LUNGITZ (the home word) exits fullscreen — hover tint + a subtle tooltip
//     ("Close · Esc") teach it;
//   · clicking the dark backdrop around the image exits;
//   · Esc still exits (already in v18).
//  Layered on v18: reuses v18's tested close by programmatically clicking the
//  now-hidden .frame-close (no surgery on the close logic).
//
//  ★ BOOKMARK (Seth, 2026-06-11): he loves keyboard control — wants hotkeys to
//    drill in/out of states (states 2–4 / fullscreen). Future arc; the tooltip's
//    "Esc" hint is a first nod to it.
// ════════════════════════════════════════════════════════════════════════
var INK = 'var(--_lungitz---color-ink-900)';
var TRACK = 'color-mix(in srgb,' + INK + ',#000 20%)';
var ACC = 'var(--_lungitz---color-accent-b-500)';
var S = '--_lungitz---space-';
var css =
    ':root{'
  + S + '5:clamp(1.062rem, 0.9953rem + 0.283vw, 1.25rem);'    /* 17→20 */
  + S + '6:clamp(1.25rem, 1.16rem + 0.377vw, 1.5rem);'        /* 20→24 */
  + S + '8:clamp(1.562rem, 1.406rem + 0.66vw, 2rem);'         /* 25→32 */
  + S + '10:clamp(1.812rem, 1.566rem + 1.04vw, 2.5rem);'      /* 29→40 */
  + S + '12:clamp(2.125rem, 1.811rem + 1.32vw, 3rem);'        /* 34→48 */
  + S + '16:clamp(2.688rem, 2.217rem + 1.98vw, 4rem);'        /* 43→64 */
  + S + '24:clamp(3.625rem, 2.774rem + 3.58vw, 6rem);'        /* 58→96 */
  + '}'
  + '@media (max-width:767px){'
  + '  .nav.wide{width:auto;left:0;right:0;margin:0.75rem;}'
  + '  .h5-nav{font-size:clamp(0.8125rem, 4vw, 1.1875rem)!important;letter-spacing:-0.05rem;}'
  + '  .nav.wide.is-immersive .nav-hideaways{padding-right:2rem!important;}'
  + '  .nav.wide.is-immersive .nav-giveaways{padding-left:2rem!important;}'
  + '  .wrapper-content.is-left{padding-right:1rem!important;}'
  + '  .wrapper-content.is-right{padding-left:1rem!important;}'
  + '  html{scrollbar-width:thin;scrollbar-color:#000 ' + TRACK + ';}'
  + '  html::-webkit-scrollbar{width:8px;height:8px;}'
  + '  html::-webkit-scrollbar-track{background:' + TRACK + ';}'
  + '  html::-webkit-scrollbar-thumb{background:#000;border-radius:4px;}'
  + '  html::-webkit-scrollbar-thumb:hover{background:#1a1a1a;}'
  + '}'
  // ── Fullscreen close = LUNGITZ + backdrop + Esc (✕ removed) ──
  + '.frame-close{display:none!important;}'
  + '.nav.wide.is-immersive .nav-lungitz{cursor:pointer;position:relative;}'
  + '.nav.wide.is-immersive .nav-lungitz .h5-nav{transition:color .2s;}'
  + '.nav.wide.is-immersive .nav-lungitz:hover .h5-nav{color:' + ACC + ';}'
  + '.nav.wide.is-immersive .nav-lungitz::after{content:"Close · Esc";position:absolute;top:100%;left:50%;transform:translateX(-50%);margin-top:7px;font-size:11px;letter-spacing:.06em;color:' + ACC + ';white-space:nowrap;opacity:0;transition:opacity .2s;pointer-events:none;}'
  + '.nav.wide.is-immersive .nav-lungitz:hover::after{opacity:.85;}';
var st = document.createElement('style');
st.setAttribute('data-fluid-space', 'b2');
st.textContent = css;
(document.head || document.documentElement).appendChild(st);

function fsActive() { return !!document.querySelector('.nav.wide.is-immersive, .nav.expand.is-immersive'); }
function closeFs() { var x = document.querySelector('.frame-close'); if (x) { x.click(); } }

// LUNGITZ exits fullscreen (capture so it beats any masthead handler)
document.addEventListener('click', function (e) {
  if (!fsActive()) { return; }
  if (e.target.closest('.nav-lungitz')) {
    e.preventDefault();
    e.stopPropagation();
    closeFs();
  }
}, true);

// Backdrop: a click on the dark frame area (not the image / caption / controls /
// nav / chevrons, and not while zoomed) exits.
document.addEventListener('click', function (e) {
  if (!fsActive() || document.body.classList.contains('is-fs-zoom')) { return; }
  var view = document.querySelector('.detail-view.is-fullscreen');
  if (!view || !view.contains(e.target)) { return; }
  if (e.target.closest('.detail-image, .caption-drawer, .fs-nav, .nav, [data-detail]')) { return; }
  closeFs();
}, false);

// Real interaction layer (v18 runs on /sandbox), cache-busted.
var p = document.createElement('script');
p.src = 'https://sethweiner.github.io/lungitz/sandbox/v18.js?t=' + Date.now();
document.body.appendChild(p);

}());

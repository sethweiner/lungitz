(function () {
'use strict';

// ════════════════════════════════════════════════════════════════════════
//  Lungitz sandbox v25 — fresh path. Cumulative (v24 + three Seth tweaks now
//  that the ✕ is gone):
//   1. Fullscreen masthead: HIDEAWAYS still carried the ✕-gap (padding-right)
//      that pushed it off the right edge → set immersive .nav-hideaways
//      padding-right:0 so it justifies hard-right (and drop the symmetric
//      .nav-giveaways pad — both edges natural again).
//   2. Mobile masthead: shrunk to fit the ✕; without it, bump the cap (~19→22px).
//   3. Prev/next zones: the CURSOR becomes ← / → over the .fs-nav zones (same
//      idea as the ✕ cursor on exit targets).
//  Loads v18 (bounce-fixed). Phase 1 LIVE. [Keyboard-hotkeys arc bookmarked.]
// ════════════════════════════════════════════════════════════════════════
var INK = 'var(--_lungitz---color-ink-900)';
var TRACK = 'color-mix(in srgb,' + INK + ',#000 20%)';
var ACC = 'var(--_lungitz---color-accent-a-500)';
var RUST = 'var(--_lungitz---color-accent-b-500)';
var F4 = 'var(--_lungitz---font-size-4)';
var CUR = function (svg) { return "url(\"data:image/svg+xml," + svg + "\") 13 13, pointer"; };
// ✕ (exit), ← (prev), → (next) — off-white, for the dark frame.
var XCUR = CUR("%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='26'%20height='26'%3E%3Cg%20stroke='%23e8e2da'%20stroke-width='2'%20stroke-linecap='round'%3E%3Cline%20x1='8'%20y1='8'%20x2='18'%20y2='18'/%3E%3Cline%20x1='18'%20y1='8'%20x2='8'%20y2='18'/%3E%3C/g%3E%3C/svg%3E");
var LCUR = CUR("%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='26'%20height='26'%3E%3Cg%20fill='none'%20stroke='%23e8e2da'%20stroke-width='2'%20stroke-linecap='round'%20stroke-linejoin='round'%3E%3Cline%20x1='19'%20y1='13'%20x2='7'%20y2='13'/%3E%3Cpolyline%20points='12,8%207,13%2012,18'/%3E%3C/g%3E%3C/svg%3E");
var RCUR = CUR("%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='26'%20height='26'%3E%3Cg%20fill='none'%20stroke='%23e8e2da'%20stroke-width='2'%20stroke-linecap='round'%20stroke-linejoin='round'%3E%3Cline%20x1='7'%20y1='13'%20x2='19'%20y2='13'/%3E%3Cpolyline%20points='14,8%2019,13%2014,18'/%3E%3C/g%3E%3C/svg%3E");
var S = '--_lungitz---space-';
var css =
    ':root{'
  + S + '5:clamp(1.062rem, 0.9953rem + 0.283vw, 1.25rem);'
  + S + '6:clamp(1.25rem, 1.16rem + 0.377vw, 1.5rem);'
  + S + '8:clamp(1.562rem, 1.406rem + 0.66vw, 2rem);'
  + S + '10:clamp(1.812rem, 1.566rem + 1.04vw, 2.5rem);'
  + S + '12:clamp(2.125rem, 1.811rem + 1.32vw, 3rem);'
  + S + '16:clamp(2.688rem, 2.217rem + 1.98vw, 4rem);'
  + S + '24:clamp(3.625rem, 2.774rem + 3.58vw, 6rem);'
  + '}'
  // (1) immersive masthead: kill the leftover ✕-gap so HIDEAWAYS justifies right
  + '.nav.wide.is-immersive .nav-hideaways{padding-right:0!important;}'
  + '.nav.wide.is-immersive .nav-giveaways{padding-left:0!important;}'
  + '@media (max-width:767px){'
  + '  .nav.wide{width:auto;left:0;right:0;margin:0.75rem;}'
  // (2) bump the mobile masthead cap (~19→22px), still scales down on narrow phones
  + '  .h5-nav{font-size:clamp(0.875rem, 4.4vw, 1.375rem)!important;letter-spacing:-0.05rem;}'
  + '  .wrapper-content.is-left{padding-right:1rem!important;}'
  + '  .wrapper-content.is-right{padding-left:1rem!important;}'
  + '  html{scrollbar-width:thin;scrollbar-color:#000 ' + TRACK + ';}'
  + '  html::-webkit-scrollbar{width:8px;height:8px;}'
  + '  html::-webkit-scrollbar-track{background:' + TRACK + ';}'
  + '  html::-webkit-scrollbar-thumb{background:#000;border-radius:4px;}'
  + '  html::-webkit-scrollbar-thumb:hover{background:#1a1a1a;}'
  + '}'
  // close affordance: ✕ cursor over exit targets
  + '.frame-close{display:none!important;}'
  + '.nav.wide.is-immersive .nav-lungitz{cursor:' + XCUR + ';}'
  + '.detail-view.is-fullscreen{cursor:' + XCUR + ';}'
  + '.caption-drawer.is-fullscreen{cursor:auto;}'
  // (3) directional cursor over the prev/next zones
  + '.fs-nav.is-prev{cursor:' + LCUR + ';}'
  + '.fs-nav.is-next{cursor:' + RCUR + ';}'
  // prev/next reborn as the state-3 .button arrows
  + '.fs-chev{font-size:0!important;text-shadow:none!important;font-family:inherit!important;padding:var(' + S + '3)!important;color:' + ACC + '!important;line-height:1!important;}'
  + '.fs-chev::before{font-size:' + F4 + ';line-height:1;}'
  + '.fs-nav.is-prev .fs-chev::before,[data-entry-nav="prev"] .fs-chev::before,[data-entry-nav="prev"].fs-chev::before{content:"\\2190";}'
  + '.fs-nav.is-next .fs-chev::before,[data-entry-nav="next"] .fs-chev::before,[data-entry-nav="next"].fs-chev::before{content:"\\2192";}'
  + '.fs-nav:hover .fs-chev,[data-entry-nav]:hover .fs-chev{color:' + RUST + '!important;}';
var st = document.createElement('style');
st.setAttribute('data-fluid-space', 'b2');
st.textContent = css;
(document.head || document.documentElement).appendChild(st);

function fsActive() { return !!document.querySelector('.nav.wide.is-immersive, .nav.expand.is-immersive'); }
function closeFs() { var x = document.querySelector('.frame-close'); if (x) { x.click(); } }

document.addEventListener('click', function (e) {
  if (!fsActive()) { return; }
  if (e.target.closest('.nav-lungitz')) { e.preventDefault(); e.stopPropagation(); closeFs(); }
}, true);

document.addEventListener('click', function (e) {
  if (!fsActive() || document.body.classList.contains('is-fs-zoom')) { return; }
  var view = document.querySelector('.detail-view.is-fullscreen');
  if (!view || !view.contains(e.target)) { return; }
  if (e.target.closest('.detail-image, .caption-drawer, .fs-nav, .nav, [data-detail]')) { return; }
  closeFs();
}, false);

var p = document.createElement('script');
p.src = 'https://sethweiner.github.io/lungitz/sandbox/v18.js?t=' + Date.now();
document.body.appendChild(p);

}());

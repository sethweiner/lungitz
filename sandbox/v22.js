(function () {
'use strict';

// ════════════════════════════════════════════════════════════════════════
//  Lungitz sandbox v22 — Thread B (durability) Phase 2 proof. Fresh path (the
//  Pages CDN caches vN.js by path, so a new number serves clean on ?v=22).
//  Loads v18 (bounce-fixed). Phase 1 (fluid type) is LIVE.
//
//  v22 = v21 (Phase 2 fluid macro-space + even-spaced mobile masthead, accepted)
//  PLUS two pre-existing mobile fixes Seth flagged:
//   · Content-list right padding off: .wrapper-content.is-left/.is-right carry the
//     desktop INNER-gutter padding (.25rem) — fine between two columns, but when
//     they STACK on mobile it becomes an asymmetric edge. Reset both to 1rem ≤767.
//   · Default (non-custom) scrollbar on mobile: the custom scrollbar is styled on
//     .wrapper-content, but on mobile the PAGE (html) scrolls, not the columns —
//     so mirror the custom scrollbar onto html ≤767.
// ════════════════════════════════════════════════════════════════════════
var INK = 'var(--_lungitz---color-ink-900)';
var TRACK = 'color-mix(in srgb,' + INK + ',#000 20%)';
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
  // masthead (v21, accepted): scrollbar-safe width, capped size, even immersive spacing
  + '  .nav.wide{width:auto;left:0;right:0;margin:0.75rem;}'
  + '  .h5-nav{font-size:clamp(0.8125rem, 4vw, 1.1875rem)!important;letter-spacing:-0.05rem;}'
  + '  .nav.wide.is-immersive .nav-hideaways{padding-right:2rem!important;}'
  + '  .nav.wide.is-immersive .nav-giveaways{padding-left:2rem!important;}'
  // (1) content list: reset desktop inner-gutter padding so stacked columns are symmetric
  + '  .wrapper-content.is-left{padding-right:1rem!important;}'
  + '  .wrapper-content.is-right{padding-left:1rem!important;}'
  // (2) custom scrollbar on the page (html scrolls on mobile, not .wrapper-content)
  + '  html{scrollbar-width:thin;scrollbar-color:#000 ' + TRACK + ';}'
  + '  html::-webkit-scrollbar{width:8px;height:8px;}'
  + '  html::-webkit-scrollbar-track{background:' + TRACK + ';}'
  + '  html::-webkit-scrollbar-thumb{background:#000;border-radius:4px;}'
  + '  html::-webkit-scrollbar-thumb:hover{background:#1a1a1a;}'
  + '}';
var s = document.createElement('style');
s.setAttribute('data-fluid-space', 'b2');
s.textContent = css;
(document.head || document.documentElement).appendChild(s);

// Real interaction layer (v18 runs on /sandbox), cache-busted.
var p = document.createElement('script');
p.src = 'https://sethweiner.github.io/lungitz/sandbox/v18.js?t=' + Date.now();
document.body.appendChild(p);

}());

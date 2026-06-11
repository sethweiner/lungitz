(function () {
'use strict';

// ════════════════════════════════════════════════════════════════════════
//  Lungitz sandbox v20 — Thread B (durability) Phase 2 proof. Page-local (?v=20);
//  loads v18 for the real masthead / columns / CMS. Phase 1 (fluid type) is LIVE.
//
//  rev2 — Seth feedback on rev1:
//   (1) "a pixel more air on mobile" → bumped the macro-space floors.
//   (2) MOBILE MASTHEAD (≤479) fixes — both issues share one root: 3 words
//       (GIVEAWAYS · LUNGITZ · HIDEAWAYS) are too wide for a phone.
//        · Issue 1 (overflow/scrollbar clips HIDEAWAYS): .nav is position:absolute,
//          width:97vw + margin:1rem, so its right edge lands past the scrollbar
//          (vw ignores the scrollbar). Fix: on mobile drop the vw width — left:0/
//          right:0 + small margin sizes it to the scrollbar-safe area, and
//          scrollbar-gutter:stable reserves the bar so nothing paints under it.
//        · Issue 2 (immersive squish, center pinned): the words overflow their
//          1fr auto 1fr cells and collide. Fix: a mobile masthead size that fits
//          all three (clamp ~13→20px across phones), tighter letter-spacing, and
//          less ✕ gap in the immersive frame.
//   These are mobile-masthead candidates to FEEL — not yet promoted.
// ════════════════════════════════════════════════════════════════════════
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
  // ── Mobile masthead (≤479): fit the three words + keep clear of the scrollbar ──
  + '@media (max-width:479px){'
  + '  html{scrollbar-gutter:stable;}'
  // scrollbar-safe nav width: drop the 97vw, let left/right + margin size it.
  + '  .nav.wide{width:auto;left:0;right:0;margin:0.5rem;}'
  // shrink the words so all three fit a phone; tighter tracking buys room.
  + '  .h5-nav{font-size:clamp(0.8125rem, 4.2vw, 1.375rem)!important;letter-spacing:-0.04rem;}'
  // immersive frame is tighter (margin + ✕ gap) — trim the ✕ gap so it doesn\'t squish.
  + '  .nav.wide.is-immersive .nav-hideaways{padding-right:1.5rem;}'
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

(function () {
'use strict';

// ════════════════════════════════════════════════════════════════════════
//  Lungitz sandbox v20 — Thread B (durability) Phase 2 proof. Page-local (?v=20);
//  loads v18 (bounce-fixed) for the real masthead / columns / CMS. Phase 1 LIVE.
//
//  rev4 — Seth feedback on rev3:
//   · scrollbar-gutter:stable was the WRONG tool — it surfaced the default (non-
//     custom) page scrollbar and unbalanced the container padding. Dropped it.
//     The real clip fix is `width:auto; left/right:0` — it sizes the nav to the
//     scrollbar-EXCLUDED content area (97vw was the bug: vw INCLUDES the scrollbar).
//     So the clip stays fixed, the custom scrollbar + symmetric container return.
//   · The ✕ got crammed against HIDEAWAYS (over-trimmed the immersive ✕-gap in
//     rev3). Fix: shrink the mobile masthead a touch so 3 words + the ✕ fit with
//     air (cap ~22px, scaling down on narrow phones), and a balanced ✕-gap (2rem).
//
//  Mobile-masthead fixes are candidates to feel — not yet promoted. Plus rev2's
//  bumped macro-space floors (the Phase 2 substance).
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
  // ── Mobile masthead (≤767) ──
  + '@media (max-width:767px){'
  // clip fix: drop 97vw; left/right+margin sizes the nav to the content area
  // (excludes the scrollbar). No scrollbar-gutter → custom scrollbar + symmetric
  // container preserved.
  + '  .nav.wide{width:auto;left:0;right:0;margin:0.75rem;}'
  // shrink the three words a touch (cap ~22px, scales down narrow) so they + the
  // immersive ✕ fit with air; tighter tracking buys room.
  + '  .h5-nav{font-size:clamp(0.8125rem, 4.6vw, 1.375rem)!important;letter-spacing:-0.05rem;}'
  // balanced ✕-gap in the immersive frame (rev3 over-trimmed it → ✕ crammed).
  + '  .nav.wide.is-immersive .nav-hideaways{padding-right:2rem!important;}'
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

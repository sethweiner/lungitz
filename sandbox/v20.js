(function () {
'use strict';

// ════════════════════════════════════════════════════════════════════════
//  Lungitz sandbox v20 — Thread B (durability) Phase 2 proof. Page-local (?v=20);
//  loads v18 for the real masthead / columns / CMS. Phase 1 (fluid type) is LIVE.
//
//  rev3 — Seth feedback on rev2 (mobile screenshots):
//   · BOUNCE was back in the sandbox only — production is fixed, but v20 loads v18
//     which still transitioned `width`. Fixed at the source in v18.js (no override
//     needed here).
//   · The mobile masthead rules were scoped ≤479, but the clip/squish happen across
//     the whole mobile range (the 97vw+margin nav passes the scrollbar for any
//     viewport < ~1030px; the immersive ✕-gap eats room). Moved to ≤767.
//   Masthead mobile fixes (candidates to feel — not yet promoted):
//     (1) overflow/scrollbar: drop the 97vw nav width, size via left/right+margin
//         with scrollbar-gutter:stable so the right edge clears the scrollbar.
//     (2) immersive squish: trim the immersive ✕-gap (2.75rem→1.5rem) so HIDEAWAYS
//         stops colliding with LUNGITZ.
//     (3) smallest phones (≤479): shrink the words (clamp ~13→20px) so all three
//         still fit the narrowest nav; tighter tracking.
//   Plus rev2's bumped macro-space floors (a touch more mobile air).
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
  // ── Mobile masthead (≤767): keep the whole nav clear of the scrollbar ──
  + '@media (max-width:767px){'
  + '  html{scrollbar-gutter:stable;}'
  + '  .nav.wide{width:auto;left:0;right:0;margin:0.5rem;}'
  + '  .nav.wide.is-immersive .nav-hideaways{padding-right:1.5rem!important;}'
  + '}'
  // ── Smallest phones (≤479): shrink the three words so they all fit ──
  + '@media (max-width:479px){'
  + '  .h5-nav{font-size:clamp(0.8125rem, 4.2vw, 1.375rem)!important;letter-spacing:-0.04rem;}'
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

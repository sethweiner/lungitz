(function () {
'use strict';

// ════════════════════════════════════════════════════════════════════════
//  Lungitz sandbox v21 — Thread B (durability) Phase 2 proof. FRESH version on
//  purpose: the GitHub Pages CDN caches sandbox/vN.js by path (ignoring the
//  loader's ?t=), so editing v20 in place kept serving stale for ~10 min. A new
//  path (v21) the CDN has never seen serves fresh on a normal load of ?v=21.
//  Page-local; loads v18 (bounce-fixed) for the real masthead / columns / CMS.
//
//  Carries Phase 2 fluid macro-space (the substance) + the mobile-masthead
//  candidates, now with the EVEN-SPACING fix:
//   · Earlier revs stopped the words touching but left the masthead lopsided —
//     the immersive ✕-padding pulled HIDEAWAYS toward center while GIVEAWAYS
//     stayed pinned far-left. Fix: symmetric insets in the immersive frame
//     (pad GIVEAWAYS left == HIDEAWAYS right) so both flank LUNGITZ evenly, with
//     the ✕ living in the right inset; and a uniform mobile masthead cap (~19px,
//     scaling down on narrow phones) so 3 words + ✕ always fit with air.
//   · Clip fix unchanged: width:auto + left/right:0 (NO scrollbar-gutter — that
//     broke the custom scrollbar + container symmetry).
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
  // clip fix: drop 97vw; size to the scrollbar-excluded content area.
  + '  .nav.wide{width:auto;left:0;right:0;margin:0.75rem;}'
  // uniform mobile cap (~19px, scales down narrow) so words + ✕ always fit.
  + '  .h5-nav{font-size:clamp(0.8125rem, 4vw, 1.1875rem)!important;letter-spacing:-0.05rem;}'
  // EVEN SPACING in the immersive frame: pad both flanks equally so GIVEAWAYS and
  // HIDEAWAYS sit symmetrically around LUNGITZ; the ✕ lives in the right inset.
  + '  .nav.wide.is-immersive .nav-hideaways{padding-right:2rem!important;}'
  + '  .nav.wide.is-immersive .nav-giveaways{padding-left:2rem!important;}'
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

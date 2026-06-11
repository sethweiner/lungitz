(function () {
'use strict';

// ════════════════════════════════════════════════════════════════════════
//  Lungitz sandbox v19 — Thread B (durability): FLUID TYPE proof
//
//  Phase B1: prove a clamp() ramp for the type scale BEFORE committing it to
//  the live Webflow Variables (which are site-wide — a token edit would hit
//  Home + every page at once). This variant overrides the 10 --font-size-*
//  tokens locally via an injected :root block, so the ramp can be felt on the
//  REAL masthead / columns / CMS content at any viewport width — page-local
//  (only ?v=19 loads it; live token values untouched).
//
//  Ramp design (a11y-minded — rem floors/ceilings + a `rem + vw` preferred
//  term so browser zoom still scales type, the known clamp() caveat):
//    · ceiling = current desktop px (preserve the design at ≥1440px)
//    · floor reached at 480px vw, ceiling at 1440px vw, linear between
//    · fs-1..3 (12/14/16px — body + fine print) stay STATIC for legibility;
//      only the display/heading tier (fs-4..10) goes fluid, compressing
//      hardest at the top (where px-locked type blows out small screens)
//    · fs-8 floor = 22px reproduces the @479 `.h5-nav { font-size:22px }`
//      patch exactly, so retiring that patch is lossless. The @479 override
//      below neutralizes the published hard-22px so the TOKEN does the work,
//      proving the patch can be deleted.
// ════════════════════════════════════════════════════════════════════════
var V = '--_lungitz---font-size-';
var css =
    ':root{'
  + V + '4:clamp(1rem, 0.9375rem + 0.208vw, 1.125rem);'        /* 16→18 */
  + V + '5:clamp(1.0625rem, 0.9688rem + 0.3125vw, 1.25rem);'   /* 17→20 */
  + V + '6:clamp(1.1875rem, 1.0313rem + 0.5208vw, 1.5rem);'    /* 19→24 */
  + V + '7:clamp(1.3125rem, 1.0938rem + 0.7292vw, 1.75rem);'   /* 21→28 */
  + V + '8:clamp(1.375rem, 1.0625rem + 1.0417vw, 2rem);'       /* 22→32 */
  + V + '9:clamp(1.875rem, 1.0625rem + 2.7083vw, 3.5rem);'     /* 30→56 */
  + V + '10:clamp(2.25rem, 1.125rem + 3.75vw, 4.5rem);'        /* 36→72 */
  + '}'
  // Retire the @479 hard patch: let the fluid token govern the masthead word
  // at narrow widths (clamp floors it at 22px ≤480px — identical to the patch).
  + '@media screen and (max-width:479px){'
  + '  .h5-nav{font-size:var(--_lungitz---font-size-8)!important;}'
  + '}';
var s = document.createElement('style');
s.setAttribute('data-fluid-type', 'b1');
s.textContent = css;
(document.head || document.documentElement).appendChild(s);

// Load the real interaction layer (v18 = current production-equivalent, runs
// on /sandbox) so the masthead/columns behave exactly as live, with fluid type
// layered on. Cache-busted so edits show on a normal refresh.
var p = document.createElement('script');
p.src = 'https://sethweiner.github.io/lungitz/sandbox/v18.js?t=' + Date.now();
document.body.appendChild(p);

}());

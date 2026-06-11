(function () {
'use strict';

// ════════════════════════════════════════════════════════════════════════
//  Lungitz sandbox v20 — Thread B (durability) Phase 2: FLUID MACRO-SPACE proof
//
//  Phase 1 (fluid type) is now LIVE in the published CSS. This proof layers the
//  macro-space clamps on top via a :root override — page-local (?v=20) — so the
//  layout rhythm can be felt at any width before committing to the live Variables.
//  Loads v18 for the real masthead / columns / CMS.
//
//  Keep space-0..4 (0/4/8/12/16px) FIXED — component gaps, fine padding, hairline
//  rhythm stay crisp. Make space-5..24 FLUID: scale DOWN on mobile (oversized fixed
//  gaps look huge on a phone), hold at today's value on desktop (ceiling = current,
//  band 380→1440 — standard screens unchanged; no big-screen growth, the gutters
//  already breathe wide screens). Floors are monotonic and ≥ space-4 (16px) so the
//  scale never inverts against the fixed tier.
//
//  The semantic aliases (space-stack-*, space-gutter-page*, space-component-*)
//  REFERENCE these primitives, so overriding the primitive cascades to them.
//  Note: a few classes use a --space-* token for font-size (.button:hover /
//  .nav-item-body → space-6; .type → space-4 which stays fixed) — space-6 going
//  fluid makes those sizes fluid too (minor, acceptable).
// ════════════════════════════════════════════════════════════════════════
var S = '--_lungitz---space-';
var css =
    ':root{'
  + S + '5:clamp(1rem, 0.9104rem + 0.377vw, 1.25rem);'        /* 16→20 */
  + S + '6:clamp(1.125rem, 0.9906rem + 0.566vw, 1.5rem);'     /* 18→24 */
  + S + '8:clamp(1.375rem, 1.151rem + 0.943vw, 2rem);'        /* 22→32 */
  + S + '10:clamp(1.625rem, 1.311rem + 1.32vw, 2.5rem);'      /* 26→40 */
  + S + '12:clamp(1.875rem, 1.472rem + 1.7vw, 3rem);'         /* 30→48 */
  + S + '16:clamp(2.375rem, 1.792rem + 2.45vw, 4rem);'        /* 38→64 */
  + S + '24:clamp(3.25rem, 2.264rem + 4.15vw, 6rem);'         /* 52→96 */
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

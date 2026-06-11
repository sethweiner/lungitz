(function () {
'use strict';

// ════════════════════════════════════════════════════════════════════════
//  Lungitz sandbox v19 — Thread B (durability): FLUID TYPE proof
//  Rev 2 (Seth feedback): elastic in BOTH directions + leading fix + masthead split.
//
//  Phase B1: prove a clamp() type scale BEFORE committing it to the live Webflow
//  Variables (site-wide). Injected :root override is page-local (only ?v=19);
//  live token values untouched. Loads v18 so the ramp is felt on the REAL
//  masthead / columns / CMS at any width.
//
//  Ramp (a11y: rem floors/ceilings + `rem + vw` term so zoom still scales type):
//    · band widened to 380→1920 so type keeps GROWING on large screens (ceilings
//      now exceed today's desktop px) — "elastic up". Laptop (1440) lands ~today.
//    · floors RAISED so titles/display read bigger on mobile — "elastic down".
//    · fs-1..3 (12/14/16px body + fine print) stay STATIC for legibility.
//    · MASTHEAD .h5-nav is SPLIT off fs-8 onto its own contained ramp (22→32,
//      capped at 32 — it's chrome, and three words must fit a phone). The
//      !important also retires the published @479 .h5-nav{font-size:22px} patch.
//    · LEADING fix: .title + .h5-nav used line-height:var(--space-8) = a fixed
//      32px, which goes loose once the font scales down. Made unitless so leading
//      tracks the font at every width (also a durability correctness fix).
// ════════════════════════════════════════════════════════════════════════
var V = '--_lungitz---font-size-';
var css =
    ':root{'
  + V + '4:clamp(1rem, 0.9537rem + 0.195vw, 1.1875rem);'        /* 16→19 */
  + V + '5:clamp(1.0625rem, 1.001rem + 0.26vw, 1.3125rem);'     /* 17→21 */
  + V + '6:clamp(1.25rem, 1.1419rem + 0.4545vw, 1.6875rem);'    /* 20→27 */
  + V + '7:clamp(1.4375rem, 1.2987rem + 0.5844vw, 2rem);'       /* 23→32 */
  + V + '8:clamp(1.5625rem, 1.3620rem + 0.8442vw, 2.375rem);'   /* 25→38  .title */
  + V + '9:clamp(2.25rem, 1.7256rem + 2.2078vw, 4.375rem);'     /* 36→70 */
  + V + '10:clamp(2.75rem, 2.0406rem + 2.9870vw, 5.625rem);'    /* 44→90 */
  + '}'
  + '.h5-nav{font-size:clamp(1.375rem, 1.1509rem + 0.9434vw, 2rem)!important;line-height:1.1;}'  /* masthead 22→32, capped */
  + '.title{line-height:1.05;}';                                /* unitless leading */
var s = document.createElement('style');
s.setAttribute('data-fluid-type', 'b1');
s.textContent = css;
(document.head || document.documentElement).appendChild(s);

// Real interaction layer (v18 runs on /sandbox), cache-busted.
var p = document.createElement('script');
p.src = 'https://sethweiner.github.io/lungitz/sandbox/v18.js?t=' + Date.now();
document.body.appendChild(p);

}());

(function () {
'use strict';

// ════════════════════════════════════════════════════════════════════════
//  Lungitz sandbox v19 — Thread B (durability) PROOF.  Page-local (?v=19);
//  live Variables / production untouched. Loads v18 for the real masthead /
//  columns / CMS so everything is felt in context.
//
//  Rev 3 adds two Seth-requested polish items to the type work:
//   (A) Big-screen side gutters — content shouldn't run edge-to-edge on a huge
//       monitor (double 16:9). Fluid side padding that stays 0 until ~1920px
//       then grows gently (capped). Tunable: start 1920 / rate .12 / cap 6vw.
//   (B) Masthead bounce fix — .nav is width:97vw and its transition included
//       `width .3s`, so RESIZING the browser animated the width → rubber-band
//       bounce. Drop `width` from the transition (kept drawer/padding/margin/
//       color). The immersive width:auto change just snaps now (unnoticeable
//       under the fullscreen FLIP). Overridden here with !important; on promote
//       this edit goes into the production navMenu transition.
//
//  Rev 2 (kept): fluid type ramp, a11y rem+vw, elastic BOTH directions
//  (band 380→1920, ceilings exceed today's desktop), fs-1..3 static, masthead
//  .h5-nav split off fs-8 onto its own contained ramp (22→32, capped), and the
//  unitless leading fix on .title / .h5-nav.
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
  + '.title{line-height:1.05;}'                                 /* unitless leading */
  // (A) big-screen side gutters — 0 until ~1920px, then gentle, capped at 6vw.
  + '.container-content{padding-inline:clamp(0px, calc((100vw - 1920px) * 0.12), 6vw);}'
  // (B) masthead bounce fix — same transition as v18's navMenu MINUS `width .3s`.
  + '.nav.wide{transition:grid-template-rows .45s cubic-bezier(0.16,1,0.3,1),padding .2s,border-radius .175s,color 75ms,margin .3s!important;}';
var s = document.createElement('style');
s.setAttribute('data-fluid-type', 'b1');
s.textContent = css;
(document.head || document.documentElement).appendChild(s);

// Real interaction layer (v18 runs on /sandbox), cache-busted.
var p = document.createElement('script');
p.src = 'https://sethweiner.github.io/lungitz/sandbox/v18.js?t=' + Date.now();
document.body.appendChild(p);

}());

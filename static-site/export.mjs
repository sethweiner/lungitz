#!/usr/bin/env node
// Lungitz — Webflow → static export for Netlify (lungitz.com).
//
// Webflow stays the authoring tool. This crawls the PUBLISHED staging site
// (lungitz.webflow.io), self-hosts every asset it references (Webflow CDN images
// incl. all srcset variants, CSS, Webflow's JS, jQuery, Google Fonts, and the
// interactions script from GitHub Pages), rewrites the HTML to those local copies,
// and writes static-site/dist — the folder Netlify deploys.
//
//   node static-site/export.mjs            # build dist/
//   netlify deploy --prod --dir static-site/dist
//
// No dependencies (Node 20+). Assets are cached in dist/ between runs — Webflow
// asset URLs are immutable (new upload = new id), so only new files download.
// Files no page references any more are pruned at the end.
//
// Entry pages aren't reachable by <a href> on Home (the MCP link-binding limit:
// entry links publish as "#"), so they're seeded from Home's data-slug columns —
// the same source wireEntryNav uses: .wrapper-content.is-left = giveaways,
// .is-right = hideaways.

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const ORIGIN = 'https://lungitz.webflow.io';
const DOMAIN = 'https://lungitz.com';
const HERE = path.dirname(fileURLToPath(import.meta.url));
// Preview builds (never production): LZ_OUT=<dir> writes elsewhere, LZ_THUMB_SIZES=0
// turns OFF the thumbnail sizes rewrite, LZ_SCRIPT=<file> ships that file (e.g. a
// sandbox build) as /js/lungitz-interactions.js. Deploy previews as a Netlify draft.
const DIST = process.env.LZ_OUT ? path.resolve(process.env.LZ_OUT) : path.join(HERE, 'dist');
const PUBLIC = path.join(HERE, 'public'); // robots.txt, _headers… copied verbatim

const SEED_PAGES = ['/', '/participants', '/impressum', '/resources'];
// Dev scratch — never shipped (mirrors the robots.txt Disallow list).
const EXCLUDE = [/^\/sandbox/, /^\/v1(\/|$)/, /^\/archive\//, /^\/home-/, /^\/menu-entries/];

// External host prefix → local path prefix. Every URL matching one of these is
// downloaded and rewritten; anything else (content links to other sites) is left alone.
const HOSTS = [
  ['https://cdn.prod.website-files.com/', '/cdn/'],
  ['https://d3e54v103j8qbb.cloudfront.net/js/', '/vendor/'],
  ['https://sethweiner.github.io/lungitz/', '/js/'],
  ['https://fonts.gstatic.com/', '/fonts/'],
];
const FALLBACK_404 = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/>
<title>Lungitz / Page not found</title><meta content="width=device-width, initial-scale=1" name="viewport"/>
<meta name="color-scheme" content="dark"><meta name="robots" content="noindex">
<link href="/fonts/fonts.css" rel="stylesheet" type="text/css"/>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#000;color:#fff;font-family:Vollkorn,serif;text-align:center}a{color:inherit}</style>
</head><body><main><p>This page doesn&#x27;t exist.</p><p><a href="/">Lungitz</a></p></main></body></html>`;
const UA ='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';

const hostRe = new RegExp('(' + HOSTS.map(([h]) => h.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')).join('|') + ')[^"\'\\s<>)\\\\]+', 'g');

const referenced = new Set();   // local file paths (relative to DIST) the build uses
const queue = new Map();        // remote url → local rel path, pending download

function localFor(url) {
  for (const [h, local] of HOSTS) {
    if (url.startsWith(h)) {
      const rest = url.slice(h.length);
      const clean = rest.split('?')[0];
      return { rel: local.slice(1) + decodeURIComponent(clean), href: local + rest };
    }
  }
  return null;
}

// Rewrite every self-hostable URL in a text blob, queueing the files.
function rewrite(text) {
  return text.replace(hostRe, (m) => {
    const url = m.split('&')[0];            // inline styles carry &quot; after the URL
    const tail = m.slice(url.length);
    const loc = localFor(url);
    const fetchUrl = url.split('?')[0];
    if (!queue.has(fetchUrl)) { queue.set(fetchUrl, loc.rel); }
    referenced.add(loc.rel);
    return loc.href + tail;
  });
}

async function get(url, opts = {}) {
  for (let attempt = 1; ; attempt++) {
    try {
      const r = await fetch(url, { headers: { 'user-agent': UA }, redirect: 'follow', ...opts });
      return r;
    } catch (e) {
      if (attempt >= 4) { throw e; }
      await new Promise((ok) => setTimeout(ok, 500 * attempt));
    }
  }
}

async function exists(p) { try { await fs.access(p); return true; } catch { return false; } }

async function write(rel, data) {
  const p = path.join(DIST, rel);
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.writeFile(p, data);
}

// ---------- Google Fonts → /fonts/fonts.css ----------
// The pages load fonts via webfont.js + WebFont.load({google:{families:[…]}}). Read
// the family list from the page, fetch Google's CSS as a modern browser (woff2),
// self-host the files, and swap the loader for one <link>.
async function buildFonts(families) {
  const url = 'https://fonts.googleapis.com/css?family=' +
    families.map((f) => f.split(':').slice(0, 2).join(':').replace(/ /g, '+')).join('|') +
    '&subset=latin,latin-ext&display=swap';
  const r = await get(url);
  if (!r.ok) { throw new Error('fonts css ' + r.status); }
  const css = rewrite(await r.text());
  await write('fonts/fonts.css', css);
  referenced.add('fonts/fonts.css');
}

function stripFontLoader(html) {
  return html
    .replace(/<link href="https:\/\/fonts\.googleapis\.com" rel="preconnect"\/>/, '')
    .replace(/<link href="https:\/\/fonts\.gstatic\.com" rel="preconnect" crossorigin="anonymous"\/>/, '')
    .replace(/<script src="https:\/\/ajax\.googleapis\.com\/ajax\/libs\/webfont\/[^"]+" type="text\/javascript"><\/script>/, '')
    .replace(/<script type="text\/javascript">WebFont\.load\([\s\S]*?\);<\/script>/,
      '<link href="/fonts/fonts.css" rel="stylesheet" type="text/css"/>');
}

// ---------- pages ----------
function pageFile(p) {
  if (p === '/') { return 'index.html'; }
  if (p === '/404') { return '404.html'; }
  return p.slice(1) + '.html';               // Netlify serves /x from x.html, no trailing-slash redirect
}

function internalLinks(html) {
  const out = new Set();
  for (const m of html.matchAll(/href="(\/[^"]*)"/g)) {
    const p = m[1].split(/[?#]/)[0].replace(/\/$/, '') || '/';
    if (!/\.[a-z0-9]{2,4}$/i.test(p)) { out.add(p); }
  }
  return out;
}

function homeEntrySlugs(html) {
  // Column boundaries: everything after .wrapper-content.is-right belongs to hideaways.
  const right = html.search(/class="[^"]*wrapper-content[^"]*is-right/);
  const out = [];
  for (const m of html.matchAll(/data-slug="([^"]+)"/g)) {
    const coll = right !== -1 && m.index > right ? 'hideaways' : 'giveaways';
    out.push('/' + coll + '/' + m[1]);
  }
  return out;
}

// Thumbnails publish with sizes="100vw" (Webflow's fallback for CMS images), so a
// ~85px thumb fetched the 1080–3200px variant and re-fetched bigger ones on every
// resize (home ≈ 99 MB on a 2× laptop vs ≈ 9 MB right-sized). The column (≈92vw
// stacked, ≈48vw side by side — measured) split across the strip's N images, counted
// per .wrapper-images. Measured 2026-10-16: 1 image ≈ 46vw at 1440, 91vw at 375; a
// 6-image strip ≈ 57px at 375. NEVER "auto": Webflow writes width="Auto" and no
// height, so Chrome lays the img out at 300×150 and object-fit:fill stretched the
// thumbs (90×60 → 90×150). calc-only keeps layout identical (verified, 6 strips).
function fixThumbSizes(html) {
  return html.split(/(?=<div class="wrapper-images)/).map((seg) => {
    const n = (seg.match(/<img[^>]*class="image-thumbnail"/g) || []).length;
    if (!n) { return seg; }
    const div = n > 1 ? ' / ' + n : '';
    const sizes = n > 1
      ? `(max-width: 767px) calc(92vw${div}), calc(48vw${div})`
      : '(max-width: 767px) 92vw, 48vw';
    return seg.replace(/<img([^>]*class="image-thumbnail"[^>]*)>/g,
      (m) => m.replace(/sizes="100vw"/, `sizes="${sizes}"`));
  }).join('');
}

// Hover prefetch: Chrome/Edge fetch a same-origin page's HTML once the pointer rests
// on its link (~200ms), so the click starts from cache. Prefetch only — no prerender,
// which would run the arrival logic (head gate, landingModal) in a hidden page.
// Skipped if the page already carries speculation rules (i.e. once it moves into the
// Webflow site head, which is where it belongs — the export is only the stopgap).
const SPECULATION = '<script type="speculationrules">{"prefetch":[{"where":{"and":[{"href_matches":"/*"},{"not":{"href_matches":"/cdn/*"}}]},"eagerness":"moderate"}]}</script>';

// ---------- custom-code drift check ----------
// webflow-custom-code/ (repo root) holds what Site Settings → Custom Code should
// contain. Warn — never fail — when the published blocks differ, so a stale pin or a
// hand edit that never landed in the repo shows up at publish time. Compared with
// whitespace collapsed; each block runs from its opening comment to </head> / </body>.
const CUSTOM_CODE = path.join(HERE, '..', 'webflow-custom-code');

async function checkCustomCode(html) {
  const norm = (s) => s.replace(/\s+/g, ' ').trim();
  const slice = (start, end) => {
    const i = html.indexOf(start), j = html.indexOf(end, i);
    return i === -1 || j === -1 ? '' : html.slice(i, j);
  };
  const blocks = [
    ['site-head.html', slice('<!-- Lungitz landing gate', '</head>')],
    ['site-footer.html', slice('<!-- Production interaction script', '</body>')],
  ];
  for (const [file, published] of blocks) {
    const want = await fs.readFile(path.join(CUSTOM_CODE, file), 'utf8').catch(() => null);
    if (want === null) { continue; }
    if (norm(published) !== norm(want)) {
      console.warn(`  ⚠ custom code drift: Webflow's published ${file.replace('.html', '')} differs from webflow-custom-code/${file}` +
        ' — paste the repo file into Site Settings → Custom Code and publish (or update the file if Webflow is right)');
    }
  }
}

// ---------- LZ_CLEANUP (preview until Seth approves, 2026-10-16) ----------
// Measured first: no Webflow widgets or IX2 on any page (only CSS hooks like
// w-dyn-item / w-button / w-richtext), so jQuery + Webflow's JS do nothing here
// except bind the scroll handler the interactions script has unbound since v61.
const CLEANUP = !!process.env.LZ_CLEANUP;

function stripWebflowRuntime(html) {
  return html.replace(/<script src="https:\/\/(?:d3e54v103j8qbb\.cloudfront\.net\/js\/jquery-[^"]+|cdn\.prod\.website-files\.com\/[^"\/]+\/js\/[^"]+)"[^>]*><\/script>/g, '');
}

// Drop CSS selectors that need a Webflow utility class (w-*) no exported page
// uses. Seth's own classes are never touched; a rule survives if any of its
// selectors does. Comments are stripped (no braces live in strings here).
function pruneCss(css, used) {
  const splitSel = (s) => {
    const out = []; let depth = 0, cur = '';
    for (const ch of s) {
      if (ch === '(') { depth++; } else if (ch === ')') { depth--; }
      if (ch === ',' && depth === 0) { out.push(cur); cur = ''; } else { cur += ch; }
    }
    out.push(cur);
    return out.map((x) => x.trim()).filter(Boolean);
  };
  const alive = (sel) => {
    for (const m of sel.matchAll(/\.(-?[_a-zA-Z][\w-]*)/g)) {
      if (m[1].startsWith('w-') && !used.has(m[1])) { return false; }
    }
    return true;
  };
  let dropped = 0;
  const walk = (text) => {
    let res = '', pos = 0;
    while (pos < text.length) {
      const open = text.indexOf('{', pos);
      if (open === -1) { res += text.slice(pos); break; }
      let depth = 1, j = open + 1;
      while (j < text.length && depth) {
        if (text[j] === '{') { depth++; } else if (text[j] === '}') { depth--; }
        j++;
      }
      let prelude = text.slice(pos, open);
      const semi = prelude.lastIndexOf(';');          // @charset/@import statements ride along
      if (semi !== -1) { res += prelude.slice(0, semi + 1); prelude = prelude.slice(semi + 1); }
      const body = text.slice(open + 1, j - 1), sel = prelude.trim();
      if (/^@(media|supports|container|layer)\b/.test(sel)) {
        const inner = walk(body);
        if (inner.trim()) { res += '\n' + sel + '{' + inner + '}'; }
      } else if (sel.startsWith('@')) {
        res += '\n' + sel + '{' + body + '}';
      } else {
        const all = splitSel(sel), kept = all.filter(alive);
        if (kept.length) { res += '\n' + kept.join(',') + '{' + body + '}'; }
        if (kept.length < all.length) { dropped += all.length - kept.length; }
      }
      pos = j;
    }
    return res;
  };
  const out = walk(css.replace(/\/\*[\s\S]*?\*\//g, ''));
  return { css: out, dropped };
}

function finishHtml(html) {
  if (CLEANUP) { html = stripWebflowRuntime(html); }
  // Default since v93 shipped (2026-10-16) — v93's preload keeps the lightbox sharp.
  // LZ_THUMB_SIZES=0 turns it off.
  if (process.env.LZ_THUMB_SIZES !== '0') { html = fixThumbSizes(html); }
  if (!html.includes('speculationrules')) { html = html.replace('<meta charset="utf-8"/>', '$&' + SPECULATION); }
  html = stripFontLoader(html);
  html = html.replace(/<link href="https:\/\/cdn\.prod\.website-files\.com" rel="preconnect" crossorigin="anonymous"\/>/, '');
  html = rewrite(html);
  html = html.replaceAll('lungitz.webflow.io', 'lungitz.com');
  // Social/OG images must stay absolute.
  html = html.replace(/(<meta[^>]+content=")\/cdn\//g, '$1' + DOMAIN + '/cdn/');
  return html;
}

async function main() {
  await fs.mkdir(DIST, { recursive: true });
  const pages = new Map();                    // path → html
  const todo = [...SEED_PAGES];
  const seen = new Set(todo);
  let fontFamilies = null;

  while (todo.length) {
    const p = todo.shift();
    const r = await get(ORIGIN + p);
    if (r.status !== 200) { console.warn('  skip', r.status, p); continue; }
    const html = await r.text();
    pages.set(p, html);
    process.stdout.write('  page ' + p + '\n');
    const found = [...internalLinks(html)];
    if (p === '/') { found.push(...homeEntrySlugs(html)); }
    for (const q of found) {
      if (seen.has(q) || EXCLUDE.some((re) => re.test(q))) { continue; }
      seen.add(q); todo.push(q);
    }
    if (!fontFamilies) {
      const fm = /WebFont\.load\(\{\s*google:\s*\{\s*families:\s*(\[[^\]]*\])/.exec(html);
      if (fm) { fontFamilies = JSON.parse(fm[1]); }
    }
  }
  // Webflow serves its 404 page with status 404. Until the site has its own (a 404
  // utility page in the Designer), it's Webflow's generic one — swap in a plain fallback.
  const r404 = await get(ORIGIN + '/404');
  const html404 = await r404.text();
  pages.set('/404', /webflow-https-errors/.test(html404) ? FALLBACK_404 : html404);

  await checkCustomCode(pages.get('/'));
  if (fontFamilies) { await buildFonts(fontFamilies); }

  for (const [p, html] of pages) {
    const f = pageFile(p);
    await write(f, finishHtml(html));
    referenced.add(f);
  }

  // ---------- assets (CSS/JS rewritten in turn; their own url()s join the queue) ----------
  let downloaded = 0, cached = 0;
  const done = new Set();
  while (queue.size > done.size) {
    const batch = [...queue].filter(([u]) => !done.has(u));
    await pool(batch, 8, async ([url, rel]) => {
      done.add(url);
      const isText = /\.(css|js)$/i.test(rel);
      const dest = path.join(DIST, rel);
      if (!isText && await exists(dest)) { cached++; return; }
      const res = await get(url);
      if (!res.ok) { console.warn('  asset', res.status, url); return; }
      if (isText) {
        let text = await res.text();
        if (/\.css$/i.test(rel)) {
          // resolve relative url()s against the CSS's own URL, then self-host them
          text = text.replace(/url\((["']?)(?!data:|https?:|\/)([^"')]+)\1\)/g,
            (m, q, u) => 'url(' + q + new URL(u, url).href + q + ')');
        }
        await write(rel, rewrite(text));
      } else {
        await write(rel, Buffer.from(await res.arrayBuffer()));
      }
      downloaded++;
    });
  }

  if (process.env.LZ_SCRIPT) {
    await write('js/lungitz-interactions.js', await fs.readFile(path.resolve(process.env.LZ_SCRIPT)));
    console.log('  script swapped for preview: ' + process.env.LZ_SCRIPT);
  }

  if (CLEANUP) {
    // 1 · minify the SHIPPED copy only — the commented source stays in the repo
    const js = path.join(DIST, 'js/lungitz-interactions.js');
    const before = (await fs.stat(js)).size;
    execFileSync('npx', ['--yes', 'terser@5.36.0', js, '--compress', '--mangle', '--comments', 'false', '--output', js], { stdio: 'inherit' });
    console.log(`  minified interactions script: ${Math.round(before / 1024)} KB → ${Math.round((await fs.stat(js)).size / 1024)} KB`);

    // 2 · prune unused Webflow utility CSS → a new file (the old URL is cached immutable)
    const htmlFiles = [...pages.keys()].map(pageFile);
    const used = new Set(['w-mod-js', 'w-mod-touch']);   // set by the inline head script
    for (const f of htmlFiles) {
      for (const m of (await fs.readFile(path.join(DIST, f), 'utf8')).matchAll(/class="([^"]*)"/g)) {
        m[1].split(/\s+/).forEach((c) => c && used.add(c));
      }
    }
    for (const m of (await fs.readFile(js, 'utf8')).matchAll(/["'](w-[\w-]+)["']/g)) { used.add(m[1]); }
    const cssRel = [...referenced].find((r) => /\/css\/[^/]+\.css$/.test(r) && r.startsWith('cdn/'));
    const { css, dropped } = pruneCss(await fs.readFile(path.join(DIST, cssRel), 'utf8'), used);
    const newRel = 'css/site.' + createHash('sha256').update(css).digest('hex').slice(0, 10) + '.css';
    await write(newRel, css);
    referenced.delete(cssRel); referenced.add(newRel);
    for (const f of htmlFiles) {
      const p = path.join(DIST, f);
      const html = (await fs.readFile(p, 'utf8')).replace(
        new RegExp('<link href="/' + cssRel.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&') + '"[^>]*>'),
        '<link href="/' + newRel + '" rel="stylesheet" type="text/css"/>');
      await fs.writeFile(p, html);
    }
    console.log(`  pruned CSS: ${dropped} unused w- selectors dropped → /${newRel}`);
  }

  // sitemap.xml — every exported page except 404
  const urls = [...pages.keys()].filter((p) => p !== '/404').sort();
  await write('sitemap.xml',
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls.map((p) => '  <url><loc>' + DOMAIN + (p === '/' ? '/' : p) + '</loc></url>').join('\n') +
    '\n</urlset>\n');
  referenced.add('sitemap.xml');

  // static extras (robots.txt, _headers)
  for (const f of await fs.readdir(PUBLIC)) {
    await write(f, await fs.readFile(path.join(PUBLIC, f)));
    referenced.add(f);
  }

  const pruned = await prune(DIST, '');
  console.log(`\n${pages.size} pages · ${downloaded} assets downloaded · ${cached} cached · ${pruned} stale files pruned`);
  console.log('dist → ' + DIST);
}

async function pool(items, n, fn) {
  let i = 0;
  await Promise.all(Array.from({ length: n }, async () => {
    while (i < items.length) { await fn(items[i++]); }
  }));
}

async function prune(dir, rel) {
  let count = 0;
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    const r = rel ? rel + '/' + e.name : e.name;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      count += await prune(p, r);
      if ((await fs.readdir(p)).length === 0) { await fs.rmdir(p); }
    } else if (!referenced.has(r) && e.name !== '.DS_Store') {
      await fs.unlink(p); count++;
    }
  }
  return count;
}

main().catch((e) => { console.error(e); process.exit(1); });

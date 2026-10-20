# Lungitz: Webflow settings, SEO & findability plan

_Audit of the live site, 2026-10-20 (all 49 pages in lungitz.com/sitemap.xml)._
Supersedes the open items in `FINDABILITY-GO-LIVE.md` (steps 1–4 there are done by the
Netlify export; its JSON-LD drafts are reused below).

## Where things stand

**Already good**
- All 49 pages answer 200; unknown URLs give a real 404.
- Every entry has its own URL, a unique `<title>` ("Name — Lungitz"), and one `<h1>`.
- `robots.txt` on lungitz.com: search + AI retrieval allowed, training crawlers blocked.
  `sitemap.xml` lists every page.
- The staging copy (lungitz.webflow.io) is blocked from crawlers, so it can't compete
  with lungitz.com in search. It does this in robots.txt only, with no `noindex` tag in
  the HTML. That's important, because the export copies the HTML to lungitz.com.
- HTTPS everywhere; http and www redirect to `https://lungitz.com/`.
- `lang="en"` and favicons on every page; Twitter card type on the 45 entries (not on Home and the 3 menu pages).

**Gaps, by impact**

| # | Gap | Measured | Effect |
|---|---|---|---|
| 1 | **No meta descriptions** | 35 of 49 pages empty (Home, Participants, Resources, Impressum, 31 entries); the 14 present are 10–79 chars, mostly the title repeated or translated | Google writes its own snippet from page text; AI answer engines have less to quote |
| 2 | **No share image** | `og:image` on 0 pages | links shared on social media, messengers and email show no picture |
| 3 | **No structured data** | JSON-LD on 0 pages | engines don't know an entry is an artwork / archival document, or who made it |
| 4 | **Image alt text empty** | 362 of 512 images: 228 thumbnails, 86 detail images (46 more are the lightbox, which fills its alt at runtime) | images invisible to image search and screen readers |
| 5 | **Heading structure** | Home has 45 `<h1>` (every entry `.title`); Participants, Resources, Impressum have none | the page's main subject is unclear to engines and screen readers |
| 6 | **No canonical URLs** | 0 pages | minor now that staging is blocked; protects against duplicates (`?menu=1`, `?entry=`, `#info-…` variants) |
| 7 | **Not registered with search engines** | no Search Console / Bing verification | no indexing reports, no way to request a crawl, no query data |
| 8 | Title consistency | "Participants", "Resources" carry no brand; separators mix "/" and "—"; 2 entry titles >60 chars get cut off | small polish |

---

## Phase 1 · Webflow Site Settings (~15 min, with the custom-code alignment)

Do these together when content editing is done, then publish once and run `publish.sh`.

- [ ] **Custom Code**: paste `webflow-custom-code/site-head.html` → Head,
      `site-footer.html` → Footer (replacing everything in each box).
- [ ] **SEO → Global canonical tag URL**: `https://lungitz.com`. Webflow then writes a
      canonical tag on every page (on staging too, which points search engines at the
      real site). *Check after publish:* `curl -s https://lungitz.com/participants | grep canonical`.
- [ ] **SEO → Webflow subdomain indexing**: leave **Off**. It keeps staging out of search.
      Don't add a site-wide `noindex` anywhere in Webflow: the export would copy it to
      lungitz.com.
- [ ] **SEO → Auto-generate sitemap / robots.txt box**: leave as is. They only affect
      webflow.io; lungitz.com gets its own from the export.
- [ ] Skip **Google site verification** in Webflow; verify by DNS instead (Phase 4),
      which covers the whole domain.

## Phase 2 · Designer, one-time template work (~1–2 h)

**Collection templates (Giveaways + Hideaways)**

- [ ] **Meta description field.** Page Settings → SEO description is bound to
      *Subtitle (EN)*, which is empty for most entries. A RichText field can't be used
      (it renders empty in meta tags). Suggest a new **PlainText** field in both
      collections, named your way (e.g. "Meta description"), and rebind SEO
      description + Open Graph description to it. Fill it in Phase 3.
- [ ] **Open Graph image.** Page Settings → Open Graph → image → bind the entry's main
      image field. This can't be set via the API, so it's a Designer step. Every shared
      entry link then carries its picture.
- [ ] **JSON-LD embed.** Add an HTML Embed to each template with the drafts in
      `FINDABILITY-GO-LIVE.md` → "JSON-LD", using `lungitz.com` for YOURDOMAIN. Insert the
      fields with the embed's **+ Add Field** button. Check the field names still exist
      (e.g. *Credit (legacy)*); I can adjust the drafts to the current schema.
- [ ] **Title pattern**: "Name — Lungitz" works; keep it.

**Home**

- [ ] **Headings**: set the entry `.title` heading to **H2** (or H3) in the
      collection-list item; it looks the same, since the styling is on the class. Give the
      page one H1: the LUNGITZ word in the masthead is the natural candidate, but it's
      the Landing Modal component, so it would change on every page. Your call whether
      that's right there, or whether a visually-quiet H1 goes elsewhere.
- [ ] **Page Settings**: write a description (~150 chars) and pick an Open Graph image
      (the site's share card). Optionally a fuller title, e.g. "Lungitz · Gusen III —
      Giveaways & Hideaways".
- [ ] **WebSite / project JSON-LD** in Home's Page Settings → custom code (head). I'll
      draft it: name, description, the two collections, the funder and partners from
      the Impressum. Page-level code is fine here; just remember it duplicates if Home
      is duplicated.

**Participants, Resources, Impressum**

- [ ] Make each page's title heading an **H1**.
- [ ] Page Settings: titles "Participants — Lungitz" / "Resources — Lungitz" /
      "Impressum — Lungitz", a one-line description each, and an Open Graph image.

## Phase 3 · Content pass (fold into the edits you're doing now)

Per CMS item, while it's open anyway:

- [ ] **Meta description** (new field): 120–155 chars, plain prose: what it is, who made
      it / where it comes from, when. Not a repeat of the title. For German-titled
      entries, say what the work is in English.
- [ ] **Alt text** on Image Sets (thumbnails and detail images draw from it): describe
      what's visible, factually ("Black-and-white aerial reconnaissance photograph of
      the Gusen III site, 1945"). Leave alt empty only for purely decorative images. If
      captions already describe the image well, binding alt to the caption field in the
      Designer is a shortcut. Your call per collection.
- [ ] **Long titles**: "Geschichte und Erinnerung * Konzentrationslager Lungitz-Gusen III"
      and its English twin (72–75 chars) are cut off in results. Fine to keep; or
      an optional SEO-title field later.
- [ ] Keep entry text as real text (not text inside images), which the site already does.

## Phase 4 · After you publish: my side (code, export, verification)

- [ ] Re-export (`publish.sh`); confirm the drift warning is gone.
- [ ] Re-run this audit; expected: descriptions + `og:image` on all 49 pages, canonical
      on all, JSON-LD on 45 entries + Home, 1 H1 per page, alt-text count down.
- [ ] Validate the JSON-LD (Schema.org validator / Google Rich Results Test) and the
      share cards (a social-preview debugger).
- [ ] **Google Search Console**: add `lungitz.com` as a *Domain* property, verify with a
      TXT record at Spaceship (I can add it in your Chrome as with the DNS switch), submit
      `https://lungitz.com/sitemap.xml`, request indexing of Home.
- [ ] **Bing Webmaster Tools**: import from Search Console (one click; Bing also feeds
      DuckDuckGo and several AI answer engines).
- [ ] Optional: `lastmod` dates in `sitemap.xml` (helps re-crawl after content edits),
      and an `llms.txt` (a short plain-text site summary for AI tools; cheap, not yet
      a standard everyone reads).

## Phase 5 · Findability beyond the site

Search engines and AI tools mostly find a site through **links from places they already
trust**. For a memorial project those are natural:

- [ ] Each participant links to **their own entry page** (`/giveaways/<slug>`) from
      their website or CV; a deep link is worth more than a link to Home.
- [ ] Partners and funders (Zukunftsfonds, FdR, the memorial associations named in the
      Impressum) link to lungitz.com from their project pages.
- [ ] Memorial and archive directories: Mauthausen Memorial / Gusen memorial resources,
      regional history portals (Upper Austria), relevant university or archive
      bibliographies.
- [ ] Wikipedia / Wikidata: the articles on KZ Gusen / Gusen III and Lungitz could cite
      or link the archive. Wikipedia discourages editing about your own project, so this
      is best done by an independent historian or editor.
- [ ] Press: any article about the project should link to lungitz.com.

## Notes

- **Webflow vs lungitz.com**: per-page titles, descriptions, OG tags, headings, alt text
  and embeds all come from Webflow and are copied by the export. So **all SEO editing
  stays in Webflow**. Only robots.txt, sitemap.xml and the 404 page are export-side.
- Language: the site declares `lang="en"`; many titles and some texts are German. Worth
  marking German text blocks with a `lang="de"` custom attribute later. Low priority.
- Measurements were taken on 2026-10-20; re-run the audit after Phase 3 rather than
  trusting these numbers.

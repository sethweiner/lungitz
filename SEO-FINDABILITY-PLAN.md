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

## Also on the list (added 2026-10-20)

- [ ] **Hideaways back in chronological order.** Live order (2026-10-20) runs pre 1900 →
      2026, then three later additions sit at the end out of sequence: *Aerial Photographs
      Lungitz 1944–45*, *Archaeological Excavations Lungitz* (2018), *Demolition of Lungitz
      Train Station* (2024). New items land at the end, so the list is sorted by manual
      order or creation date, not by date. The year field is display text ("pre 1900",
      "ca. 1970", "1944-1945"), which can't sort. Fix for good: a **Number** field for
      sorting (name it your way, e.g. "Sort year": pre 1900 → 1899, 1944–45 → 1944,
      ca. 1970 → 1970), filled for every Hideaway, and the Hideaways collection list sorted
      by it ascending. The display year stays as written. Then any future item falls into
      place by itself.
- [ ] **Artists' own websites.** The Participants page has 25 name links, all internal (to
      the index); none goes to an artist's site. Needs a **Link** field on the
      contributors collection (your name for it), the URLs (from you, or I research and you
      confirm), and a decision on where the link lives, since the name already links
      to the work: a separate small link beside the name, or on the entry's credits. Bind
      the link and set conditional visibility **on the link only**, never on the element
      holding the name (that's how 19 names vanished before). Bonus for findability: those
      are the same sites we'd ask to link back (Phase 5).

## Progress (2026-10-20, Webflow connector round)

Done and verified on staging: custom code head/footer = repo; page titles + descriptions
(Home + 3 menu pages); Meta description field (46 entries seeded) bound on both templates;
one H1 per page; Hideaways chronological; author empty states hidden; Jürgen off
Participants + Bahnhof authors; artist URLs; cursors (`.title` caveat, MASTHEAD-CONTRACT §17);
↗ arrows built (Seth's condition needs its second rule); hidden participant lists removed
from Impressum + Resources.
Arrow: system-ui 700 1.3rem (Arial has no ↗ glyph → hairline fallback); Festival der Regionen's contributor URL cleared (was https://fdr.at/) so no nameless arrow; 9 arrows live on staging.
Later the same day (all live on lungitz.com): privacy text + media owner, Resources (12 core
links), JSON-LD embeds (45/45 valid, url path doubled → Seth), OG images, global canonical,
text fixes, v94 promoted. **Open items now live in `SESSION-HANDOFF_2026-10-20.md`.**

## Decisions (Seth, 2026-10-20)

- **Artist links:** a small conditional ↗ next to each name in the **Participants list
  only**, opening the artist's site in a new tab; visibility condition on the ↗ link
  itself. Not in the entry credits; Hideaways sources/archives not linked.
- **URLs:** own websites only, no institutional or social links (Seth). Researched list
  below. Jürgen Grünwald comes off the Participants list (external photographer).
- **Field names** (Seth: "you decide"): `Meta description` (PlainText; Giveaways +
  Hideaways), `Sort year` (Number; Hideaways). Artist link: the existing website field if
  the connector confirms it, else `Website` (Link).
- **H1s** (Seth: "whatever you think is best"): one H1 per page, never in the shared
  masthead component (entry pages would get two). Entry pages: the title (as now). Home:
  entry `.title` → H2 (looks the same) + a real Designer H1 "Lungitz — Giveaways &
  Hideaways" with a `visually-hidden` class (off-screen, read by search engines and screen
  readers). Participants / Resources / Impressum: the same hidden H1 with the page name.
- v94 promote: later. Offline copy: works in Safari (Seth tested); `static-site/offline/`
  stays in Dropbox sync as a backup.

## Artist website URLs (researched 2026-10-20 · Seth's rule: own sites only)

**Rule (Seth, 2026-10-20): link the artist's own website only.** No institutional
profiles, no social media. An empty field means no arrow (conditional visibility on the
↗ link). Sources: the FdR 2023 project page, which links most of them, and Seth's March
International essay.

| Participant | Website field | Note |
|---|---|---|
| Anna Weberberger | https://annaweberberger.com/ | new · CV lists Giveaways/Hideaways 2023 |
| Antoine Turillon | https://antoineturillon.net/ | new · has a Giveaways/Hideaways project page |
| Seth Weiner | https://sethweiner.org/ | new |
| Brishty Alam | https://brishtyalam.com/ | already in CMS, live |
| Johanna Tinzl | https://johannatinzl.net/EN | already in CMS, live (root = German version) |
| Maggessi/Morusiewicz | https://www.maggessi-morusiewicz.com/ | already in CMS, live |
| Marc-Alexandre Dumoulin | https://www.marcalexandredumoulin.com/ | already in CMS, live |
| Rosabel Rosalind | https://rosabelrosalind.com/ | already in CMS, live |
| Stephanie Misa | https://stephaniemisa.com/ | in CMS as `www.`; switch to the bare domain the site itself uses |
| Edgar Lessig | *(empty for now)* | in CMS as https://www.edgarlessig.com/, **broken** 2026-10-20 (certificate error + host placeholder); clear it, re-check later or ask him |
| Abdul Sharif Oluwafemi Baruwa · Andreas Haider · Baptiste El Baz · Flo Karl Berger · Judith Pirklbauer · Julia S. Goodman · Wolfgang Schmutz | *(empty)* | no own website (only institutional/social pages, which the rule excludes) |

- Spelling confirmed (Seth): **Pirklbauer** is correct; FdR's "Pirkelbauer" is their typo.

## Jürgen Grünwald is not a participant (Seth, 2026-10-20)

He's an external photographer, so he shouldn't be in the Participants list (and gets no
website arrow). Why he's there: he's set as the **author** (sole contributor) of two
Giveaways, *Lungitz Bahnhof \*Exterior* and *Lungitz Bahnhof \*Waiting Room*.
Everywhere else he's credited correctly, in the image credits ("Photo © Jürgen Grünwald").

- [ ] Check how the Participants list filters (it shows 18 of the 37 contributors) once
      the connector can see the CMS.
- [ ] Fix at the source: remove him as author of those two entries and leave **no
      author**, since they're documentation (Seth). The photo credits stay. Then check the
      list: 17 names. If the list filters on a contributor flag instead, switch his off
      too.
- [ ] **Before removing him:** no entry has ever had zero authors (checked: all 45 have
      one), so the author list's **Empty State** has never shown. Webflow's default is a
      grey box reading "No items found." (`.w-dyn-empty`: #ddd, 10px padding), which would
      appear in those two headers. In the Designer, select the author Collection List →
      Empty State and hide it (display: none on its class), on Home and on both entry
      templates. Then the two documentation entries simply show no author line.

## Impressum & Resources review (staging, 2026-10-20)

### Impressum: fix before it's final (the current text is live on lungitz.com)

1. **Template placeholders are published.** The Privacy Notice still shows six bracketed
   drafting instructions ("[Confirm the applicable hosting arrangements…]", "[If a contact
   form is used…]", "[Identify the third-party services…]", "[Document the cookies…]",
   "[Identify the relevant providers…]") and "contact: **[Email address]**" in §7.
2. **It names the wrong host.** §2 says "hosted using Webflow"; lungitz.com is served by
   **Netlify** (since 2026-10-16). Webflow only hosts the staging copy.
3. **Missing spaces after full stops** all through the privacy text: "data.The",
   "enquiry.The", "content.When", "loaded.[", "functions.The", "obtained.[",
   "services.[", "processing.Where", "withdrawal.To", "address].You". Likely line breaks
   in the rich text with the space lost. Retype the space at each.
4. **Media owner is "Lungitz.com".** A domain isn't a person or organisation. Austrian
   rules for a site's legal notice (Offenlegung, §25 MedienG) expect the media owner's
   **name** and place: Seth and/or Antoine, or an association if one exists.
   *(Not legal advice; check with whoever advises the project.)*
5. Polish: the links to "Festival der Regionen" (here and on Resources) and the Webflow
   privacy URL include a leading space inside the underline, so move the space outside
   the link. Paragraphs start with invisible zero-width characters (Webflow line-break
   residue); harmless, clean up if you're in there anyway.

**Proposed replacement for Privacy Notice §2–§7** (facts checked on lungitz.com
2026-10-20: no cookies set by any page; no analytics; no third-party embeds, fonts or
scripts, since everything is served from lungitz.com; no contact form; browser storage
only the `lz-…` session keys below):

> **2. Hosting and server logs.** lungitz.com is hosted by Netlify, Inc., San Francisco,
> USA. When you visit, Netlify's servers process the technical data needed to deliver
> the site and keep it secure: your IP address, date and time, the page requested, and
> browser and device information. Netlify processes this data on our behalf, as a
> processor, under its Data Processing Agreement (netlify.com/pdf/netlify-dpa.pdf).
> Because Netlify is a US company, the data may be processed in the United States.
> Netlify is certified under the EU–U.S. Data Privacy Framework, which the European
> Commission recognises as providing an adequate level of protection. The EU Standard
> Contractual Clauses in its agreement apply as a fallback. Netlify's own privacy policy:
> netlify.com/privacy.
>
> **3. Contact.** If you email info@lungitz.com, we use your message and address only
> to answer you, and delete them when they're no longer needed. There is no contact
> form.
>
> **4. External content.** All images, fonts and scripts are served from lungitz.com
> itself; nothing is loaded from third parties. Links to other websites (participants,
> partners) are ordinary links: when you follow one, that site's own privacy practices
> apply.
>
> **5. Cookies and browser storage.** lungitz.com sets no cookies and uses no
> analytics or tracking. To remember display state while you browse (whether the
> introduction was already shown, the page-transition setting, the order of entries for
> the previous/next arrows), it stores a few small values in your browser's session
> storage. They never leave your browser, are not sent to any server, and are deleted
> when you close the tab.
>
> **6. Recipients.** Apart from the hosting provider (§2), no personal data is passed to
> anyone.
>
> **7. Your rights.** … To exercise your rights, contact **info@lungitz.com**. …
> *(keep the existing text, with the email filled in)*

**§2 verified 2026-10-20 against Netlify's own documents:**
- **DPA** (last updated 9 June 2026) "forms part of the Enterprise Master Subscription
  Agreement and the Self-Serve Subscription Agreement", so it covers this account
  automatically; nothing to sign. Netlify is the processor; the site owner is the
  controller. Its data subjects explicitly include "Customers' own website visitors, where
  the website is hosted by Netlify", and its data categories include IP address.
- **Transfers:** the DPA's primary basis is the EU–U.S. DPF (+ UK Extension). If that ever
  fails, the EU SCCs (Decision 2021/914, Module Two, controller→processor) apply.
- **DPF list** (dataprivacyframework.gov, checked live): Netlify, Inc., San Francisco, CA:
  EU–U.S. DPF **Active**, Swiss–U.S. DPF **Active**, UK Extension **Active** (non-HR data).
- **Not stated anywhere:** a retention period for visitor logs. Neither the DPA nor the
  privacy policy gives one ("consistent with the original purpose"), so the draft
  doesn't claim one. Ask privacy@netlify.com if the text should name a period.
- Netlify gives two different San Francisco street addresses (privacy policy: 101 2nd
  Street, CA 94105; DPA: 512 2nd Street, Suite 200, CA 94107), so the draft names the
  city only.
- Sub-processor list: netlify.com/legal/subprocessors/.

Keep §5 true: re-check it whenever analytics, an embed or a form is added.

### Resources: still a placeholder

The page is an older copy of the Impressum text. "DISCLAIMER ABOUT CONTENT" repeats the
Support paragraph, and under "LINKS" sit the Purpose / Copyright / External Links
paragraphs from the legal notice. There are no resources, and the duplicated legal text
would compete with the Impressum in search. Proposal: replace it with an actual
resource list, e.g.

- **The project:** Festival der Regionen 2023 project page
  (fdr.at/en/project/giveaways-hideaways/); Seth's essay in March
  (march.international/giveaways-hideaways/).
- **History of Gusen III / Lungitz:** KZ-Gedenkstätte Mauthausen / Gusen memorial;
  Bewusstseinsregion Mauthausen–Gusen–St. Georgen (bewusstseinsregion.at/lungitz/, text
  by Judith Pirklbauer); Heimatverein Katsdorf.
- **Archives and sources credited in Hideaways:** Archiv Walzer, Luftbilddatenbank
  Dr. Carls, nextroom.at, and the papers listed in the entries.

**Researched list: `RESOURCES-LINKS.md`** (2026-10-20, 53 links, all verified loading;
suggested core marked ★; notes on conflicting dates and figures, sensitive content and
links likely to move). Seth decides the sections and wording. Also give it a fuller page title ("Resources — Lungitz",
already in Phase 2).

### Both pages

- [ ] Delete the **hidden old participants list** (`.content-participants.hide`) on
      Impressum and Resources. It's invisible but still in the HTML (duplicate names and
      links for search engines), and its website links now live in the CMS field the new
      ↗ uses. Leftover from duplicating the page.

## Who does what

Precondition: the Webflow connector is still signed into the *Palais des Beaux Arts*
workspace (checked 2026-10-20) and can't see Lungitz. Re-authorise it for the Lungitz
workspace first; until then everything below is yours by hand.

| Task | Who |
|---|---|
| Paste head/footer custom code | Claude (connector), or you |
| Page titles + descriptions: static pages, template SEO bindings | Claude |
| Create fields (meta description, sort year, artist website) | Claude, with **your field names** |
| Fill field values (descriptions, alt text, sort years, URLs) | Claude drafts, you approve the wording |
| Heading levels (Home `.title` → H2, H1 on menu pages) | Claude (Designer open), after you choose Home's H1 |
| JSON-LD embeds on the templates | Claude builds; you may need to click the CMS fields in via + Add Field |
| Hideaways collection-list sort | Claude (connector's beta collection-list settings), or you in the Designer |
| Artist-link element + binding + visibility | Claude, or you; placement is your design call |
| Open Graph image binding on templates / pages | **You** (not in the API) |
| Site Settings → SEO: global canonical, subdomain indexing | **You** (dashboard only) |
| Webflow publish → `publish.sh` → `offline.sh` → re-audit | Claude |
| Search Console: DNS TXT at Spaceship, sitemap, Bing import | Claude (your Chrome, you're signed in to Google) |

## Notes

- **Webflow vs lungitz.com**: per-page titles, descriptions, OG tags, headings, alt text
  and embeds all come from Webflow and are copied by the export. So **all SEO editing
  stays in Webflow**. Only robots.txt, sitemap.xml and the 404 page are export-side.
- Language: the site declares `lang="en"`; many titles and some texts are German. Worth
  marking German text blocks with a `lang="de"` custom attribute later. Low priority.
- Measurements were taken on 2026-10-20; re-run the audit after Phase 3 rather than
  trusting these numbers.

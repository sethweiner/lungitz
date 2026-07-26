# Lungitz — Findability go-live bundle

The **core of C (findability) is done**: every entry is reachable at a persistent URL
(`/giveaways/<slug>`, `/hideaways/<slug>`), per-entry **SEO is live + verified** (Title→Name,
Meta→Subtitle, OG mirrored), and the **wayfinding** is complete (home-return highlight, soft
page transition, prev/next across both collections).

Everything below is **prepped but dormant** — it only takes effect once the site is on a
**custom domain**. On the `*.webflow.io` staging domain Webflow forces `robots.txt: Disallow:/`
+ `noindex`, so nothing here can be indexed until then (decision 2026-06-11: staging for now).

**AI-crawler policy (Seth, 2026-06-11): allow retrieval, block training.** The memorial material
stays **findable + answerable** (search engines + AI retrieval/answer bots that fetch a page to
cite it live) but is **not ingested into model-training corpora** — a deliberate line given the
type of site this is.

---

## Go-live checklist (the day a domain connects)

1. **Connect the custom domain** (Webflow → Site Settings → Publishing) + point DNS.
2. **Enable indexing** — Site Settings → SEO → *Webflow subdomain indexing* / domain indexing **On**.
   Keep *Allow Search Engine Crawlers* + *Allow AI Bots* **On** — the granular *training* block is done
   in the robots.txt below; leaving the toggle On stops Webflow from blanket-blocking the *retrieval*
   bots too.
3. **Turn the sitemap on** — Site Settings → SEO → *Auto-generate sitemap* **On** (it's currently Off,
   which is why `/sitemap.xml` 404s).
4. **Paste the robots.txt** (below) into Site Settings → SEO → robots.txt box.
5. **Add the JSON-LD embeds** (below) to the Giveaways + Hideaways templates.
6. **Publish.**
7. **Verify** (curls below) + submit the sitemap in Google Search Console (add the *Google site
   verification ID* in Site Settings → SEO first).

---

## robots.txt  (allow search + AI retrieval · block AI *training* · de-index scratch)

Paste into the robots.txt box, with the *Allow AI Bots* toggle left **On** (so Webflow doesn't
blanket-block the retrieval bots — the granular training-block lives here). The public archive is at
`/giveaways/*` + `/hideaways/*`; `/archive/*` is **dev junk** (old-home, home-copy, v1s, v2s,
interactions-test, style-guide…), not the real archive — hence disallowed.

```
# Training / bulk-ingest crawlers — blocked (not ingested into model training)
User-agent: GPTBot
User-agent: CCBot
User-agent: Google-Extended
User-agent: anthropic-ai
User-agent: ClaudeBot
User-agent: Applebot-Extended
User-agent: Meta-ExternalAgent
User-agent: FacebookBot
User-agent: Bytespider
User-agent: Amazonbot
User-agent: Diffbot
User-agent: Omgilibot
User-agent: cohere-ai
User-agent: PetalBot
Disallow: /

# Everyone else — search (Googlebot, Bingbot) + AI retrieval/answer bots (OAI-SearchBot,
# ChatGPT-User, PerplexityBot, Perplexity-User, Claude-Web, Claude-User…): allowed, minus dev scratch
User-agent: *
Disallow: /sandbox
Disallow: /v1
Disallow: /home-2026-06-07-drawers-script-stable
Disallow: /archive/
```

Webflow auto-appends the `Sitemap:` line. Belt-and-suspenders: set the scratch pages to **Draft** too
so they drop from the sitemap (`/sandbox` is dev-used → leave it published, just robots-disallowed).

**Reality check:** robots.txt is a *request* — reputable crawlers honor it, but it isn't a wall, and
the retrieval-vs-training split shifts as vendors rename/split user-agents (GPTBot vs OAI-SearchBot,
ClaudeBot vs Claude-Web, etc.). Re-check the UA lists against each bot's published docs at go-live and
periodically after.

*(Naming nit to revisit: `/archive/` is dev scratch while the actual archive is `/giveaways` +
`/hideaways` — worth renaming/cleaning the `/archive/` folder so it's not confusing.)*

---

## JSON-LD  (schema.org — per-template HTML Embed)

Add an **HTML Embed** inside each template (Designer → add Embed). Insert each `«Field»` below via
the embed's **+ Add Field** button (it writes the `{{wf …}}` token that resolves server-side — the
same mechanism the SEO title already uses). Replace `YOURDOMAIN`.

**Hideaways template** — historical archival documents:
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "ArchiveComponent",
  "name": "«Name»",
  "description": "«Subtitle (EN)»",
  "dateCreated": "«Year (display)»",
  "url": "https://YOURDOMAIN/hideaways/«Slug»",
  "holdingArchive": "«Credit (legacy)»",
  "contentLocation": { "@type": "Place", "name": "Lungitz · Gusen III · Mauthausen-Gusen, Upper Austria" },
  "isPartOf": { "@type": "Collection", "name": "Lungitz — Hideaways", "url": "https://YOURDOMAIN/" }
}
</script>
```

**Giveaways template** — contemporary artworks:
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "VisualArtwork",
  "name": "«Name»",
  "description": "«Description»",
  "dateCreated": "«Year (display)»",
  "artMedium": "«Material/Format»",
  "artEdition": "«Edition»",
  "url": "https://YOURDOMAIN/giveaways/«Slug»",
  "isPartOf": { "@type": "Collection", "name": "Lungitz — Giveaways", "url": "https://YOURDOMAIN/" }
}
</script>
```

**Enrichment (later):** `creator` / `author` / `holdingArchive` as real entities (the Contributor
references — authors, photographers, institutions, publishers) would make these much richer for AI,
but multi-reference fields can't drop into a flat embed — they'd need a nested Collection List inside
the embed (or a build-time generator). Worth doing once the content + images are final (backlog D).

---

## Verify after go-live (curl — works even pre-index)

```
# title + meta resolve per entry
curl -s https://YOURDOMAIN/hideaways/bahnhofschronik-lungitz-1935-1963 | grep -iE '<title>|name="description"'
# JSON-LD present + resolved (no raw {{wf}} tokens)
curl -s https://YOURDOMAIN/hideaways/bahnhofschronik-lungitz-1935-1963 | grep -A20 'application/ld.json'
# robots: training UAs disallowed, search/retrieval not
curl -s https://YOURDOMAIN/robots.txt
# sitemap
curl -s https://YOURDOMAIN/sitemap.xml | grep -c '<loc>'
# scratch pages disallowed / drafted
for u in /sandbox /v1 /archive/old-home; do curl -s -o /dev/null -w "%{http_code} $u\n" https://YOURDOMAIN$u; done
```

---

_Prepared 2026-06-11 (Seth + Claude). Core C done; this bundle flips on at domain-connect._
_AI policy revised same day: retrieval allowed, training blocked._

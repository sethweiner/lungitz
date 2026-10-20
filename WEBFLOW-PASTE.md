# Paste into Webflow (2026-10-20)

Things the connector can't do safely, ready to paste. Each block says where it goes.

---

## 1 · Impressum → Privacy Notice (replace the text under each bold heading)

Keep your bold section headings. The text below replaces the paragraph under each one.
It removes all the bracketed drafting notes and the "[Email address]" placeholder, puts
back the missing spaces after full stops, and names the real host (Netlify). Facts were
checked on lungitz.com and against Netlify's DPA and the DPF list on 2026-10-20 (see
SEO-FINDABILITY-PLAN.md). Not legal advice.

**1. Data Controller**
The controller responsible for personal-data processing in connection with this website is Seth Weiner & Antoine Turillon, Vienna, Austria. Contact: info@lungitz.com

**2. Website Hosting and Technical Data**
lungitz.com is hosted by Netlify, Inc., San Francisco, USA. When you visit, Netlify's servers process the technical data needed to deliver the site and keep it secure: your IP address, the date and time, the page requested, and browser and device information. Netlify processes this data on our behalf, as a processor, under its Data Processing Agreement (https://www.netlify.com/pdf/netlify-dpa.pdf). Because Netlify is a US company, the data may be processed in the United States. Netlify is certified under the EU–U.S. Data Privacy Framework, which the European Commission recognises as providing an adequate level of protection; the EU Standard Contractual Clauses in its agreement apply as a fallback. Netlify's privacy policy: https://www.netlify.com/privacy/

**3. Contact**
If you email info@lungitz.com, we use your message and address only to answer you, and delete them when they are no longer needed. There is no contact form on this website.

**4. Embedded Content and External Resources**
All images, fonts and scripts are served from lungitz.com itself; nothing is loaded from third parties. Links to other websites (participants, partners, archives) are ordinary links: when you follow one, that website's own privacy practices apply.

**5. Cookies and Similar Technologies**
This website sets no cookies and uses no analytics or tracking. To remember display state while you browse (whether the introduction was already shown, the page-transition setting, and the order of entries for the previous/next arrows), it stores a few small values in your browser's session storage. They never leave your browser, are not sent to any server, and are deleted when you close the tab.

**6. Recipients and International Transfers**
Apart from the hosting provider described in section 2, no personal data is passed to anyone.

**7. Your Data Protection Rights**
Subject to the conditions set out in applicable data-protection law, you may have the right to request access to, rectification or erasure of your personal data, restriction of processing, data portability, or to object to certain processing. Where processing is based on consent, you may withdraw that consent at any time. Withdrawal does not affect the lawfulness of processing carried out before withdrawal. To exercise your rights, contact info@lungitz.com. You also have the right to lodge a complaint with the Austrian Data Protection Authority (Datenschutzbehörde): https://www.dsb.gv.at/

**8. Updates** *(unchanged)*

Also in the Impressum:
- **Legal Notice → Media Owner and Contact**: replace "Lungitz.com" with "Seth Weiner &
  Antoine Turillon" (Seth, 2026-10-20: both names + Vienna for now; a Verein later would
  give more distance). Same name in Privacy §1.
- The "Festival der Regionen" link in the Support paragraph starts with an underlined
  space: move the space out of the link.

---

## 2 · Resources page (replace the copied legal text)

Suggested structure: a short intro line, then three groups. Use your existing link styles.
The 12 links are the agreed core set from RESOURCES-LINKS.md.

**The project**
- Festival der Regionen 2023 — Giveaways/Hideaways: https://fdr.at/en/project/giveaways-hideaways/ (de: https://fdr.at/project/giveaways-hideaways/)
- MARCH — Giveaways / Hideaways: https://march.international/giveaways-hideaways/

**Lungitz and Gusen III**
- Bewusstseinsregion Mauthausen–Gusen–St. Georgen — Lungitz: https://www.bewusstseinsregion.at/lungitz/
- Judith Pirklbauer — Geschichte und Erinnerung: Konzentrationslager Lungitz-Gusen III (PDF): https://www.bewusstseinsregion.at/wp-content/uploads/2024/12/Text-Gusen-III_Druckversion-Festival-der-Regionen.pdf
- Walking tour Lungitz (PDF map): https://www.bewusstseinsregion.at/wp-content/uploads/2024/12/Faltplan.pdf
- Mauthausen Memorial — The subcamps (select Gusen III on the map): https://www.mauthausen-memorial.org/en/History/The-Subcamps (de: https://www.mauthausen-memorial.org/de/Wissen/Die-Aussenlager)
- Liberation, Objects! — Model of the Gusen III subcamp: https://liberationobjects.mauthausen-memorial.org/liberation-objects/heimathaus
- Federal Ministry of the Interior — Memorial and information site Lungitz (2021): https://www.bmi.gv.at/magazin/2021_07_08/gedenk_und_informationsort.html

**Gusen and the Mauthausen camp system**
- Mauthausen Memorial — The Gusen branch camp: https://www.mauthausen-memorial.org/en/History/The-Mauthausen-Concentration-Camp-19381945/The-Gusen-Branch-Camp
- KZ-Gedenkstätte Gusen — Memorial Gusen: https://www.gusen-memorial.org/en/Visit/The-Memorial-Gusen
- USHMM Holocaust Encyclopedia — Gusen: https://encyclopedia.ushmm.org/content/en/article/gusen
- Mauthausen Memorial — Things Tell Stories: archaeology of the Mauthausen-Gusen camp system: https://www.mauthausen-memorial.org/en/Visit/Exhibitions-and-Room-of-Names/Things-Tell-Stories-Archaeology-of-the-Mauthausen-Gusen-Concentration-Camp-System

Consider a one-line content note at the top: several linked pages describe human remains.

---

## 3 · Structured data (JSON-LD) on the two templates

Webflow only resolves CMS fields in an embed when they're inserted with **+ Add Field**
(fields typed or set through the API publish as raw text, which was tested and removed).
So: on each template, add an **HTML Embed** at the end of the body, paste the code below,
and replace each `«Field»` by placing the cursor there → **+ Add Field** → that field.

**Giveaways Template**
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "VisualArtwork",
  "name": "«Name»",
  "description": "«Meta description»",
  "dateCreated": "«Year (display)»",
  "artMedium": "«Material/Format»",
  "artEdition": "«Edition»",
  "url": "https://lungitz.com/giveaways/«Slug»",
  "isPartOf": { "@type": "Collection", "name": "Lungitz — Giveaways", "url": "https://lungitz.com/" }
}
</script>
```

**Hideaways Template**
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "ArchiveComponent",
  "name": "«Name»",
  "description": "«Meta description»",
  "dateCreated": "«Year (display)»",
  "url": "https://lungitz.com/hideaways/«Slug»",
  "contentLocation": { "@type": "Place", "name": "Lungitz · Gusen III · Mauthausen-Gusen, Upper Austria" },
  "isPartOf": { "@type": "Collection", "name": "Lungitz — Hideaways", "url": "https://lungitz.com/" }
}
</script>
```

Claude checks after the next publish that every entry page carries valid JSON-LD.

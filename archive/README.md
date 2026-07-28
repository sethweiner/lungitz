# Lungitz — archive index

Everything superseded lives here. **Text and code are tracked in git**; heavy
folders (marked LOCAL) live only on this machine + Dropbox — git deliberately
ignores them (see `.gitignore`).

| folder | what | tracked |
|---|---|---|
| `handoffs/` | session handoffs (07-26, 07-26-NIGHT, 07-27), designer handoffs (07-24, 07-25), the 07-26 session prompt. The LIVE handoff always sits at repo root. | git ✓ |
| `sandbox/` | sandbox builds v27–v84 (v85+ live in `/sandbox` at root; one behavior per build, git log tells the story) | git ✓ |
| `studies/` | proof/study pages: `gesture-catalog.html`, `lungitz-state-model-studies_accordion-choreography.html`, `lungitz-add-images-guide.html` (⚠ pre-dates T-15 — new CMS images now upload via the Designer/CMS UI ONLY; treat the guide as historical until refreshed) | git ✓ |
| `sessions/` | raw session folders June 08–12 + the 06-07 chat handoff & zip | LOCAL |
| `site-snapshots/` | `Lungitz.com` (old site), `Lungitz.com_FEB`, `lungitz-site-sucked_2026-06-10` (static-export experiment), `lungitz.webflow.io_SCRAPE-TEST_2026-06-04`, `lungitz-import` (May import tooling/data) | LOCAL |
| `reference/` | `Claude Docs` (April doc snapshots) | LOCAL |
| `CHANGELOG.md`, `lungitz-interactions_2026-06-07_v3.js` | pre-sandbox-era changelog + script snapshot | git ✓ |

House rules:
- The repo root carries ONLY living material: `CLAUDE.md`, `MASTHEAD-CONTRACT.md`,
  `FINDABILITY-GO-LIVE.md`, the current `SESSION-HANDOFF_*.md`, the production
  script, `sandbox/` (live builds), `assets/`.
- When a handoff is superseded, move it to `handoffs/`; when a sandbox build falls
  more than one arc behind production, move it to `sandbox/`.
- Note (2026-07-28): `lungitz-site-sucked_2026-06-10` was untracked from git in the
  archive sweep (117 scrape files removed from the repo tip; history retains them).

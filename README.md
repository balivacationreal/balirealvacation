# Bali Real Vacation

> Premium, hassle-free travel itineraries across **Bali & Nusa Penida** for international and domestic visitors.

🌐 **Live site:** [balirealvacation.com](https://balirealvacation.com)

A fast static site built with **Eleventy (11ty)** — shared layout, multilingual, and zero duplication. Edit the nav once, every page and every language updates.

---

## Languages

The site serves three languages from a single build, with no changes to existing English URLs:

| Language | URL prefix | Status |
|---|---|---|
| English | `/` (root) | Complete |
| Bahasa Indonesia | `/id/` | Complete |
| 中文 (Mandarin) | `/zh/` | Homepage complete; tour pages translated |

A language switcher (`EN | ID | 中文`) appears in the nav. `hreflang` alternate tags are wired automatically via the `i18n` collection in `.eleventy.js`.

---

## Project structure

```
balirealvacation/
├── .eleventy.js              # Build config — passthrough copies + i18n collections
├── package.json              # Eleventy dependency + scripts
├── netlify.toml              # Build command + redirects + headers
├── robots.txt  sitemap.xml   # SEO (passed through to output)
│
├── _data/
│   ├── site.js               # Nav links, footer links, contact info
│   ├── languages.js          # The 3 languages: en / id / zh
│   └── ui.json               # UI string dictionary (nav, buttons, footer) in all 3 languages
│
├── _includes/
│   ├── layouts/base.njk      # Page shell: <head>, hreflang, nav, content, footer, scripts
│   └── partials/
│       ├── nav.njk           # Shared navigation
│       ├── lang-switcher.njk # EN | ID | 中文 pill switcher
│       └── footer.njk        # Footer + floating buttons + mobile book bar
│
├── pages/                    # English templates (default language)
│   ├── pages.11tydata.js     # Sets lang=en and auto-generates transKey per page
│   ├── index.njk
│   ├── west-nusa-penida.njk
│   ├── east-nusa-penida.njk
│   ├── nusa-penida-snorkeling.njk
│   ├── uluwatu-full-day-tour.njk
│   ├── mount-batur-sunrise-trek.njk
│   ├── sekumpul-waterfall-tour.njk
│   ├── canyoning-north-bali-tour.njk
│   ├── private-driver-tours.njk
│   ├── airport-transfers.njk
│   ├── local-partners.njk
│   ├── nusa-penida-guide.njk
│   ├── bali-destinations-guide.njk
│   ├── privacy.njk  term.njk  404.njk
│   ├── id/                   # Indonesian translations (mirrors English structure)
│   │   ├── id.11tydata.json  # Sets lang=id for all files in this folder
│   │   └── *.njk
│   └── zh/                   # Mandarin translations
│       ├── zh.11tydata.json  # Sets lang=zh for all files in this folder
│       └── *.njk
│
├── css/styles.css            # Global stylesheet — design tokens + lang-switcher styles
├── js/main.js                # Menu, live currency converter, FAQ accordion, reveal, scroll-top
└── src/assets/               # Images (.webp / .jpg) — passed through untouched
```

---

## Develop & build

Requires Node.js 18+.

```bash
npm install        # one time — installs Eleventy
npm start          # dev server with live reload → http://localhost:8080
npm run build      # production build → _site/
```

`_site/` is regenerated on every build and is git-ignored. Never edit it directly.

---

## Deploy (GitHub → Netlify)

Netlify builds the site. `netlify.toml` already sets:

```toml
[build]
  command = "npm run build"
  publish = "_site"
```

Workflow:
1. Commit and push to GitHub.
2. Netlify runs `npm install && npm run build` and publishes `_site/`.

DNS/SSL: apex `balirealvacation.com` is canonical (non-www), www 301s to it, `Full (strict)` SSL in Cloudflare.

---

## Common edits

### Add or change a nav / footer link
Edit **`_data/site.js`** — the `nav` and `footerLinks` arrays drive every page in every language. Also add the translated label to **`_data/ui.json`**.

### Add a new tour page
1. Create `pages/my-new-tour.njk` from an existing template.
2. Update front matter: `permalink`, `title`, `description`, `canonical`, `ogImage`, `transKey`, and `jsonld`.
3. Duplicate into `pages/id/my-new-tour.njk` and `pages/zh/my-new-tour.njk` and translate.
4. Add a `<url>` to `sitemap.xml`, a card on `index.njk`, and an `<option>` in the booking form.
5. Resubmit the sitemap in Google Search Console.

### Translate a page into a new language
1. Copy the English file into `pages/id/` or `pages/zh/` keeping the **same filename** — that's how hreflang linking works.
2. Set `permalink` and `canonical` to the `/id/` or `/zh/` URL.
3. Translate visible text; pull shared UI strings from the `ui` dictionary, e.g. `{{ ui.book_now[lang] }}`.
4. The switcher and hreflang tags update automatically.

### Change a price
Edit the `data-usd="…"` attribute on the `.idr-price` span in the tour template. The live currency converter in `main.js` recomputes IDR/AUD automatically using cached exchange rates.

### Restyle the whole site
Design tokens at the top of `css/styles.css`:

```css
--primary-color: #00557F;   /* ocean blue  */
--secondary-color: #FF6B4A; /* coral CTA   */
--aqua: #13B5A6;            /* fresh accent */
--bg-light: #FBF8F3;        /* warm sand   */
--font-heading: 'Plus Jakarta Sans';
--font-body: 'Inter';
```

---

## SEO conventions — keep these intact

- Canonical form: `https://balirealvacation.com/<page>.html` (non-www, `.html`). Indonesian: `/id/<page>.html`. Mandarin: `/zh/<page>.html`.
- Each page's `canonical` front matter and `_data/site.js` must stay non-www.
- `hreflang` alternate tags are generated automatically for every page that has a `transKey`.
- Legal pages (`privacy`, `term`) and `404` carry `noindex` and are excluded from `sitemap.xml`.
- Keep Netlify "Pretty URLs" **off** so `.html` URLs don't redirect.
- Do **not** add browser-language auto-redirects — they hide pages from crawlers. `hreflang` + the language switcher is the correct strategy.

---

## Contact

- **WhatsApp / Telegram:** +62 823-1779-4462
- **Instagram:** [@balirealvacation](https://instagram.com/balirealvacation)

---

<sub>© 2026 Bali Real Vacation. All Rights Reserved.</sub>

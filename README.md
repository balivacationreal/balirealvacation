# Bali Real Vacation

> Premium, hassle-free travel itineraries across **Bali & Nusa Penida** for both international and domestic visitors.

🌐 **Live site:** [balirealvacation.com](https://balirealvacation.com)

A fast static site, now built with **Eleventy (11ty)** so the nav, footer, `<head>`, and design system live in **one place** each — edit once, every page updates.

---

## What changed in v2

- **Shared layout** — nav, footer, floating buttons, and `<head>` are now partials. No more editing 16 files to change one link.
- **External CSS/JS** — all styling in `css/styles.css`, all behavior in `js/main.js`, cached across the whole site.
- **Modernized design** — refreshed ocean-blue + coral palette with a new aqua accent and warm sand background; headings in **Plus Jakarta Sans**; blurred sticky nav; trust bar; image-led cards; and a mobile "Book on WhatsApp" bar.
- **Same content & SEO** — every tour, price, review, guide, JSON-LD block, canonical, and `robots` rule is preserved. URLs stay `…/<page>.html`.

---

## Project structure

```
balirealvacation/
├── .eleventy.js            # Build config (passthrough, output paths)
├── package.json            # Eleventy dependency + scripts
├── netlify.toml            # Build command + redirects + headers
├── robots.txt  sitemap.xml # SEO (passed through to output)
│
├── _data/
│   └── site.js             # Nav links, footer links, contact info (EDIT HERE)
│
├── _includes/
│   ├── layouts/base.njk    # The page shell: <head>, nav, content, footer, scripts
│   └── partials/
│       ├── nav.njk         # Shared navigation
│       └── footer.njk      # Shared footer + floating buttons + mobile book bar
│
├── pages/                  # One template per page (content + front matter)
│   ├── index.njk
│   ├── west-nusa-penida.njk
│   ├── … (all tours, guides, legal)
│   └── 404.njk
│
├── css/styles.css          # Global stylesheet (design system)
├── js/main.js              # Menu, currency converter, reveal, booking, scroll-top
│
└── src/assets/             # YOUR IMAGES go here (see note below)
```

> ⚠️ **Add your images:** copy your existing `src/assets/` folder (all the `.webp`/`.jpg` tour photos) into this project, replacing the placeholder. The build passes `src/` straight through to the output untouched.

---

## Develop & build

Requires Node.js 18+.

```bash
npm install        # one time — installs Eleventy
npm start          # local dev server with live reload at http://localhost:8080
npm run build      # production build → outputs to /_site
```

The build writes finished HTML to `_site/`. Don't edit `_site` directly — it's regenerated every build (and git-ignored).

---

## Deploy (GitHub → Netlify)

Netlify now **builds** the site instead of serving raw files. `netlify.toml` already sets:

```toml
[build]
  command = "npm run build"
  publish = "_site"
```

So the workflow is unchanged for you:

1. Commit and push to GitHub.
2. Netlify runs `npm install && npm run build` and publishes `_site`.

DNS/redirects are unchanged: apex `balirealvacation.com` (non-www) is canonical, www 301s to it, `Full (strict)` SSL in Cloudflare.

---

## Common edits

### Add or change a nav / footer link
Edit **`_data/site.js`** only. The `nav` and `footerLinks` arrays drive every page.

### Add a new tour page
1. Copy an existing template, e.g. `pages/uluwatu-full-day-tour.njk` → `pages/my-new-tour.njk`.
2. Update the front matter (between the `---` lines): `permalink`, `title`, `description`, `canonical`, `ogImage`, and the `jsonld` block.
3. Replace the content inside `{% block content %}`.
4. Add a `<url>` entry to `sitemap.xml`, and (if it's a package) a card on `index.njk` + an `<option>` in the booking form.
5. Resubmit the sitemap in Google Search Console.

### Change a price
Edit the `data-usd="…"` attribute on the relevant `.idr-price` span in that tour's template. The converter recomputes IDR/AUD automatically.

### Restyle the whole site
Everything visual lives in `css/styles.css`. The design tokens are at the top:

```css
--primary-color:#00557F;   /* ocean blue  */
--secondary-color:#FF6B4A; /* coral CTA   */
--aqua:#13B5A6;            /* fresh accent */
--bg-light:#FBF8F3;        /* warm sand   */
--font-heading:'Plus Jakarta Sans';
--font-body:'Inter';
```

---

## SEO conventions (unchanged — keep these intact)

- One canonical form per page: `https://balirealvacation.com/<page>.html` (non-www, `.html`).
- `_data/site.js` + each page's `canonical` front matter must stay non-www.
- Legal pages (`privacy`, `term`) and `404` carry `noindex` and are kept out of `sitemap.xml`.
- Keep Netlify "Pretty URLs" **off** so `.html` URLs don't redirect.

---

## Contact

- **WhatsApp / Telegram:** +62 823-1779-4462
- **Instagram:** [@balirealvacation](https://instagram.com/balirealvacation)

---

<sub>© 2026 Bali Real Vacation. All Rights Reserved.</sub>

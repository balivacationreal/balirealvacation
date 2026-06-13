# Bali Real Vacation

> Premium, hassle-free travel itineraries across **Bali & Nusa Penida** for both international and domestic visitors.

🌐 **Live site:** [balirealvacation.com](https://balirealvacation.com)

A fast, static marketing website for a Bali-based tour operator. Visitors browse tour packages, read travel guides, discover trusted local partners, and book instantly via WhatsApp.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Pages](#pages)
- [Key Features](#key-features)
- [SEO & URL Conventions](#seo--url-conventions) ⚠️ *read before editing links*
- [Deployment](#deployment)
- [DNS Configuration](#dns-configuration)
- [Local Development](#local-development)
- [Maintenance Guide](#maintenance-guide)
- [Contact](#contact)

---

## Tech Stack

Built deliberately on **pure web standards** — no frameworks, no build step, no bundler. This keeps the site extremely fast, cheap to host, and simple to maintain.

| Layer | Choice |
|-------|--------|
| Markup | Hand-authored **HTML5** |
| Styling | **Vanilla CSS** — Flexbox, Grid, custom properties (CSS variables), embedded in each page's `<head>` |
| Scripting | **Vanilla JavaScript** — no jQuery, React, or Vue |
| Fonts | Google Fonts — Montserrat (headings) + Open Sans (body) |
| Icons | Font Awesome 6.4 |
| Analytics | Google Analytics 4 (`gtag.js`) |
| Live chat | Botpress Webchat |
| Hosting | **Netlify** (Git-based auto-deploy) |
| DNS / CDN | **Cloudflare** (proxied) |

### Design Tokens

Defined as CSS variables in every page's `:root`:

```css
--primary-color:   #005B96;  /* deep ocean blue  */
--secondary-color: #FF7F50;  /* coral / sunset   */
--text-dark:       #2C3E50;
--bg-light:        #F8F9FA;
--font-heading: 'Montserrat', sans-serif;
--font-body:    'Open Sans', sans-serif;
```

---

## Project Structure

```
balirealvacation/
├── index.html                      # Homepage (packages, about, crew, reviews, booking)
├── 404.html                        # Custom error page (noindex)
│
├── west-nusa-penida.html           # Tour pages
├── east-nusa-penida.html
├── nusa-penida-snorkeling.html
├── uluwatu-full-day-tour.html
├── sekumpul-waterfall-tour.html
├── canyoning-north-bali-tour.html
├── mount-batur-sunrise-trek.html
├── private-driver-tours.html
├── airport-transfers.html
│
├── nusa-penida-guide.html          # Travel guides (Article schema)
├── bali-destinations-guide.html
│
├── local-partners.html             # Trusted local partners directory
│
├── privacy.html                    # Legal pages (noindex, follow)
├── term.html
│
├── sitemap.xml                     # XML sitemap (indexable pages only)
├── robots.txt                      # Crawler directives
├── netlify.toml                    # Redirects, cache & security headers
│
└── src/
    └── assets/                     # All media (next-gen .webp format)
        ├── batur/                  # Mount Batur tour images
        ├── canyoning/              # Canyoning tour images
        ├── crew/                   # Driver / guide profile photos
        ├── penida/                 # Nusa Penida imagery
        ├── snorkeling/             # Snorkeling tour images
        ├── ubud/                   # Ubud destination images
        ├── uluwatu/                # Uluwatu destination images
        └── *.webp                  # Shared hero & section imagery
```

---

## Pages

| Page | Purpose | JSON-LD Type |
|------|---------|--------------|
| `index.html` | Homepage & booking funnel | `TravelAgency` |
| `west-nusa-penida.html` | West Nusa Penida day tour | `TouristTrip` |
| `east-nusa-penida.html` | East Nusa Penida day tour | `TouristTrip` |
| `nusa-penida-snorkeling.html` | Snorkeling + land tour | `TouristTrip` |
| `uluwatu-full-day-tour.html` | Uluwatu full-day tour | `TouristTrip` |
| `sekumpul-waterfall-tour.html` | Sekumpul waterfall tour | `TouristTrip` |
| `canyoning-north-bali-tour.html` | North Bali canyoning | `TouristTrip` |
| `mount-batur-sunrise-trek.html` | Mount Batur sunrise trek | `TouristTrip` |
| `private-driver-tours.html` | Custom private driver hire | `Service` |
| `airport-transfers.html` | Airport pickup/drop-off | `Service` |
| `nusa-penida-guide.html` | Nusa Penida travel guide | `Article` |
| `bali-destinations-guide.html` | Bali area guide | `Article` |
| `local-partners.html` | Wellness, health & stay partners | `CollectionPage` |
| `privacy.html` / `term.html` | Legal (noindex) | — |
| `404.html` | Error page (noindex) | — |

---

## Key Features

### 🪙 Live Currency Converter
Tour prices are authored in USD and converted to IDR & AUD on the fly via [open.er-api.com](https://open.er-api.com). Results are cached in `localStorage` with a **12-hour TTL** to avoid hammering the API. If the request fails, the static pre-rendered prices remain as a graceful fallback. Targets all `.idr-price[data-usd]` spans.

### 💬 WhatsApp Booking Integration
The booking form intercepts submit (`event.preventDefault()`), builds a formatted, URL-encoded message from the form fields, and opens a pre-filled chat at `wa.me/6282317794462`. No backend required.

### ✨ Scroll Reveal Animations
Elements with the `.reveal` class fade/slide in when 15% visible, using `IntersectionObserver`. Each element is `unobserve`d after first reveal for performance.

### 🔍 Technical SEO
- Per-page **JSON-LD** structured data (typed per page — see table above)
- Strict **canonical** tags, **OpenGraph** & **Twitter Card** meta
- `sitemap.xml` + `robots.txt`
- Optimized `.webp` imagery, `aria-label`s on icon-only controls

### 🤝 Local Partners Directory
`local-partners.html` lists vetted local businesses (wellness, health, accommodation) grouped by colour-coded category, each with a direct WhatsApp contact button. Built from copy-paste `<article>` card blocks for easy expansion (see [Maintenance Guide](#maintenance-guide)).

---

## SEO & URL Conventions

> ⚠️ **Read this before changing any URLs, canonical tags, or the sitemap.** Inconsistent URLs previously caused Google Search Console to drop most pages from the index ("Page with redirect" / duplicate-canonical errors). The rules below keep that fixed.

**The single canonical form for every page is:**

```
https://balirealvacation.com/<page>.html
```

That means: **non-www**, **`https`**, and **keep the `.html` extension**.

Every one of the following must agree on that exact form for each page:

- `<link rel="canonical">`
- `og:url` / `twitter:url`
- JSON-LD `url` fields
- Internal `href`s (use `/page.html`, not `/page`)
- `sitemap.xml` `<loc>` entries
- The `Sitemap:` line in `robots.txt`

**Additional rules:**
- **Never list `noindex` pages in the sitemap.** `privacy.html`, `term.html`, and `404.html` are `noindex` and are intentionally excluded from `sitemap.xml`.
- **Keep Netlify "Pretty URLs" OFF** (Site settings → Build & deploy → Post processing). With it on, Netlify 301-redirects `/page.html` → `/page`, which fights the `.html` canonical and re-introduces redirect errors.
- After editing the sitemap, **resubmit it in Google Search Console** and use **Validate Fix** on any open issues.

---

## Deployment

The site is hosted on **GitHub → Netlify** with automatic deploys.

1. Push to the connected branch on GitHub.
2. Netlify builds & publishes automatically (no build command — it serves the static files as-is).
3. Cloudflare proxies and caches at the edge.

**Netlify project:** `inspiring-zuccutto-3eb665.netlify.app`
**Primary domain (Netlify):** `balirealvacation.com` (apex / non-www) — Netlify auto-301s `www` → apex.

### `netlify.toml`

```toml
# Forces www → non-www (301), caches assets 1 year,
# sets baseline security headers. See file for details.
```

It does three things:
1. **`www` → non-www** permanent redirect (canonical host enforcement).
2. **Cache-Control** — `/src/assets/*` cached `immutable` for 1 year; HTML revalidated so edits go live instantly.
3. **Security headers** — `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`.

---

## DNS Configuration

Managed in **Cloudflare** (registrar/DNS), pointed at Netlify per their external-DNS docs:

| Type | Name | Value | Proxy |
|------|------|-------|-------|
| `A` | `balirealvacation.com` | `75.2.60.5` *(Netlify load balancer)* | Proxied |
| `CNAME` | `www` | `inspiring-zuccutto-3eb665.netlify.app` | Proxied |
| `TXT` | `balirealvacation.com` | `google-site-verification=…` | — |

**Cloudflare settings that must be correct:**
- **SSL/TLS mode: `Full (strict)`** — anything less (e.g. `Flexible`) causes redirect loops with Netlify's forced HTTPS.
- **No conflicting redirect rules** pushing apex → www (that would break the non-www canonical).
- ✅ Do **not** keep a `CNAME` file in the repo — that's a GitHub Pages mechanism and is ignored by Netlify. Ensure GitHub Pages is **disabled** (repo Settings → Pages) so there's only one live deployment.

---

## Local Development

No build tools needed. Either open the HTML files directly, or run a tiny local server so root-relative paths (`/page.html`, `src/assets/...`) resolve correctly:

```bash
# Python 3
python3 -m http.server 8000

# or Node
npx serve .
```

Then visit `http://localhost:8000`.

> Note: the live currency converter and WhatsApp links work locally, but Google Analytics and the Botpress widget are best tested on the deployed site.

---

## Maintenance Guide

### Add a new tour page
1. Duplicate an existing tour page (e.g. `uluwatu-full-day-tour.html`) as a template.
2. Update: `<title>`, meta description, OG/Twitter tags, JSON-LD (`TouristTrip`), content, prices, and the WhatsApp booking link.
3. Set the **canonical** to `https://balirealvacation.com/<new-page>.html` (non-www, `.html`).
4. Add the page's package card + booking-form `<option>` to `index.html`.
5. Add a `<url>` entry to `sitemap.xml`.
6. Resubmit the sitemap in Google Search Console.

### Add a new local partner
Open `local-partners.html` and follow the **"HOW TO ADD A NEW PARTNER"** comment block:
1. Copy one `<article class="partner-card">` block into the matching category's `.partner-grid`.
2. Set the accent: `style="--card-accent: var(--cat-wellness);"` (`--cat-wellness`, `--cat-health`, or `--cat-stay`).
3. Update the badge, name, provider, meta, description, and the WhatsApp link.
4. **WhatsApp link format:** drop the `+` and spaces → `+62 812-3456-7890` becomes `https://wa.me/6281234567890`.

To add a whole new category (e.g. yoga, dining): copy a `<section class="category-block">` and define a new `--cat-xxxx` colour in `:root`.

### Update tour prices
Edit the `data-usd="…"` attribute on each `.idr-price` span (and its visible fallback text). The converter recalculates IDR/AUD automatically.

---

## Contact

- **WhatsApp:** [+62 823-1779-4462](https://wa.me/6282317794462)
- **Telegram:** [+62 823-1779-4462](https://t.me/+6282317794462)
- **Instagram:** [@balirealvacation](https://instagram.com/balirealvacation)

---

<sub>© 2026 Bali Real Vacation. All Rights Reserved.</sub>

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
│   └── ui.json               # UI string dictionary (nav, buttons, footer, price note) in all 3 languages
│
├── _includes/
│   ├── layouts/base.njk      # Page shell: <head>, hreflang, nav, content, footer, scripts
│   └── partials/
│       ├── nav.njk           # Shared navigation
│       ├── lang-switcher.njk # EN | ID | 中文 pill switcher
│       ├── footer.njk        # Footer + floating buttons + mobile book bar
│       ├── testimonials.njk  # Reviews list + submission form (Convex-backed)
│       └── visitor-globe.njk # Visitor globe section — placement, palette, script tag
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
│   ├── booking-receipt.njk   # Internal: receipt / itinerary PDF generator (noindex, EN only)
│   ├── id/                   # Indonesian translations (mirrors English structure)
│   │   ├── id.11tydata.json  # Sets lang=id for all files in this folder
│   │   └── *.njk
│   └── zh/                   # Mandarin translations
│       ├── zh.11tydata.json  # Sets lang=zh for all files in this folder
│       └── *.njk
│
├── netlify/functions/
│   ├── visitors.mjs          # /api/visitors — Netlify adapter (Blobs + context.geo)
│   └── lib/visitors-core.mjs # …its logic, host-agnostic so it can be tested
│
├── test/visitors.test.mjs    # `npm test` — no deps, no live backend
│
├── convex/
│   ├── schema.ts             # reviews + receipts tables
│   ├── reviews.ts            # testimonial submit / list / approve
│   └── receipts.ts           # booking receipts: save, get, recent, purge (admin)
│
├── css/styles.css            # Global stylesheet — design tokens + lang-switcher styles
├── js/
│   ├── main.js               # Menu, currency converter, FAQ accordion, booking + airport WhatsApp forms
│   ├── reviews.js            # Testimonials, from Convex
│   └── visitor-globe.js      # <visitor-globe> custom element (shadow DOM, self-localizing)
└── src/assets/               # Images (.webp / .jpg) + countries-110m.json — passed through untouched
```

---

## Develop & build

Requires Node.js 18+.

```bash
npm install        # one time — installs Eleventy
npm start          # dev server with live reload → http://localhost:8080
npm run build      # production build → _site/
npm test           # unit tests for the /api/visitors function
```

`npm start` serves static files only, so `/api/visitors` 404s and the visitor
globe shows "statistics unavailable" — that is the intended failure, not a
broken dev setup. To exercise the function locally, run `npx netlify dev`
instead, which serves the build and the function together.

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

## Booking receipts & itineraries (internal tool)

**`/booking-receipt.html`** — an operator-only page that turns a confirmed booking into a
branded A4 receipt or itinerary the guest can keep. Built for the common case: a booking
comes in over WhatsApp, the guest pays cash to the driver, and they still want something
official.

It is `noindex, nofollow` and blocked in `robots.txt`, and it is deliberately not in the
nav — bookmark the URL. There is no login, so treat the URL as internal.

### Issuing a receipt

1. Open `/booking-receipt.html`.
2. Pick a service from **Quick fill** — every airport-transfer destination and every tour
   is pre-loaded at the price shown on the public pages, so the line items and inclusions
   fill themselves in. Tours price per person and follow the pax count you entered.
3. Fill in the guest, pickup and payment details. The document on the right updates as you type.
4. Set **Status** (paid / deposit / due) and **Method**. "Cash to driver" with
   *Ketut (driver)* is the default. The document adapts: a paid one says
   "Received by", an unpaid one says "To be paid to" and adds when it falls due,
   so an invoice never claims money it has not taken.
   If the guest pays cash but you quoted in USD or AUD, fill in **Cash amount in
   IDR** — the driver collects rupiah, and the guest should know the figure.
   **Payment date** is the day the money actually changes hands. Marking a booking
   paid seeds it from the service date, since cash is usually handed over on the day —
   change it if that is not what happened.
5. Watch the amber panel under the form. It lists anything a guest or driver
   would miss — service date, pickup time, pickup point — because empty fields
   are silently left off the document rather than shown blank.
6. Choose the document **Language** — EN, ID or ZH. Only the document changes; the editor
   stays in English.
7. Deliver it:
   - **Save as PDF** — opens the browser print dialog, already set to A4 with the editor
     hidden. Choose "Save as PDF" as the destination, then attach the file in WhatsApp.
   - **Send on WhatsApp** — opens a chat with the guest's number and a ready message
     containing their receipt link.
   - **Copy guest link** — the same link, to paste anywhere.
8. **Save** keeps the booking in this browser so you can reopen and reprint it later.

### How it works

The booking is stored in the same Convex deployment that powers the reviews, under a
short random id, so a guest link looks like:

```
https://balirealvacation.com/booking-receipt.html?r=k7m2pq4xzb
```

Publishing is automatic: about a second after you stop typing, the booking is upserted
to Convex and the Copy / Send buttons pick up the short link. Editing an existing
booking reuses the same id, so a link you already sent a guest keeps working and shows
the correction. Nothing is published until the booking has a guest name and a priced
line, so half-started drafts never reach the database.

**The page never renders a booking supplied by the URL.** An earlier version could:
it accepted a `#z=…` link that carried the whole booking in the address bar, as an
offline fallback. That meant anyone could edit one into a convincing fake receipt —
on our own domain, with our logo — without touching the database at all. Those links
are retired; opening one now says the format is no longer supported. The only thing
the page will display is a document it fetched back from our own store.

The trade-off is deliberate: if Convex is unreachable, no receipt can be issued. The
editor still works and you can still print a PDF, but there is no shareable link until
the connection is back. The panel at the top of the editor says which state you are in.

Opening a `?r=` link shows a read-only guest view with its own **Download PDF** button;
the editor is hidden. A link to a booking that no longer exists shows the guest a short
explanation and your WhatsApp number, rather than an empty receipt.

The printed sheet is tuned to keep a normal one-service booking on a single A4 page.
A booking with a long itinerary will run to a second page, which is expected — it breaks
between sections rather than through them.

Things worth knowing:

- **Anyone holding a link can open that receipt.** The ids are random and unguessable,
  but they are not secret — send them to the guest, not to a public channel.
- **Guest details now live in your Convex database**, where they did not before. The id
  also travels in the query string, so it appears in Netlify and Analytics logs (the
  booking itself does not).
- **Issuing needs the key.** `RECEIPT_KEY` is set as an environment variable in the
  Convex dashboard, and the same value goes into **Issuer key** at the bottom of the
  editor, once per browser you issue from. Without it, saving and listing are refused,
  so the tool cannot produce a guest link at all. Reading stays public — that is what
  makes a guest link work for someone who has no key.
- **The page is still public**, and always will be: anyone who finds the URL can open
  the editor, type into it and print a PDF from their own browser. That is unavoidable
  for a web page and mostly harmless. What they cannot do is produce a link on this
  domain, because a link only exists once the booking is in our database.
- **Saved bookings** still live in this browser (`localStorage`) for speed, but
  **Fetch bookings issued on other devices** pulls the list out of Convex, so a booking
  made on the laptop can be reopened and reprinted from a phone.

To delete receipts, use the Convex dashboard, or the admin-only purge — it is an
`internalMutation`, so it cannot be called from a browser:

The JSON argument has to survive your shell's quoting, which differs per shell. On this
machine (Windows) use one of the first two:

```bat
:: Command Prompt
npx convex run receipts:purge "{\"rids\":[\"k7m2pq4xzb\"]}"
```

```powershell
# PowerShell
npx convex run receipts:purge '{\"rids\":[\"k7m2pq4xzb\"]}'
```

```bash
# Git Bash / macOS / Linux
npx convex run receipts:purge '{"rids":["k7m2pq4xzb"]}'
npx convex run receipts:purge '{"noPrefix":"BRV-2026"}'
```

In Command Prompt, single quotes are not quote characters at all — they are passed
through as literal text, the double quotes get stripped, and Convex rejects the result
as not-an-object. `--prod` is unnecessary: `CONVEX_DEPLOY_KEY` in `.env.local` already
points at production, and the CLI says so if you pass it.

### Keeping prices in step

The Quick-fill price list lives in the `TRANSFERS`, `TOURS` and `DRIVER_DAY_RATE` constants
at the top of the `<script>` in `pages/booking-receipt.njk`. When you change a public
price, update it there too — nothing breaks if you forget, you just have to retype the
amount on the receipt.

---

## Visitor globe (`/api/visitors`)

The dark band between the reviews and the booking form on each homepage. It
shows total visitors, how many people are on the site right now, the countries
they are reading from, and a spinning globe with a dot per city.

**Where the pieces are**

| Piece | File |
|---|---|
| The custom element | `js/visitor-globe.js` |
| Section markup, palette, script tag | `_includes/partials/visitor-globe.njk` |
| The API | `netlify/functions/visitors.mjs` (adapter) + `lib/visitors-core.mjs` (logic) |
| Tests | `test/visitors.test.mjs` — `npm test` |
| Country outlines | `src/assets/countries-110m.json` (Natural Earth, public domain) |
| What visitors are told | `pages/privacy.njk` §4, and its `id/` and `zh/` twins |

**Storage** is Netlify Blobs, store `visitor-globe`, two keys. `stats` holds the
total, one row per place and the dedupe hashes; it is written once per new
visitor. `presence` holds the last five minutes of heartbeats and churns
constantly. They are separate on purpose — merging them makes every heartbeat
fight the visit counter for the same compare-and-set token, and under
concurrency the retries start losing increments silently. Nothing needs
provisioning; the store appears on first write.

**Geolocation** is `context.geo`, resolved at Netlify's edge. No IP is ever
stored, logged, or sent anywhere, and no third-party lookup is involved.

**Adding it to another page** — `{% include "partials/visitor-globe.njk" %}`.
All text inside the component is localized from `<html lang>`, so nothing else
is needed. It lazy-loads everything except the visit POST, which stays eager so
that "total visitors" keeps meaning visitors rather than people who scrolled.

### Things that will bite you

- **Shadow DOM is unreachable from outside.** `css/styles.css` cannot style
  anything inside the card. The `--vg-*` custom properties in the partial are
  the entire theming surface.
- **The five canvas colours are parsed as hex only.** `--vg-land`, `--vg-ocean`,
  `--vg-rim`, `--vg-past`, `--vg-current`. Writing `rgb()`, `hsl()`,
  `color-mix()` or a `var()` reference silently falls back to the default with
  no error anywhere.
- **`online_now` counts foreground browser tabs, not people.** One person on a
  phone and a laptop is two. A hidden tab stops polling and drops out within
  five minutes. Do not pad the number with a random offset — anyone can catch
  it by opening two tabs, and it would make every other figure on the page
  untrustworthy.
- **Only top-level files in `netlify/functions/` become endpoints.** Shared code
  goes in `lib/`; tests go in `test/`, outside the directory entirely.
- **`GET` is cached** for 60 s (and 30 s per warm function instance), so assert
  through `POST` responses when testing — a `GET` can lag a write by a minute.

### Privacy — four rules that keep this out of consent-banner territory

Aggregates only (a count per place, never a row per visit); no IP, ever;
nothing durable on the device (`sessionStorage`, no cookie, no `localStorage`);
and only short-lived hashes salted with a value that rotates daily. Break any
one of them — a per-visit log, a persistent id, an analytics pixel inside the
widget — and `privacy.njk` §4 becomes untrue and the site needs a consent
banner. That is a product decision, not a code change.

### Manual check after a deploy

1. `curl https://balirealvacation.com/api/visitors` → zeros, not a 500.
2. Load the homepage, scroll to the globe, `curl` again → total is 1.
3. Reload immediately → still 1 (server-side dedupe works).
4. Open a second browser → 2, and `online_now` is 2.
5. Close both, wait 6 minutes, `curl` → `online_now` is back to 0.

Step 5 is the one people skip, and a presence list that never prunes is the
most common way this feature breaks.

### Credit

A fork of [visitor-globe-widget](https://github.com/StatSleuth8/visitor-globe-widget)
by Shuai Yang (MIT). The copyright and permission notice is in the header of
`js/visitor-globe.js` — **leave it there**; MIT requires it to travel with every
copy. Country outlines are Natural Earth, public domain, no obligation.

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

# Bali Real Vacation — i18n Setup (English · Bahasa Indonesia · 中文)

This adds Indonesian and Mandarin **without touching a single existing English URL**, so your Google indexing stays intact. English lives at the root; `/id/` and `/zh/` are added alongside.

## What's included (new files — drop into your project)

```
_data/languages.js              ← the 3 languages (code, label, prefix)
_data/ui.json                   ← UI string dictionary (nav, buttons, footer)
pages/pages.11tydata.js         ← default lang = en, auto translation-key
pages/id/id.11tydata.json       ← marks everything in /id/ as Indonesian
pages/zh/zh.11tydata.json       ← marks everything in /zh/ as Mandarin
_includes/partials/lang-switcher.njk   ← the EN | ID | 中文 switcher
pages/id/index.njk              ← Indonesian homepage starter (hero done)
pages/zh/index.njk              ← Mandarin homepage starter (hero done)
```

## 3 edits to your existing files

### 1. `.eleventy.js` — add this collection just before `return {`:

```js
// i18n: map every translation key -> the language versions that exist
eleventyConfig.addCollection("i18n", function (api) {
  const map = {};
  api.getAll().forEach((item) => {
    const key = item.data.transKey;
    if (!key) return;
    (map[key] = map[key] || []).push({ lang: item.data.lang || "en", url: item.url });
  });
  return map;
});
```

### 2. `_includes/layouts/base.njk` — two changes:

Change the `<html>` tag:
```html
<html lang="{{ lang or 'en' }}">
```

Add right after your `<link rel="canonical" …>`:
```html
{%- for s in collections.i18n[transKey] %}
<link rel="alternate" hreflang="{{ s.lang }}" href="{{ site.url }}{{ s.url }}">
{%- endfor %}
{%- for s in collections.i18n[transKey] %}{% if s.lang == 'en' %}
<link rel="alternate" hreflang="x-default" href="{{ site.url }}{{ s.url }}">
{%- endif %}{% endfor %}
```

### 3. `_includes/partials/nav.njk` — add the switcher after `</nav>`:
```html
{% include "partials/lang-switcher.njk" %}
```

### Add to `css/styles.css` (switcher styling):
```css
.lang-switcher { display: flex; gap: 4px; align-items: center; margin-left: 14px; }
.lang-switcher a { font: 700 13px var(--font-heading); color: var(--text-dark);
  text-decoration: none; padding: 5px 9px; border-radius: 20px; opacity: .6; }
.lang-switcher a.active { opacity: 1; background: var(--primary-color); color: #fff; }
.lang-switcher a:hover { opacity: 1; }
```

## How to translate the next page

1. Copy the English file, e.g. `pages/nusa-penida-snorkeling.njk`, into `pages/id/nusa-penida-snorkeling.njk` (keep the **same filename** — that's what links the translations).
2. Set its `permalink: /id/nusa-penida-snorkeling.html` and `canonical:` to the `/id/` URL.
3. Translate the visible text. Pull UI strings from the dictionary, e.g. `{{ ui.book_now[lang] }}`.
4. That's it — hreflang and the switcher update automatically.

## Netlify routing — important

**Do NOT auto-redirect visitors by browser language.** The strategy doc's `_redirects` rule (`/_ /id/:splat 302 Language=id`) is both malformed (`/_` should be `/*`) and a bad idea: Google's crawler and many users send a language that doesn't match what they want, so forced redirects can hide pages from search and trap visitors on the wrong version. `hreflang` (already wired) is exactly how Google serves the right language in results, and the switcher lets people choose.

If you want a *gentle* nudge, add a dismissible "View in Bahasa Indonesia?" banner (client-side JS, no redirect, no SEO impact) — ask and I'll provide it.

## Currency note

For `/zh/` pages, add a CNY estimate next to IDR (Chinese travellers think in RMB). Your existing converter already fetches USD rates; adding `data.rates.CNY` to `main.js` and a `.cny-price` span is a small follow-up.

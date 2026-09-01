// Sitemap hints, keyed by `transKey` (derived in pages/pages.11tydata.js, so
// /nusa-penida-guide, /id/nusa-penida-guide and /zh/nusa-penida-guide all share
// one entry — every language of a page gets the same weighting).
//
// The sitemap itself is generated: .eleventy.js builds the `sitemapUrls`
// collection and pages/sitemap.njk prints it. Nothing here lists URLs, so
// adding a page needs no edit unless you want it weighted differently.
//
// What gets left out, without being named here:
//   - anything whose front matter says `robots: noindex` (privacy, term,
//     booking-receipt) — telling Google not to index a page and then listing it
//     in the sitemap is a contradiction
//   - the 404s, via `exclude` below
//
// `lastmod` is read from the file's last git commit at build time. The dates
// below are only a fallback for when git history is unavailable (a shallow CI
// clone, say). If neither is known the tag is omitted, which is legal and
// better than publishing a date we made up.
module.exports = {
  // Applied to any page with no entry in `pages`.
  defaults: { changefreq: "monthly", priority: "0.8" },

  // transKeys never listed, whatever their robots tag.
  exclude: ["404"],

  pages: {
    index:                      { changefreq: "weekly",  priority: "1.0", lastmod: "2026-03-27" },

    // Individual tours — the pages we most want ranked.
    "west-nusa-penida":         { changefreq: "monthly", priority: "0.9", lastmod: "2026-03-27" },
    "east-nusa-penida":         { changefreq: "monthly", priority: "0.9", lastmod: "2026-03-27" },
    "nusa-penida-snorkeling":   { changefreq: "monthly", priority: "0.9", lastmod: "2026-03-27" },
    "uluwatu-full-day-tour":    { changefreq: "monthly", priority: "0.9", lastmod: "2026-03-27" },
    "sekumpul-waterfall-tour":  { changefreq: "monthly", priority: "0.9", lastmod: "2026-03-27" },
    "canyoning-north-bali-tour":{ changefreq: "monthly", priority: "0.9", lastmod: "2026-03-27" },
    "mount-batur-sunrise-trek": { changefreq: "monthly", priority: "0.9", lastmod: "2026-03-27" },

    // Services and guides.
    "private-driver-tours":     { changefreq: "monthly", priority: "0.8", lastmod: "2026-03-27" },
    "airport-transfers":        { changefreq: "monthly", priority: "0.8", lastmod: "2026-03-27" },
    "nusa-penida-guide":        { changefreq: "monthly", priority: "0.8", lastmod: "2026-03-27" },
    "bali-destinations-guide":  { changefreq: "monthly", priority: "0.8", lastmod: "2026-03-27" },

    // Directories that gain entries over time, so crawled more often.
    "local-partners":           { changefreq: "weekly",  priority: "0.7", lastmod: "2026-06-13" },
    "land-investment":          { changefreq: "weekly",  priority: "0.7", lastmod: "2026-08-22" },
    "balinese-art":             { changefreq: "weekly",  priority: "0.7", lastmod: "2026-09-01" }
  }
};

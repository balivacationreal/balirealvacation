const { execFileSync } = require("child_process");
const site = require("./_data/site.js");
const sitemapMeta = require("./_data/sitemapMeta.js");

// Date of the last commit that touched a file, as YYYY-MM-DD.
//
// Preferred over the file's mtime, which on a CI box is the moment the repo was
// cloned — that would stamp every page with today's date on every deploy and
// tell Google nothing. Returns null when git cannot answer (no history in a
// shallow clone, a file not yet committed); callers fall back to
// _data/sitemapMeta.js and, failing that, omit <lastmod> altogether.
const gitDateCache = new Map();
function lastCommitDate(inputPath) {
  if (gitDateCache.has(inputPath)) return gitDateCache.get(inputPath);
  let date = null;
  try {
    const out = execFileSync(
      "git",
      ["log", "-1", "--format=%cs", "--", inputPath],
      { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }
    ).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(out)) date = out;
  } catch (e) {
    // git missing or not a repo — fall back, do not fail the build.
  }
  gitDateCache.set(inputPath, date);
  return date;
}

const LANG_ORDER = { en: 0, id: 1, zh: 2 };

module.exports = function (eleventyConfig) {
  // Copy static files straight through to the build output
  eleventyConfig.addPassthroughCopy("src"); // images: src/assets/...
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("js");
  eleventyConfig.addPassthroughCopy("robots.txt");
  eleventyConfig.addPassthroughCopy("netlify.toml");

  eleventyConfig.addCollection("i18n", function (api) {
    const map = {};
    api.getAll().forEach((item) => {
      const key = item.data.transKey;
      if (!key) return;
      (map[key] = map[key] || []).push({
        lang: item.data.lang || "en",
        url: item.url,
      });
    });
    return map;
  });

  eleventyConfig.addCollection("i18nUrl", function (api) {
    const map = {};
    api.getAll().forEach((item) => {
      const key = item.data.transKey;
      if (!key) return;
      map[key + "_" + (item.data.lang || "en")] = item.url;
    });
    return map;
  });

  // Every URL the sitemap should list, already filtered, ordered and paired
  // with its translations. Built here rather than in the template because
  // Nunjucks cannot sort on two keys or group a list. See _data/sitemapMeta.js
  // for the weightings and for what gets left out.
  eleventyConfig.addCollection("sitemapUrls", function (api) {
    const items = api.getAll().filter((item) => {
      const key = item.data.transKey;
      if (!key || sitemapMeta.exclude.includes(key)) return false;
      if (!item.url || item.data.eleventyExcludeFromCollections) return false;
      // Never advertise a page we have asked Google not to index.
      return !/noindex/i.test(item.data.robots || "");
    });

    // Translations of one page, so each entry can point at its siblings.
    const byKey = {};
    items.forEach((item) => {
      const key = item.data.transKey;
      (byKey[key] = byKey[key] || []).push(item);
    });
    Object.values(byKey).forEach((group) =>
      group.sort(
        (a, b) =>
          (LANG_ORDER[a.data.lang] ?? 9) - (LANG_ORDER[b.data.lang] ?? 9)
      )
    );

    const abs = (item) =>
      item.data.canonical || site.url + item.url;

    return items
      .map((item) => {
        const key = item.data.transKey;
        const meta = sitemapMeta.pages[key] || {};
        const group = byKey[key];
        const english = group.find((s) => (s.data.lang || "en") === "en");
        return {
          key,
          lang: item.data.lang || "en",
          loc: abs(item),
          lastmod: lastCommitDate(item.inputPath) || meta.lastmod || null,
          changefreq: meta.changefreq || sitemapMeta.defaults.changefreq,
          priority: meta.priority || sitemapMeta.defaults.priority,
          // hreflang: every language of this page, plus x-default on English.
          alternates: group.map((s) => ({
            lang: s.data.lang || "en",
            href: abs(s)
          })),
          xDefault: english ? abs(english) : null
        };
      })
      .sort(
        (a, b) =>
          Number(b.priority) - Number(a.priority) ||
          a.key.localeCompare(b.key) ||
          (LANG_ORDER[a.lang] ?? 9) - (LANG_ORDER[b.lang] ?? 9)
      );
  });

  return {
    dir: {
      input: "pages",
      includes: "../_includes",
      data: "../_data",
      output: "_site",
    },
    // Templates are .njk; output keeps clean .html via per-page permalink
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
};

module.exports = function (eleventyConfig) {
  // Copy static files straight through to the build output
  eleventyConfig.addPassthroughCopy("src"); // images: src/assets/...
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("js");
  eleventyConfig.addPassthroughCopy("robots.txt");
  eleventyConfig.addPassthroughCopy("netlify.toml");
  eleventyConfig.addPassthroughCopy("sitemap.xml");

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

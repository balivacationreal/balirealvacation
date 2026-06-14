module.exports = function (eleventyConfig) {
  // Copy static files straight through to the build output
  eleventyConfig.addPassthroughCopy("src");        // images: src/assets/...
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("js");
  eleventyConfig.addPassthroughCopy("robots.txt");
  eleventyConfig.addPassthroughCopy("netlify.toml");
  eleventyConfig.addPassthroughCopy("sitemap.xml");

  return {
    dir: {
      input: "pages",
      includes: "../_includes",
      data: "../_data",
      output: "_site"
    },
    // Templates are .njk; output keeps clean .html via per-page permalink
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk"
  };
};

module.exports = {
  lang: "en",
  prefix: "",
  eleventyComputed: {
    // transKey ties a page to its translations. Derived from the file path with the
    // language folder stripped, so /index, /id/index, /zh/index all share key "index".
    transKey: (data) => {
      if (data.transKey) return data.transKey;
      let p = (data.page && data.page.filePathStem) || "";
      p = p.replace(/^\/(id|zh)\//, "/").replace(/^\//, "");
      return p || "index";
    }
  }
};

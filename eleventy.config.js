const { HtmlBasePlugin } = require("@11ty/eleventy");

module.exports = function(eleventyConfig) {
  // Automatically rewrites URLs in HTML output to include pathPrefix
  eleventyConfig.addPlugin(HtmlBasePlugin);

  // Pass through static assets
  eleventyConfig.addPassthroughCopy("src/assets");

  // Watch for changes to scss files (triggers browser reload)
  eleventyConfig.addWatchTarget("src/scss/");

  // Add node_modules to Nunjucks include path for GOV.UK Frontend macros
  eleventyConfig.setNunjucksEnvironmentOptions({
    // Tell Nunjucks to look in node_modules for GOV.UK Frontend templates
  });

  // Configure Nunjucks library to include node_modules path
  eleventyConfig.setLibrary("njk", function() {
    const nunjucks = require("nunjucks");
    return new nunjucks.Environment([
      new nunjucks.FileSystemLoader("src/_includes"),
      new nunjucks.FileSystemLoader("src/_layouts"),
      new nunjucks.FileSystemLoader("node_modules/govuk-frontend/dist")
    ]);
  }());

  return {
    pathPrefix: process.env.PATH_PREFIX || "/",
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      layouts: "_layouts",
      data: "_data"
    },
    templateFormats: ["njk", "md", "html"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk"
  };
};

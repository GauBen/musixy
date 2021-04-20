module.exports = function(eleventyConfig) {
  eleventyConfig.setBrowserSyncConfig({
    server: {
      baseDir: '_dist'
    }
  })
  return {
    dir: {
      input: "pages"
    }
  };
};

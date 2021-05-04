module.exports = (eleventyConfig) => {
  eleventyConfig.setBrowserSyncConfig({
    server: {
      baseDir: '_dist'
    }
  })
  return {
    dir: {
      input: 'pages',
      output: '_pre-dist'
    }
  }
}

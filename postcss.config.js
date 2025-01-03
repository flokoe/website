const purgecss = { '@fullhuman/postcss-purgecss': {
  content: [ './hugo_stats.json' ],
  defaultExtractor: (content) => {
      let els = JSON.parse(content).htmlElements;
      return els.tags.concat(els.classes, els.ids);
  }
}
}

module.exports = {
  plugins: {
    'postcss-import': {
      path: ["themes/simple/assets/css"]
    },
    autoprefixer: {},
    // ...(process.env.HUGO_ENVIRONMENT === 'production' ? purgecss : {}),
    ...(process.env.HUGO_ENVIRONMENT === 'production' ? { cssnano: { preset: 'advanced' } } : {})
  }
}

var postcss = require('postcss')
var browserslist = require('browserslist')

module.exports = postcss.plugin('postcss-css-custom-props-fallback', function (opts = []) {
  const varMatchRegex = /var\((--[\w-]+)(, )?(.*?)\)(\s|,|$)/
  const supportedBrowsers = browserslist()

  // if IE 11 isn't supported, return a no op
  if (!supportedBrowsers.some(browser => browser.includes('ie 11'))) { return () => {} }

  return function (css, result) {
    css.walkRules(rule => {
      rule.walkDecls(decl => {
        // is there a CSS var here?
        if (decl.value.includes('var(--')) {
          const updatedVal = decl.value.match(new RegExp(varMatchRegex, 'g')).reduce((accum, nextMatch) => {
            const [matchInstance, varName, , fallbackPiece] = nextMatch.match(varMatchRegex)

            for (const i in opts) {
              const { varPrefix, varFallbackMap } = opts[i]

              if (varName.includes(varPrefix)) {
                // A) if they include a theme var, replace the whole thing with the matching color from themeObj
                const fallbackValue = varFallbackMap[varName]
                if (fallbackValue) return accum.replace(matchInstance.trim(), fallbackValue)
              }
            }

            if (fallbackPiece) {
              // B) if they do not include a theme var and DO include a fallback, replace w/ fallback
              return accum.replace(matchInstance.trim(), fallbackPiece)
            }

            // C) if we're here, just pass accum back unmodified and move along
            return accum
          }, decl.value)

          if (typeof updatedVal !== 'undefined' && updatedVal !== decl.value) {
            rule.insertBefore(decl, decl.clone({ value: updatedVal }))
          }
        }
      })
    })
  }
})

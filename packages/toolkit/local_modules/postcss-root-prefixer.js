const checkParentHasPrefix = (rule, prefix) => {
  if (rule.parent.selector) {
    return checkParentHasPrefix(rule.parent, prefix)
  }

  return rule.selector.includes(prefix)
}

const plugin = (opts = {}) => {
  const { prefix, fileNamePattern } = opts

  return {
    postcssPlugin: 'postcss-root-prefixer',
    Once(root, { result }) {
      const filePath = result.opts.to

      if (fileNamePattern && !fileNamePattern.test(filePath)) {
        return
      }

      root.walkRules((rule) => {
        if (rule.parent.selector && checkParentHasPrefix(rule, prefix)) {
          return rule
        }

        const newSelectors = rule.selectors.map((selector) => {
          return [prefix, selector].join(' ')
        })

        rule.selectors = newSelectors
        rule.selector = newSelectors.join(', ')
      })
    }
  }
}

plugin.postcss = true

module.exports = plugin

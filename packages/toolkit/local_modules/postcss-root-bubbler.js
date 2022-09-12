const plugin = (opts = {}) => {
  return {
    postcssPlugin: 'postcss-root-bubbler',
    Once(root, { result }) {
      root.walkRules((rule) => {
        if (rule.selectors) {
          const newSelectors = rule.selectors.map((selector) => {
            const res = selector.match(/(.*)((body|html|:root)(?:[^\w ][^ ]+)?)(.*)/)

            if (res) {
              const [everything, preRoot, root, whichRoot, postRoot] = res

              return [root, preRoot, postRoot].join(' ').replaceAll(/\s+/g, ' ').replace(/^\s*/, '').replace(/\s*$/, '')
            }

            return selector
          })

          rule.selectors = newSelectors
          rule.selector = newSelectors.join(', ')
        }
      })
    }
  }
}

plugin.postcss = true

module.exports = plugin

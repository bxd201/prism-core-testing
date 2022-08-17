import memoize from 'lodash/memoize'
import dedupePatternedString from 'src/shared/utils/dedupePatternedString.util'
import { CLEANSLATE_CLASS, PRISM_CLASS, TO_BIND_CLASS, TOOLKIT_CLASS } from '../facetConstants'

export default memoize((prismRoot) => {
  const prismDefaultSettings = {
    // nothing in here for now
  }

  // populate default attributes on root if they are not already defined
  Object.keys(prismDefaultSettings).forEach((key) => {
    const val = prismDefaultSettings[key]
    if (typeof val === 'undefined') {
      prismRoot.setAttribute(key, val)
    }
  })

  prismRoot.className = dedupePatternedString(`${prismRoot.className} ${TO_BIND_CLASS} ${CLEANSLATE_CLASS} ${TOOLKIT_CLASS} ${PRISM_CLASS}`, ' ')

  return prismRoot
})

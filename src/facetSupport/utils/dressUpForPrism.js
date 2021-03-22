import dedupePatternedString from 'src/shared/utils/dedupePatternedString.util'
import { ALL_WRAPPING_CLASSES } from '../facetConstants'

export default function dressUpForPrism (prismRoot) {
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

  prismRoot.className = dedupePatternedString(`${prismRoot.className} ${ALL_WRAPPING_CLASSES.join(' ')}`, ' ')

  return prismRoot
}

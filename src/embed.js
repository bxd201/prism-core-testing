// @flow
import 'src/allFacets' // import all facets so they're included in the bundle
import { injectRoot, embedAtRoots, embedAtElement, flagAsMainBundle } from 'src/facetSupport/facetBinder'

// expose embed method on global PRISM object in order to manually call this later
window.PRISM = {
  ...(window.PRISM || {}),
  embed: embedAtElement
}

// identify this as the main bundle
flagAsMainBundle()
// initial root injection to appropriately decorate auto-embed elements with prism attributes and classes
injectRoot()
// perform embedding
embedAtRoots(true)

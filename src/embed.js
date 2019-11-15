// @flow
import 'src/allFacets' // import all facets so they're included in the bundle
import { injectRoot, embedAtRoots, flagAsMainBundle } from 'src/facetBinder'

// define a call to an overridden embedAtRoots to use below and to expose as part of the global PRISM object
const doEmbed = () => embedAtRoots(true)

// expose embed method on global PRISM object in order to manually call this later
window.PRISM = {
  ...(window.PRISM || {}),
  embed: doEmbed
}

// identify this as the main bundle
flagAsMainBundle()
// inject an embed root
injectRoot()
// perform embedding
doEmbed()

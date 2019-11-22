// @flow
import 'src/allFacets' // import all facets so they're included in the bundle
import { flagAsMainBundle, embedAtRoots } from 'src/facetSupport/facetBinder'

// identify this as the main bundle
flagAsMainBundle()
// perform embedding
embedAtRoots(true)

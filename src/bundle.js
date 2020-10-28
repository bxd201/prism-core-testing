// @flow
import 'src/allFacets' // import all facets so they're included in the bundle
import { embedAtRoots, embedAtElement } from 'src/facetSupport/facetBinder'
import updateGlobalPrismObject from 'src/facetSupport/utils/updateGlobalPrismObject'

console.info('test BASE_URL value in bundle:', BASE_PATH)

// expose embed method on global PRISM object in order to manually call this later
updateGlobalPrismObject('__embed', embedAtElement)

// perform embedding
embedAtRoots(true)

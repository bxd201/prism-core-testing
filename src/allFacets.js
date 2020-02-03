import assert from 'assert'

/**
 * IMPORTANT!!!
 * The facets imported here need to match what is in export.js and webpack/constants.js until further notice
 */

import ColorDetailsFacet from 'src/components/Facets/ColorDetailsFacet'
import ColorListingPage from 'src/components/Facets/ColorListingPage/ColorListingPage'
import ColorWallFacet from 'src/components/Facets/ColorWallFacet'
import ColorFamilyFacet from 'src/components/Facets/ColorFamilyFacet/ColorFamilyFacet'
import Prism from 'src/components/Facets/Prism/Prism'
import Tinter from 'src/components/Facets/Tinter/Tinter'

export const allFacets = {
  ColorDetailsFacet,
  ColorListingPage,
  ColorWallFacet,
  ColorFamilyFacet,
  Prism,
  Tinter
}

const allFacetsKeys = Object.keys(allFacets)
const entryPointKeys = Object.keys(WEBPACK_CONSTANTS.facetEntryPoints)
assert(allFacetsKeys.length === entryPointKeys.length, 'Facet entry point length does not match exported Facet length')

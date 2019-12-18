import assert from 'assert'
import { facetEntryPoints } from '../webpack/constants'

/**
 * IMPORTANT!!!
 * The facets imported here need to match what is in export.js and webpack/constants.js until further notice
 */

import ColorDetails from 'src/components/Facets/ColorDetails/ColorDetails'
import ColorListingPage from 'src/components/Facets/ColorListingPage/ColorListingPage'
import ColorWallFacet from 'src/components/Facets/ColorWallFacet'
import ColorFamilyFacet from 'src/components/Facets/ColorFamilyFacet/ColorFamilyFacet'
import Prism from 'src/components/Facets/Prism/Prism'
import Tinter from 'src/components/Facets/Tinter/Tinter'

export const allFacets = {
  ColorDetails,
  ColorListingPage,
  ColorWallFacet,
  ColorFamilyFacet,
  Prism,
  Tinter
}

const allFacetsKeys = Object.keys(allFacets)
const entryPointKeys = Object.keys(facetEntryPoints)
assert(allFacetsKeys.length === entryPointKeys.length, 'Facet entry point length does not match exported Facet length')

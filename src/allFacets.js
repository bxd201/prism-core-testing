import assert from 'assert'
import { facetEntryPoints } from '../webpack/constants'

import ColorDetails from 'src/components/Facets/ColorDetails/ColorDetails'
import ColorListingPage from 'src/components/Facets/ColorListingPage/ColorListingPage'
import ColorWallFacet from 'src/components/Facets/ColorWallFacet/ColorWallFacet'
import Prism from 'src/components/Facets/Prism/Prism'
import Tinter from 'src/components/Facets/Tinter/Tinter'

export const allFacets = {
  ColorDetails,
  ColorListingPage,
  ColorWallFacet,
  Prism,
  Tinter
}

const allFacetsKeys = Object.keys(allFacets)
const entryPointKeys = Object.keys(facetEntryPoints)
assert(allFacetsKeys.length === entryPointKeys.length, 'Facet entry point length does not match exported Facet length')

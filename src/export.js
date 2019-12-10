import { facetMasterWrapper } from 'src/facetSupport/facetMasterWrapper'

/**
 * IMPORTANT!!!
 * The facets imported here need to match what is in allFacets.js and webpack/constants.js until further notice
 */

import ColorDetails from 'src/components/Facets/ColorDetails/ColorDetails'
import ColorListingPage from 'src/components/Facets/ColorListingPage/ColorListingPage'
import ColorWallFacet from 'src/components/Facets/ColorWallFacet'
import ColorFamilyFacet from 'src/components/Facets/ColorFamilyFacet/ColorFamilyFacet'
import Prism from 'src/components/Facets/Prism/Prism'
import Tinter from 'src/components/Facets/Tinter/Tinter'

export default {
  ColorDetails: facetMasterWrapper(ColorDetails),
  ColorListingPage: facetMasterWrapper(ColorListingPage),
  ColorWallFacet: facetMasterWrapper(ColorWallFacet),
  ColorFamilyFacet: facetMasterWrapper(ColorFamilyFacet),
  Prism: facetMasterWrapper(Prism),
  Tinter: facetMasterWrapper(Tinter)
}

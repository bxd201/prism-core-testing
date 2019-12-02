import { appWrapper } from './facetBinder'

/**
 * IMPORTANT!!!
 * The facets imported here need to match what is in allFacets.js and webpack/constants.js until further notice
 */

import ColorDetails from 'src/components/Facets/ColorDetails/ColorDetails'
import ColorListingPage from 'src/components/Facets/ColorListingPage/ColorListingPage'
import ColorWallFacet from 'src/components/Facets/ColorWallFacet'
import ColorFamilyFacet from 'src/components/Facets/ColorFamilyFacet'
import Prism from 'src/components/Facets/Prism/Prism'
import Tinter from 'src/components/Facets/Tinter/Tinter'

export default {
  ColorDetails: appWrapper(ColorDetails),
  ColorListingPage: appWrapper(ColorListingPage),
  ColorWallFacet: appWrapper(ColorWallFacet),
  ColorFamilyFacet: appWrapper(ColorFamilyFacet),
  Prism: appWrapper(Prism),
  Tinter: appWrapper(Tinter)
}

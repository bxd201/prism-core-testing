import { facetMasterWrapper } from 'src/facetSupport/facetMasterWrapper'

/**
 * IMPORTANT!!!
 * The facets imported here need to match what is in allFacets.js and webpack/constants.js until further notice
 */

import ColorDetailsFacet from 'src/components/Facets/ColorDetailsFacet'
import ColorListingPage from 'src/components/Facets/ColorListingPage/ColorListingPage'
import ColorWallFacet from 'src/components/Facets/ColorWallFacet'
import ColorFamilyFacet from 'src/components/Facets/ColorFamilyFacet/ColorFamilyFacet'
import FastMaskSimple from 'src/components/Facets/FastMaskSimple/FastMaskSimple'
import JumpStartFacet from 'src/components/Facets/JumpStartFacet/JumpStartFacet'
import Prism from 'src/components/Facets/Prism/Prism'
import Tinter from 'src/components/Facets/Tinter/Tinter'

export default {
  ColorDetailsFacet: facetMasterWrapper(ColorDetailsFacet),
  ColorListingPage: facetMasterWrapper(ColorListingPage),
  ColorWallFacet: facetMasterWrapper(ColorWallFacet),
  ColorFamilyFacet: facetMasterWrapper(ColorFamilyFacet),
  FastMaskSimple: facetMasterWrapper(FastMaskSimple),
  JumpStartFacet: facetMasterWrapper(JumpStartFacet),
  Prism: facetMasterWrapper(Prism),
  Tinter: facetMasterWrapper(Tinter)
}

import { appWrapper } from './facetBinder'

import ColorListingPageFacet from './components/Facets/ColorListingPage/ColorListingPage'
import ColorWallFacet from './components/Facets/ColorWallFacet/ColorWallFacet'
import PrismFacet from './components/Facets/Prism/Prism'
import TinterFacet from './components/Facets/Tinter/Tinter'

export const ColorListingPage = appWrapper(ColorListingPageFacet)
export const ColorWall = appWrapper(ColorWallFacet)
export const Prism = appWrapper(PrismFacet)
export const Tinter = appWrapper(TinterFacet)

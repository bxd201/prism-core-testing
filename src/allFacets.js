/**
 * IMPORTANT!!!
 * The facets imported here need to match what is in webpack/constants.js until further notice
 */

import ColorDetailsFacet from 'src/components/Facets/ColorDetailsFacet'
import ColorListingPage from 'src/components/Facets/ColorListingPage/ColorListingPage'
import ColorWallFacet from 'src/components/Facets/ColorWallFacet'
import ColorFamilyFacet from 'src/components/Facets/ColorFamilyFacet/ColorFamilyFacet'
import ColorVisualizerWrapper from 'src/components/Facets/ColorVisualizerWrapper/ColorVisualizerWrapper'
import FastMaskSimple from 'src/components/Facets/FastMaskSimple/FastMaskSimple'
import Prism from 'src/components/Facets/Prism/Prism'
import Tinter from 'src/components/Facets/Tinter/Tinter'
import RoomTypeDetector from 'src/components/Facets/RoomTypeDetector/RoomTypeDetector'

export const allFacets = {
  ColorDetailsFacet,
  ColorListingPage,
  ColorWallFacet,
  ColorFamilyFacet,
  ColorVisualizerWrapper,
  FastMaskSimple,
  Prism,
  Tinter,
  RoomTypeDetector
}

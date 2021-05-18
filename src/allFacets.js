/**
 * IMPORTANT!!!
 * The facets imported here need to match what is in webpack/constants.js until further notice
 */

import ColorDetailsFacet from 'src/components/Facets/ColorDetailsFacet'
import ColorFamilyFacet from 'src/components/Facets/ColorFamilyFacet/ColorFamilyFacet'
import ColorListingPage from 'src/components/Facets/ColorListingPage/ColorListingPage'
import ColorVisualizer from 'src/components/Facets/ColorVisualizerWrapper/ColorVisualizerWrapper'
import ColorWallFacet from 'src/components/Facets/ColorWallFacet'
import FastMaskSimple from 'src/components/Facets/FastMaskSimple/FastMaskSimple'
import JumpStartFacet from 'src/components/Facets/JumpStartFacet/JumpStartFacet'
import RoomTypeDetector from 'src/components/Facets/RoomTypeDetector/RoomTypeDetector'

export const allFacets = {
  ColorDetailsFacet,
  ColorFamilyFacet,
  ColorListingPage,
  ColorVisualizer,
  ColorWallFacet,
  FastMaskSimple,
  JumpStartFacet,
  RoomTypeDetector
}

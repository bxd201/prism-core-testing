/**
 * IMPORTANT!!!
 * The facets imported here need to match what is in webpack/constants.js until further notice
 */

import ColorDetailsFacet from 'src/components/Facets/ColorDetailsFacet'
import ColorFamilyFacet from 'src/components/Facets/ColorFamilyFacet/ColorFamilyFacet'
import ColorListingPage from 'src/components/Facets/ColorListingPage/ColorListingPage'
import ColorVisualizer from 'src/components/Facets/ColorVisualizerWrapper/ColorVisualizerWrapper'
import ColorWallFacet from 'src/components/Facets/ColorWallFacet'
import ColorWallChunkChipFacet from 'src/components/Facets/ColorWallChunkChipFacet'
import FastMaskSimple from 'src/components/Facets/FastMaskSimple/FastMaskSimple'
import JumpStartFacet from 'src/components/Facets/JumpStartFacet/JumpStartFacet'
import RoomTypeDetector from 'src/components/Facets/RoomTypeDetector/RoomTypeDetector'
import SceneVisualizerFacet from 'src/components/Facets/SceneVisualizerFacet'
import TabbedSceneVisualizerFacet from 'src/components/Facets/TabbedSceneVisualizerFacet'

export const allFacets = {
  ColorDetailsFacet,
  ColorFamilyFacet,
  ColorListingPage,
  ColorVisualizer,
  ColorWallFacet,
  ColorWallChunkChipFacet,
  FastMaskSimple,
  JumpStartFacet,
  RoomTypeDetector,
  SceneVisualizerFacet,
  TabbedSceneVisualizerFacet
}

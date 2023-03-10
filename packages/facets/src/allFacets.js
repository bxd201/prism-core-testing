/**
 * IMPORTANT!!!
 * The facets imported here need to match what is in webpack/constants.js until further notice
 */

import ColorDetailsFacet from 'src/components/Facets/ColorDetailsFacet'
import ColorFamilyFacet from 'src/components/Facets/ColorFamilyFacet/ColorFamilyFacet'
import ColorListingPage from 'src/components/Facets/ColorListingPage/ColorListingPage'
import ColorSearchFacet from 'src/components/Facets/ColorSearchFacet/ColorSearchFacet'
import ColorVisualizer from 'src/components/Facets/ColorVisualizerWrapper/ColorVisualizerWrapper'
import ColorWallChunkChipFacet from 'src/components/Facets/ColorWallChunkChipFacet/ColorWallChunkChipFacet'
import ColorWallFacet from 'src/components/Facets/ColorWallFacet'
import FastMaskSimple from 'src/components/Facets/FastMaskSimple/FastMaskSimple'
import JumpStartFacet from 'src/components/Facets/JumpStartFacet/JumpStartFacet'
import RealColorFacet from 'src/components/Facets/RealColorFacet'
import RoomTypeDetector from 'src/components/Facets/RoomTypeDetector/RoomTypeDetector'
import SceneVisualizerFacet from 'src/components/Facets/SceneVisualizerFacet'
import TabbedSceneVisualizerFacet from 'src/components/Facets/TabbedSceneVisualizerFacet'
import ColorToolFacet from './components/Facets/ColorToolFacet/ColorToolFacet'
import ImageColorPickerFacet from './components/Facets/ImageColorPickerFacet/ImageColorPickerFacet'

export const allFacets = {
  ColorDetailsFacet,
  ColorFamilyFacet,
  ColorListingPage,
  ColorSearchFacet,
  ColorVisualizer,
  ColorWallFacet,
  ColorWallChunkChipFacet,
  FastMaskSimple,
  JumpStartFacet,
  RoomTypeDetector,
  SceneVisualizerFacet,
  TabbedSceneVisualizerFacet,
  RealColorFacet,
  ImageColorPickerFacet,
  ColorToolFacet
}

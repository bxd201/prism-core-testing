import { ForwardedRef } from 'react'
import { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { ColorId } from './components/color-wall/types'

export interface Color {
  blue: number
  brandKey: string
  colorFamilyNames?: string[]
  colorNumber: string
  coordinatingColors: {
    coord1ColorId?: number | string
    coord2ColorId?: number | string
    whiteColorId?: number | string
  }
  cssrgb?: string
  description?: string[]
  green: number
  hex: string
  hue: number
  id: ColorId
  isDark: boolean
  isExterior?: boolean
  isInterior?: boolean
  // @todo we may need to refactor a bunch of comps and test bc I think this required -RS
  lab?: {
    L: number
    A: number
    B: number
  }
  lightness: number
  name: string
  red: number
  rgb?: number
  saturation: number
  similarColors?: string[]
  storeStripLocator?: string
}

export interface MiniColor {
  brandKey: string
  id: string | number
  colorNumber: string | number
  red: number
  blue: number
  green: number
  L: number
  A: number
  B: number
  hex: string
}

// This is much more like a protocol than a classic type
export interface ReferenceDimensions {
  originalImageWidth: number
  originalImageHeight: number
  imageWidth: number
  imageHeight: number
  portraitWidth: number
  portraitHeight: number
  landscapeWidth: number
  landscapeHeight: number
  isPortrait: boolean
  originalIsPortrait: boolean
}

export interface Surface {
  id: number
  role?: string
  thumb?: string
  hitArea?: string
  shadows?: string
  highlights?: string
  surfaceBlobUrl?: string
}

export interface Variant {
  image: string
  thumb: string
  variant_name: string
  name: string
  surfaces: Surface[]
  normalizedImageValueCurve: string
}

export interface FlatScene {
  id: number
  width: number
  height: number
  variantNames: string[]
  // variants prop is only used during transformation and should not be used at rest!
  variants?: any[] | null
  sceneType: string
  uid: string
  description: string
}

export interface FlatVariant {
  sceneUid: string
  sceneId: number
  variantName: string
  sceneType: string
  // blob urls are not currently set when initialized but after they have been loaded
  surfaces: Surface[]
  image: string
  thumb: string
  normalizedImageValueCurve: string
  sceneCategories?: string[] | null
  expertColorPicks: number[] | null
  isFirstOfKind?: boolean
}

export interface BasicVariant {
  sceneUid: string
  sceneId: number
  variantName: string
  sceneType: string
  surfaces: Surface[]
  image: string
  thumb: string
}

export interface FastMaskOpenCache {
  scene: FlatScene
  variant: FlatVariant
  surfaceColors: MiniColor[]
}

export interface FastMaskWorkspace {
  palette: Color[]
  width: number
  height: number
  image: string
  surfaces: string[]
  surfaceColors: MiniColor[]
  variantName: string
  sceneType: string
}

export interface SceneAndVariant {
  sceneUid: string
  scenes: FlatScene[]
  variants: BasicVariant[]
}

export interface PreparedSurface {
  image: string
  surfaces: string[]
  width: number
  height: number
  surfaceColors: string[]
  variantName: string
  sceneType: string
}

export interface CustomIcon {
  icon?: IconDefinition
  label?: string
}

export interface ProcessedImageMetadata {
  imageHeight?: number
  imageWidth?: number
  isPortrait?: boolean
  landscapeHeight?: number
  landscapeWidth?: number
  originalImageHeight: number
  originalImageWidth: number
  originalIsPortrait: boolean
  portraitHeight?: number
  portraitWidth?: number
  url: string
}

export interface SwatchRendererProps {
  color: Color
  style: React.CSSProperties
  ref?: ForwardedRef<HTMLButtonElement & HTMLDivElement>
}

export type SwatchRenderer = React.FC<SwatchRendererProps>

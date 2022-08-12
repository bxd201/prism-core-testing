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
  lightness: number
  name: string
  red: number
  rgb?: number
  saturation: number
  similarColors?: string[]
  storeStripLocator?: string
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

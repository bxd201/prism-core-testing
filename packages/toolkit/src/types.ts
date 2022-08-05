export interface Color {
  id: string
  hex: string
  brandKey: string
  colorNumber: string
  coordinatingColors: {
    coord1ColorId?: string
    coord2ColorId?: string
    whiteColorId?: string
  }
  name: string
  red: number
  green: number
  blue: number
  hue: number
  saturation: number
  lightness: number
  ignore: boolean
  isDark: boolean
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

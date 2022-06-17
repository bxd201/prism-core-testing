export interface Color {
  id: number
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



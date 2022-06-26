export type ColorId = string

export interface Color {
  blue: number,
  brandKey: string,
  colorFamilyNames: string[],
  colorNumber: string,
  coordinatingColors: {
    coord1ColorId: number,
    coord2ColorId: number,
    whiteColorId: number
  },
  cssrgb: string,
  description: string[],
  green: number,
  hex: string,
  hue: number,
  id: ColorId,
  isDark: boolean,
  isExterior: boolean,
  isInterior: boolean,
  lightness: number,
  name: string,
  red: number,
  rgb: number,
  saturation: number,
  similarColors: string[],
  storeStripLocator?: string
}

// @flow
import _ from 'lodash'

import { type Color } from '../../../src/shared/types/Colors'

export const Colors: Array<Color> = [
  {
    blue: 110,
    brandKey: "SW",
    colorFamilyNames: ["Blue"],
    colorNumber: "6987",
    coordinatingColors: {coord2ColorId: 2698, coord1ColorId: 2695, whiteColorId: 2686},
    csshsl: "hsl(162,99%,31%)",
    cssrgb: "rgb(1,157,110)",
    description: ["Intense", "Dusky", "Fairly Dark"],
    green: 157,
    hex: "#019d6e",
    hue: 0.4497863247863248,
    id: 2673,
    isDark: false,
    isExterior: false,
    isInterior: true,
    lightness: 0.30980392156862746,
    name: "Jitterbug Jade",
    opacity: "SW6987_OPACITY",
    red: 1,
    rgb: 105838,
    saturation: 0.9873417721518988,
    smis: "650506835",
    storeStripLocator: "161-C1"
  },
  {
    blue: 62,
    brandKey: "SW",
    colorFamilyNames: ["Orange"],
    colorNumber: "6885",
    coordinatingColors: {coord2ColorId: 2711, coord1ColorId: 2872, whiteColorId: 2015},
    csshsl: "hsl(18,73%,56%)",
    cssrgb: "rgb(225,111,62)",
    description: ["Rich", "Vibrant", "Fairly Bright"],
    green: 111,
    hex: "#e16f3e",
    hue: 0.05010224948875256,
    id: 2572,
    isDark: false,
    isExterior: false,
    isInterior: true,
    lightness: 0.5627450980392157,
    name: "Knockout Orange",
    opacity: "SW6885_OPACITY",
    red: 225,
    rgb: 14774078,
    saturation: 0.7309417040358743,
    smis: "650503683",
    storeStripLocator: "116-C3"
  },
  {
    blue: 197,
    brandKey: "SW",
    colorFamilyNames: ["White & Pastel"],
    colorNumber: "6406",
    coordinatingColors: {coord2ColorId: 3011, coord1ColorId: 2094, whiteColorId: 2686},
    csshsl: "hsl(46,41%,84%)",
    cssrgb: "rgb(231,223,197)",
    description: ["Fairly Colorful", "Moderately Colorful", "Brilliant", "Radiant"],
    green: 223,
    hex: "#e7dfc5",
    hue: 0.12745098039215685,
    id: 2092,
    isDark: false,
    isExterior: true,
    isInterior: true,
    lightness: 0.8392156862745098,
    name: "Ionic Ivory",
    opacity: "SW6406_OPACITY",
    red: 231,
    rgb: 15196101,
    saturation: 0.41463414634146334,
    smis: "650501547",
    storeStripLocator: "269-C2"
  }
]

export function getColors (): Array<Color> {
  return _.cloneDeep(Colors)
}

export function getColor (): Color {
  return _.sample(getColors())
}
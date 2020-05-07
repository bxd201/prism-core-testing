// @flow
import { getDeltaE00 } from 'delta-e'
import tinycolor from '@ctrl/tinycolor'

export const throttleDragTime = 5
// we need this two const to make sure cursor always point to the center of preview circle
export const activedPinsHalfWidth = 24

export const getRGBInitPins = (acgColors: Array<Object>) => {
  return acgColors.map<Object>((acgColor: any): Object => {
    return {
      rgbArray: [acgColor.r, acgColor.g, acgColor.b],
      rgbValue: `rgb(${acgColor.r},${acgColor.g},${acgColor.b})`,
      translateValueX: acgColor.x,
      translateValueY: acgColor.y
    }
  })
}

export const rgb2lab = (rgb: Array<any>) => {
  let r = rgb[0] / 255
  let g = rgb[1] / 255
  let b = rgb[2] / 255
  let x; let y; let z

  r = (r > 0.04045) ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92
  g = (g > 0.04045) ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92
  b = (b > 0.04045) ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92

  x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047
  y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.00000
  z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883

  x = (x > 0.008856) ? Math.pow(x, 1 / 3) : (7.787 * x) + 16 / 116
  y = (y > 0.008856) ? Math.pow(y, 1 / 3) : (7.787 * y) + 16 / 116
  z = (z > 0.008856) ? Math.pow(z, 1 / 3) : (7.787 * z) + 16 / 116

  return [(116 * y) - 16, 500 * (x - y), 200 * (y - z)]
}

export const renderingPins = (initPins: Array<Object>, canvasOffsetWidth: number, canvasOffsetHeight: number, brandColors: Array) => {
  const RGBinitPins = getRGBInitPins(initPins)
  return RGBinitPins.map<Object>((acgColor: any, index: number): Object => {
    const calculateTranslateX = acgColor.translateValueX * canvasOffsetWidth
    const calculateTranslateY = acgColor.translateValueY * canvasOffsetHeight
    const arrayIndex = findBrandColor(acgColor.rgbArray, brandColors)
    const rgbValueBrandColor = 'rgb(' + brandColors[arrayIndex + 2] + ')'
    let isContentLeft = false
    if (calculateTranslateX < canvasOffsetWidth / 2) {
      isContentLeft = true
    }
    return {
      isActiveFlag: (initPins.length - 1 === index),
      colorName: brandColors[arrayIndex],
      colorNumber: brandColors[arrayIndex + 1],
      rgbValue: rgbValueBrandColor,
      pinNumber: index,
      isContentLeft: isContentLeft,
      translateX: calculateTranslateX,
      translateY: calculateTranslateY
    }
  })
}

export const findBrandColorWithDeltaE00 = (currentPixelRGB: Array<number>, brandColors: Array) => {
  let currentPixelInLABarray = rgb2lab(currentPixelRGB)
  let theMostCloseDistance = 100
  let index = 0
  let currentPixelInLAB = { L: currentPixelInLABarray[0], A: currentPixelInLABarray[1], B: currentPixelInLABarray[2] }
  for (let arrayIndex = 0; arrayIndex < brandColors.length; arrayIndex += 6) {
    let thisSWinLAB = { L: brandColors[arrayIndex + 3], A: brandColors[arrayIndex + 4], B: brandColors[arrayIndex + 5] }
    let colorDistance = getDeltaE00(currentPixelInLAB, thisSWinLAB)
    if (colorDistance < theMostCloseDistance) {
      theMostCloseDistance = colorDistance
      index = arrayIndex
    }
  }
  return index
}

export const findBrandColor = (currentPixelRGB: Array<number>, brandColors: Array) => {
  const currentPixelHex = tinycolor(`rgb (${currentPixelRGB[0]}, ${currentPixelRGB[1]}, ${currentPixelRGB[2]})`).toHex()
  let minDistance
  const n = brandColors.length
  let index = 0
  for (let brandColorsIndex = 0; brandColorsIndex < n; brandColorsIndex += 6) {
    const brandColorHex = tinycolor(`rgb (${brandColors[brandColorsIndex + 2]})`).toHex()
    const distance = measureDistance(currentPixelHex, brandColorHex)
    if (typeof minDistance === 'undefined' || distance < minDistance) {
      minDistance = distance
      index = brandColorsIndex
    }
  }
  return index
}

export const measureDistance = (color1: string, color2: string) => {
  const position1 = getChromaLuma(color1)
  const position2 = getChromaLuma(color2)
  const redDelta = position1[0] - position2[0]
  const greenDelta = position1[1] - position2[1]
  const lumaDelta = position1[2] - position2[2]
  const distance = redDelta * redDelta + greenDelta * greenDelta + lumaDelta * lumaDelta
  return distance
}

export const getChromaLuma = (rgbString: string) => {
  const color = tinycolor(rgbString)
  const luminosity = color.getLuminance()
  const colorRgb = color.toRgb()
  const red = colorRgb.r
  const green = colorRgb.g
  const blue = colorRgb.b
  const sum = red + green + blue
  let redChroma
  let greenChroma
  if (sum > 25) {
    redChroma = red / sum
    greenChroma = green / sum
  } else {
    redChroma = 1 / 3
    greenChroma = 1 / 3
  }

  return [redChroma, greenChroma, luminosity]
}

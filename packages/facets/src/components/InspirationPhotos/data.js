// @flow
import tinycolor from '@ctrl/tinycolor'
import { type Color } from 'src/shared/types/Colors.js.flow'
import uniqueId from 'lodash/uniqueId'

export const throttleDragTime = 5
// we need this two const to make sure cursor always point to the center of preview circle
export const activedPinsHalfWidth = 24

export const cloneColorPinsArr = (pins) => {
  return pins.map(pin => ({ ...pin }))
}

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

export type RenderingPin = {
  isActiveFlag: boolean,
  name: string,
  colorNumber: number,
  rgbValue: string,
  pinNumber: number,
  isContentLeft: boolean,
  translateX: number,
  translateValueY: number,
  pinId: string
}

export const renderingPins = (initPins: Array<Object>, canvasOffsetWidth: number, canvasOffsetHeight: number, colors: Color[]): RenderingPin[] => {
  return getRGBInitPins(initPins).map<Object>((acgColor: any, index: number): Object => {
    const color: Color = findClosestColor(acgColor.rgbArray, colors)
    const calculateTranslateX = acgColor.translateValueX * canvasOffsetWidth
    const calculateTranslateY = acgColor.translateValueY * canvasOffsetHeight

    return {
      ...color,
      isActiveFlag: (initPins.length - 1 === index),
      rgbValue: `rgb(${color.red},${color.green},${color.blue})`,
      pinNumber: index,
      pinId: uniqueId('pin_'),
      isContentLeft: calculateTranslateX < canvasOffsetWidth / 2,
      translateX: Math.min(canvasOffsetWidth - 2 * activedPinsHalfWidth, calculateTranslateX),
      translateY: Math.min(canvasOffsetHeight - 2 * activedPinsHalfWidth, calculateTranslateY)
    }
  })
}

export const findClosestColor = ([red, green, blue]: [number, number, number], colors: Color[]): Color => {
  const currentPixelHex: string = tinycolor(`rgb (${red}, ${green}, ${blue})`).toHex()

  return colors.reduce(([closestColor, smallestDistanceSoFar], color): [Color, number] => {
    const colorDistance: number = measureDistance(currentPixelHex, tinycolor(`rgb(${color.red},${color.green},${color.blue})`).toHex())
    return colorDistance < smallestDistanceSoFar ? [color, colorDistance] : [closestColor, smallestDistanceSoFar]
  }, [colors[0], 99999])[0]
}

export const measureDistance = (color1: string, color2: string): number => {
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

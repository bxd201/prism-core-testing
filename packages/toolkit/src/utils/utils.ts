import { Color } from '../types'

// code lifted from https://github.com/antimatter15/rgb-lab/blob/master/color.js
export function deltaE(labA: [number, number, number], labB: [number, number, number]): number {
  const deltaL = labA[0] - labB[0]
  const deltaA = labA[1] - labB[1]
  const deltaB = labA[2] - labB[2]
  const c1 = Math.sqrt(labA[1] * labA[1] + labA[2] * labA[2])
  const c2 = Math.sqrt(labB[1] * labB[1] + labB[2] * labB[2])
  const deltaC = c1 - c2
  let deltaH = deltaA * deltaA + deltaB * deltaB - deltaC * deltaC
  deltaH = deltaH < 0 ? 0 : Math.sqrt(deltaH)
  const sc = 1.0 + 0.045 * c1
  const sh = 1.0 + 0.015 * c1
  const deltaLKlsl = deltaL / 1.0
  const deltaCkcsc = deltaC / sc
  const deltaHkhsh = deltaH / sh
  const i = deltaLKlsl * deltaLKlsl + deltaCkcsc * deltaCkcsc + deltaHkhsh * deltaHkhsh

  return i < 0 ? 0 : Math.sqrt(i)
}

export const findClosestColor = (targetRGB?: Uint8ClampedArray, colors: Color[] = []): Color | null => (
  targetRGB !== undefined
    ? colors.reduce(
        (acc: { color: Color | null; distance: number }, color: Color) => {
          const targetLAB = rgb2lab(targetRGB)
          const sourceLAB = rgb2lab(new Uint8ClampedArray([color.red, color.green, color.blue]))
          const distance = deltaE(targetLAB, sourceLAB)

          return distance < acc.distance ? { color, distance } : acc
        },
        { color: null, distance: 9999 }
      ).color
    : null
)

export const getCanvasTransformParams = (angle: number = 0, width: number, height: number): { [key: string]: number } => {
  let canvasHeight = 0
  let canvasWidth = 0
  const hScale = 1
  const hSkew = 0
  let hTrans = 0
  let rotation = (angle * (2 * Math.PI)) / 360
  const vScale = 1
  const vSkew = 0
  let vTrans = 0

  switch (angle) {
    case 90:
    case -270:
      canvasHeight = width
      canvasWidth = height
      hTrans = width
      break
    case 180:
    case -180:
      canvasHeight = height
      canvasWidth = width
      hTrans = width
      vTrans = height
      break
    case 270:
    case -90:
      canvasHeight = width
      canvasWidth = height
      vTrans = height
      break
    default: // 0 degrees
      canvasHeight = height
      canvasWidth = width
      rotation = 0
  }

  return { canvasHeight, canvasWidth, hScale, hSkew, hTrans, rotation, vScale, vSkew, vTrans }
}

/**
 * @file functions to be used by components, everything in this file could end up in the production bundle.
 * for util functions only used by tests or stories, use `src/test-utils/test-utils`
 */

/**
 * @description Measures the luminosity of a hex color
 * @param {string} hex # + hex color
 * @returns {number} Range between 0 and 255
 */
export const getLuminosity = (hex?: string): number => {
  if (hex === '' || hex === undefined) return 0
  const rgb = parseInt(hex.substring(1), 16)
  const r = (rgb >> 16) & 0xff
  const g = (rgb >> 8) & 0xff
  const b = (rgb >> 0) & 0xff

  return Math.round(0.2126 * r + 0.7152 * g + 0.0722 * b)
}

// code lifted from https://github.com/antimatter15/rgb-lab/blob/master/color.js
export function rgb2lab(rgb: Uint8ClampedArray): [number, number, number] {
  let r = rgb[0] / 255
  let g = rgb[1] / 255
  let b = rgb[2] / 255
  let x
  let y
  let z

  r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92
  g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92
  b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92

  x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047
  y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.0
  z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883

  x = x > 0.008856 ? Math.pow(x, 1 / 3) : 7.787 * x + 16 / 116
  y = y > 0.008856 ? Math.pow(y, 1 / 3) : 7.787 * y + 16 / 116
  z = z > 0.008856 ? Math.pow(z, 1 / 3) : 7.787 * z + 16 / 116

  return [116 * y - 16, 500 * (x - y), 200 * (y - z)]
}

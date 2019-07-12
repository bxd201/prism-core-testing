/* eslint-disable */
// @flow
import mean from 'lodash/mean'
import toNumber from 'lodash/toNumber'
import clamp from 'lodash/clamp'
import _ from 'lodash'

import { significantFigures } from '../../../shared/helpers/DataUtils'
import { tinycolor, getHueRangeNumber, getDegreeDistance } from '../../../shared/helpers/ColorDataUtils'

declare var self: DedicatedWorkerGlobalScope;

const ALPHA_THRESHOLD = 50

// minimum allowed brightness value
const LUMINANCE_MIN_VALUE = 0.15
const LUMINANCE_MAX_VALUE = 0.75
const IS_LIGHT_MIN_VALUE = 190
const HUE_NORMALIZATION_STEP = 12
const HUE_NORMALIZATION_STEP_DEG = 360 / HUE_NORMALIZATION_STEP

self.addEventListener('message', (e: Object) => {
  const { image: img, masks } = e.data

  const setStatus = getStatusMessage(masks.length + 1)

  let pixelData = []
  let meanLuminance = 0
  let medianLuminance = 0
  let avgExtremeLuminance = 0
  let meanBrightness = 0
  let medianBrightness = 0
  let avgExtremeBrightness = 0
  let meanLightness = 0
  let medianLightness = 0
  let avgExtremeLightness = 0
  let lightRatio = 0
  const maskBrightnessData = []

  setStatus(0)

  // gather ALL our image data here; we'll refer to it later on a pixel-by-pixel basis to gather mask info
  runPerImagePixel(img, (i) => {
    const tc = tinycolor(`rgb(${img[i]}, ${img[i + 1]}, ${img[i + 2]})`)
    const hsl = tc.toHsl()
    const bright = Math.round(tc.getBrightness()) // 0-255
    const lum = significantFigures(tc.getLuminance(), 4) // 4 signficant figures
    const l = significantFigures(hsl.l, 2) // 3 signficant figures
    const h = significantFigures(hsl.h, 2) // 3 signficant figures

    pixelData.push({
      brightness: bright,
      luminance: lum,
      lightness: l,
      hue: h
    })
  })

  setStatus(0.5)

  meanLuminance = meanFrom(pixelData, 'luminance')
  meanBrightness = meanFrom(pixelData, 'brightness')
  meanLightness = meanFrom(pixelData, 'lightness')

  setStatus(0.66)

  avgExtremeLuminance = avgExtremeFrom(pixelData, 'luminance')
  avgExtremeBrightness = avgExtremeFrom(pixelData, 'brightness')
  avgExtremeLightness = avgExtremeFrom(pixelData, 'lightness')

  setStatus(0.75)

  medianLuminance = medianFrom(pixelData, 'luminance')
  medianBrightness = medianFrom(pixelData, 'brightness')
  medianLightness = medianFrom(pixelData, 'lightness')

  setStatus(1)

  // ---------------------------------------------------------------------------
  // BEGIN PER-SURFACE OPERATIONS
  // ---------------------------------------------------------------------------

  masks.forEach((mask, i) => {
    const maskPixelData = []
    const maskPixelIndices = []
    const hueGroups = []
    let maxLum = 0
    let lumToAlphaMultiplier = 1

    setStatus(i + 1 + 0.25)

    // TODO: store a map of masked pixel indices for faster future iteration?
    runPerImagePixel(mask, (i) => {
      const alpha = mask[i + 4]

      if (alpha >= ALPHA_THRESHOLD) {
        // matching index from our earlier pixelData collection
        const pixelIndex = Math.ceil(i / 4)
        const thisMaskPixelData = pixelData[pixelIndex]
        maskPixelIndices.push(pixelIndex)
        maskPixelData.push(thisMaskPixelData)
        maxLum = thisMaskPixelData.luminance > maxLum ? thisMaskPixelData.luminance : maxLum
      }
    })

    const maskPixelLength = maskPixelIndices.length

    setStatus(i + 1 + 0.33)

    const meanLuminance = meanFrom(maskPixelData, 'luminance')
    const meanBrightness = meanFrom(maskPixelData, 'brightness')
    const meanLightness = meanFrom(maskPixelData, 'lightness')
    const meanHue = meanFrom(maskPixelData, 'hue')

    setStatus(i + 1 + 0.5)

    const avgExtremeLuminance = avgExtremeFrom(maskPixelData, 'luminance')
    const avgExtremeBrightness = avgExtremeFrom(maskPixelData, 'brightness')
    const avgExtremeLightness = avgExtremeFrom(maskPixelData, 'lightness')
    const avgExtremeHue = avgExtremeFrom(maskPixelData, 'hue')

    setStatus(i + 1 + 0.66)

    const medianLuminance = medianFrom(maskPixelData, 'luminance')
    const medianBrightness = medianFrom(maskPixelData, 'brightness')
    const medianLightness = medianFrom(maskPixelData, 'lightness')
    const medianHue = medianFrom(maskPixelData, 'hue')

    // medianHue seems to really be our main color
    // so pass that value through hue-grouper, multiply out to get our center hue category value
    // then use that as a starting point to map out our hue mask
    const normalizedMedianHue = getHueRangeNumber(medianHue, HUE_NORMALIZATION_STEP) * HUE_NORMALIZATION_STEP_DEG

    const hunchIsLight = avgExtremeBrightness.mostCommon > IS_LIGHT_MIN_VALUE && meanBrightness > IS_LIGHT_MIN_VALUE && medianBrightness > IS_LIGHT_MIN_VALUE
    const hunchHasHighlight = ((lum, light) => {
      const { mostCommon, leastCommon } = lum
      // is the difference in luminosity extremes greater than .1?
      const bigLumDiff = Math.abs(mostCommon - leastCommon) > 0.1

      if (bigLumDiff) {
        // if the surface is NOT light and the most common lum avg is greater than least...
        if (light && mostCommon > leastCommon) {
          // consider there to be highlights
          return true
        }

        // if the surface is light and the least common lum avg is greater than most...
        if (!light && leastCommon > mostCommon) {
          // consider there to be highlights
          return true
        }
      }

      return false
    })(avgExtremeLuminance, hunchIsLight)

    setStatus(i + 1 + 0.75)

    if (hunchHasHighlight) {
      // this value is used to ensure highlighted areas are being masked more completely based on luminance
      lumToAlphaMultiplier = 1 / maxLum
    }

    const { highlightData, luminanceThreshold, hueData } = (() => {
      const luminanceThreshold = 0.8 * (medianLuminance + avgExtremeLuminance.mostCommon) / 2
      const highlightData = new Uint8ClampedArray(mask.length)
      const hueData = new Uint8ClampedArray(mask.length)

      maskPixelIndices.forEach(i => {
        const realIndex = i * 4
        const alpha = mask[i + 4]

        // matching index from our earlier pixelData collection
        const imagePixel = pixelData[i]

        // BEGIN LUM STUFF
        if (hunchHasHighlight) {
          const lum = imagePixel.luminance

          if (lum > luminanceThreshold) {
            const alpha = Math.min(parseInt(((lum - luminanceThreshold) / (1 - luminanceThreshold)) * 255 * lumToAlphaMultiplier, 10), 255)

            highlightData[realIndex] = 255
            highlightData[realIndex + 1] = 255
            highlightData[realIndex + 2] = 255
            highlightData[realIndex + 3] = alpha
          }
        }
        // END LUM STUFF

        // BEGIN HUE STUFF
        const h = imagePixel.hue
        // get distance between this hue and our normalized median
        const dist = getDegreeDistance(normalizedMedianHue, h)
        // how much of the spectrum is considered the intended wall color
        const sameSteps = 2
        // how much of the spectrum beyond the intended wall color will be considered a transition stage before no desaturation is applied
        const transSteps = 2
        const isSame = dist <= (sameSteps * HUE_NORMALIZATION_STEP_DEG)
        const isTrans = !isSame && dist <= ((sameSteps + transSteps) * HUE_NORMALIZATION_STEP_DEG)
        const hueAlpha = isSame ? 1 : isTrans ? (1 - clamp((dist - (HUE_NORMALIZATION_STEP_DEG * sameSteps)) / (HUE_NORMALIZATION_STEP_DEG * transSteps), 0, 1)) : 0

        hueData[realIndex] = 255
        hueData[realIndex + 1] = 255
        hueData[realIndex + 2] = 255
        hueData[realIndex + 3] = parseInt(hueAlpha * 255, 10)
      })

      return {
        luminanceThreshold,
        hueData: hueData.buffer,
        // pass only the buffer and reassemble into the correct view later to POTENTIALLY improve performance
        highlightData: highlightData.buffer
      }
    })()

    maskBrightnessData.push({
      meanLuminance,
      meanBrightness,
      meanLightness,
      meanHue,
      avgExtremeLuminance,
      avgExtremeBrightness,
      avgExtremeLightness,
      avgExtremeHue,
      medianLuminance,
      medianBrightness,
      medianLightness,
      medianHue,
      normalizedMedianHue,
      luminanceThreshold,
      highlightMap: highlightData,
      hueMap: hueData,
      hunches: {
        hasHighlight: hunchHasHighlight,
        isLight: hunchIsLight
      }
    })

    setStatus(i + 1 + 0.9)
  })

  self.postMessage({
    type: 'COMPLETE',
    payload: {
      pixelData,
      meanLuminance,
      medianLuminance,
      avgExtremeLuminance,
      meanBrightness,
      medianBrightness,
      avgExtremeBrightness,
      meanLightness,
      medianLightness,
      avgExtremeLightness,
      lightRatio,
      maskBrightnessData
    }
  }, maskBrightnessData.map(v => v.highlightMap).filter(v => v))

  // -------------------------------------------------------------------
  // FUNCTION DEFS
  // -------------------------------------------------------------------

  function runPerImagePixel (imageData: any, cb: Function) {
    const len = imageData.length

    for (let i = 0; i < len; i += 4) {
      cb(i)
    }
  }
})

function meanFrom (collection, prop) {
  return _(collection)
    .chain()
    .map(p => p[prop])
    .mean()
    .thru(v => significantFigures(v, 3))
    .value()
}

function avgExtremeFrom (collection, prop) {
  const values = _(collection)
    .chain()
    .groupBy(p => p[prop])
    .mapValues(a => a.length)
    .thru(obj => Object.keys(obj).map(p => {
      return {
        value: p,
        count: obj[p]
      }
    }))
    .sortBy('count')
    .map(p => toNumber(p.value))
    .value()

  const len = values.length
  const quarter = Math.round(len / 4)

  return {
    mostCommon: significantFigures(mean(values.slice(quarter * 3)), 3),
    leastCommon: significantFigures(mean(values.slice(0, quarter)), 3),
    loMid: significantFigures(mean(values.slice(quarter, quarter * 2)), 3),
    hiMid: significantFigures(mean(values.slice(quarter * 2, quarter * 3)), 3)
  }
}

function medianFrom (collection, prop) {
  return _(collection)
    .chain()
    .map(p => p[prop])
    .sortBy()
    .thru(arr => arr[Math.round(arr.length / 2)])
    .value()
}

function getStatusMessage (total) {
  return (howMany) => {
    self.postMessage({
      type: 'STATUS',
      payload: {
        pct: significantFigures(howMany / total, 2)
      }
    })
  }
}

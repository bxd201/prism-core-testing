// @flow
import tinycolor from '@ctrl/tinycolor'
import mean from 'lodash/mean'
import toNumber from 'lodash/toNumber'
import _ from 'lodash'

import { significantFigures } from '../../../shared/helpers/DataUtils'

declare var self: DedicatedWorkerGlobalScope;

const ALPHA_THRESHOLD = 50

self.addEventListener('message', (e: Object) => {
  const { image: img, masks } = e.data

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

  runPerImagePixel(img, (i) => {
    const tc = tinycolor(`rgb(${img[i]}, ${img[i + 1]}, ${img[i + 2]})`)
    const bright = Math.round(tc.getBrightness()) // 0-255
    const lum = significantFigures(tc.getLuminance(), 2) // 3 signficant figures
    const l = significantFigures(tc.toHsl().l, 2) // 3 signficant figures
    const isLight = tc.isLight()

    pixelData.push({
      brightness: bright,
      luminance: lum,
      lightness: l,
      isLight
    })
  })

  meanLuminance = meanFrom(pixelData, 'luminance')
  meanBrightness = meanFrom(pixelData, 'brightness')
  meanLightness = meanFrom(pixelData, 'lightness')
  avgExtremeLuminance = avgExtremeFrom(pixelData, 'luminance')
  avgExtremeBrightness = avgExtremeFrom(pixelData, 'brightness')
  avgExtremeLightness = avgExtremeFrom(pixelData, 'lightness')
  medianLuminance = medianFrom(pixelData, 'luminance')
  medianBrightness = medianFrom(pixelData, 'brightness')
  medianLightness = medianFrom(pixelData, 'lightness')

  masks.forEach(mask => {
    const maskPixelData = []

    runPerImagePixel(mask, (i) => {
      const alpha = mask[i + 4]

      if (alpha >= ALPHA_THRESHOLD) {
        // matching index from our earlier pixelData collection
        const pixelIndex = Math.ceil(i / 4)
        maskPixelData.push(pixelData[pixelIndex])
      }
    })

    const meanLuminance = meanFrom(maskPixelData, 'luminance')
    const meanBrightness = meanFrom(maskPixelData, 'brightness')
    const meanLightness = meanFrom(maskPixelData, 'lightness')
    const avgExtremeLuminance = avgExtremeFrom(maskPixelData, 'luminance')
    const avgExtremeBrightness = avgExtremeFrom(maskPixelData, 'brightness')
    const avgExtremeLightness = avgExtremeFrom(maskPixelData, 'lightness')
    const medianLuminance = medianFrom(maskPixelData, 'luminance')
    const medianBrightness = medianFrom(maskPixelData, 'brightness')
    const medianLightness = medianFrom(maskPixelData, 'lightness')
    const hunchIsLight = avgExtremeBrightness.mostCommon > 190 && meanBrightness > 190 && medianBrightness > 190
    const hunchHasHighlight = ((lum, light) => {
      const { mostCommon, leastCommon } = lum
      // is the difference in luminosity extremes greater than .1?
      const bigLumDiff = Math.abs(mostCommon - leastCommon) > 0.1

      if (bigLumDiff) {
        // if the surface is NOT light and the most common lum avg is greater than least...
        if (!light && mostCommon > leastCommon) {
          // consider there to be highlights
          return true
        }

        // if the surface is light and the least common lum avg is greater than most...
        if (light && leastCommon < mostCommon) {
          // consider there to be highlights
          return true
        }
      }

      return false
    })(avgExtremeLuminance, hunchIsLight)

    maskBrightnessData.push({
      meanLuminance,
      meanBrightness,
      meanLightness,
      avgExtremeLuminance,
      avgExtremeBrightness,
      avgExtremeLightness,
      medianLuminance,
      medianBrightness,
      medianLightness,
      hunches: {
        hasHighlight: hunchHasHighlight,
        isLight: hunchIsLight
      }
    })
  })

  self.postMessage({
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
  })

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
    leastCommon: significantFigures(mean(values.slice(0, quarter)), 3)
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

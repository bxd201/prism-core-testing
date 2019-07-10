// @flow
import mean from 'lodash/mean'
import toNumber from 'lodash/toNumber'
import _ from 'lodash'

import { significantFigures } from '../../../shared/helpers/DataUtils'
import { tinycolor } from '../../../shared/helpers/ColorDataUtils'

declare var self: DedicatedWorkerGlobalScope;

const ALPHA_THRESHOLD = 50

// minimum allowed brightness value
const LUMINANCE_MIN_VALUE = 0.15
const LUMINANCE_MAX_VALUE = 0.75

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

  runPerImagePixel(img, (i) => {
    const tc = tinycolor(`rgb(${img[i]}, ${img[i + 1]}, ${img[i + 2]})`)
    const bright = Math.round(tc.getBrightness()) // 0-255
    const lum = significantFigures(tc.getLuminance(), 4) // 4 signficant figures
    const l = significantFigures(tc.toHsl().l, 2) // 3 signficant figures

    pixelData.push({
      brightness: bright,
      luminance: lum,
      lightness: l
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

  masks.forEach((mask, i) => {
    const maskPixelData = []

    setStatus(i + 1 + 0.25)

    runPerImagePixel(mask, (i) => {
      const alpha = mask[i + 4]

      if (alpha >= ALPHA_THRESHOLD) {
        // matching index from our earlier pixelData collection
        const pixelIndex = Math.ceil(i / 4)
        maskPixelData.push(pixelData[pixelIndex])
      }
    })

    setStatus(i + 1 + 0.33)

    const meanLuminance = meanFrom(maskPixelData, 'luminance')
    const meanBrightness = meanFrom(maskPixelData, 'brightness')
    const meanLightness = meanFrom(maskPixelData, 'lightness')

    setStatus(i + 1 + 0.5)

    const avgExtremeLuminance = avgExtremeFrom(maskPixelData, 'luminance')
    const avgExtremeBrightness = avgExtremeFrom(maskPixelData, 'brightness')
    const avgExtremeLightness = avgExtremeFrom(maskPixelData, 'lightness')

    setStatus(i + 1 + 0.66)

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

    const { highlightData, luminanceThreshold } = (() => {
      if (hunchHasHighlight) {
        const LUMINANCE_THRESHOLD = _(maskPixelData)
          .chain()
          .map(v => v.luminance)
          .groupBy(v => `${v}`)
          .mapValues(a => significantFigures(a.length, 2))
          .thru(obj => Object.keys(obj).map(p => {
            return {
              luminance: parseFloat(p),
              count: obj[p]
            }
          }))
          .sortBy('luminance')
          .filter(v => v.luminance > LUMINANCE_MIN_VALUE)
          .reduce((pv, nv) => pv && pv.count > nv.count ? pv : nv, void (0))
          .get('luminance')
          .clamp(LUMINANCE_MIN_VALUE, LUMINANCE_MAX_VALUE)
          .thru(v => isNaN(v) ? LUMINANCE_MIN_VALUE : v)
          .value()

        // console.log('Surface luminance threshold detected:', LUMINANCE_THRESHOLD)

        const highlightData = new Uint8ClampedArray(mask.length)

        runPerImagePixel(mask, (i) => {
          const alpha = mask[i + 4]

          if (alpha >= ALPHA_THRESHOLD) {
            // matching index from our earlier pixelData collection
            const pixelIndex = Math.ceil(i / 4)
            const imagePixel = pixelData[pixelIndex]
            const lum = imagePixel.luminance

            if (lum > LUMINANCE_THRESHOLD) {
              const alpha = parseInt(((lum - LUMINANCE_THRESHOLD) / (1 - LUMINANCE_THRESHOLD)) * 255, 10)

              highlightData[i] = 255
              highlightData[i + 1] = 255
              highlightData[i + 2] = 255
              highlightData[i + 3] = alpha

              return
            }
          }

          highlightData[i] = 0
          highlightData[i + 1] = 0
          highlightData[i + 2] = 0
          highlightData[i + 3] = 0
        })

        return {
          luminanceThreshold,
          // pass only the buffer and reassemble into the correct view later to POTENTIALLY improve performance
          highlightData: highlightData.buffer
        }
      }

      return {
        luminanceThreshold: void (0),
        highlightData: void (0)
      }
    })()

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
      luminanceThreshold,
      highlightMap: highlightData,
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

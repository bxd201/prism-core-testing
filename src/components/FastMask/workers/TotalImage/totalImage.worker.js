// @flow
import clamp from 'lodash/clamp'
import sortBy from 'lodash/sortBy'

import { meanFrom, avgCommonFrom, medianFrom, sliceMeanFrom, runPerImagePixel } from './totalImage.utilities'
import { significantFigures, geometricMean, mapAlongSine, compress } from '../../../../shared/helpers/DataUtils'
import { tinycolor, getHueRangeNumber, getDegreeDistance } from '../../../../shared/helpers/ColorDataUtils'

import {
  INDIVIDUAL_COMP_RELATIVE_BRIGHTNESS_THRESHHOLD,
  INDIVIDUAL_COMP_ACB_THRESHHOLD,
  TGT_BRIGHTNESS,
  TGT_QUINTILE,
  PIXEL_REDUCTION_FACTOR,
  COMPLEX_OP_PIXEL_REDUCTION_FACTOR,
  MASK_ALPHA_THRESHOLD,
  LUMINANCE_THRESHOLD_MULTIPLIER,
  IS_LIGHT_MIN_VALUE,
  HUE_NORMALIZATION_STEP,
  HUE_NORMALIZATION_STEP_DEG } from './totalImage.constants'

declare var self: DedicatedWorkerGlobalScope;

self.addEventListener('message', (e: Object) => {
  const { image: img, masks } = e.data
  console.time('worker time elapsed')

  const surfaceCount = masks.length
  const imgLength = img.length
  const numPixels = imgLength / 4
  const setStatus = getStatusMessage(surfaceCount + 1)

  let meanLuminance = 0
  let medianLuminance = 0
  let avgCommonLuminance = 0
  let meanBrightness = 0
  let medianBrightness = 0
  let avgCommonBrightness = 0
  let meanLightness = 0
  let medianLightness = 0
  let avgCommonLightness = 0
  let lightRatio = 0
  const maskBrightnessData: any[] = []

  let brightnessMap: Uint8Array = new Uint8Array(numPixels) // ints
  let luminanceMap: Float32Array = new Float32Array(numPixels) // floats
  let lightnessMap: Float32Array = new Float32Array(numPixels) // floats
  let hueMap: Uint8Array = new Uint8Array(numPixels) // ints

  setStatus(0)
  // gather ALL our image data here; we'll refer to it later on a pixel-by-pixel basis to gather mask info
  runPerImagePixel(img, (i) => {
    const tc = tinycolor(`rgb(${img[i]}, ${img[i + 1]}, ${img[i + 2]})`)
    const hsl = tc.toHsl()
    const bright = Math.round(tc.getBrightness()) // 0-255
    const lum = significantFigures(tc.getLuminance(), 4) // 4 signficant figures
    const l = significantFigures(hsl.l, 2) // 3 signficant figures
    const h = significantFigures(hsl.h, 2) // 3 signficant figures
    const j = i / 4

    brightnessMap[j] = bright
    luminanceMap[j] = lum
    lightnessMap[j] = l
    hueMap[j] = h
  })

  setStatus(0.33)

  meanLuminance = meanFrom(luminanceMap, PIXEL_REDUCTION_FACTOR)
  meanBrightness = meanFrom(brightnessMap, PIXEL_REDUCTION_FACTOR)
  meanLightness = meanFrom(lightnessMap, PIXEL_REDUCTION_FACTOR)

  setStatus(0.5)

  avgCommonLuminance = avgCommonFrom(luminanceMap, COMPLEX_OP_PIXEL_REDUCTION_FACTOR)
  avgCommonBrightness = avgCommonFrom(brightnessMap, COMPLEX_OP_PIXEL_REDUCTION_FACTOR)
  avgCommonLightness = avgCommonFrom(lightnessMap, COMPLEX_OP_PIXEL_REDUCTION_FACTOR)

  setStatus(0.66)

  medianLuminance = medianFrom(luminanceMap, PIXEL_REDUCTION_FACTOR)
  medianBrightness = medianFrom(brightnessMap, PIXEL_REDUCTION_FACTOR)
  medianLightness = medianFrom(lightnessMap, PIXEL_REDUCTION_FACTOR)

  setStatus(0.75)

  const masterMaskPxIndices: number[][] = []

  // ---------------------------------------------------------------------------
  // BEGIN 1st-PASS PER-SURFACE OPERATIONS
  // ---------------------------------------------------------------------------
  masks.forEach((mask, i) => {
    let maxLum = 0
    let lumToAlphaMultiplier = 1
    let maskPxIndices: number[] = []

    runPerImagePixel(mask, (j) => {
      const alpha = mask[j + 4]

      if (alpha >= MASK_ALPHA_THRESHOLD) {
        const pixelIndex = Math.ceil(j / 4)
        maskPxIndices.push(pixelIndex)
      }
    })

    const numMaskPx: number = maskPxIndices.length

    let maskBrightnessMap: Uint8Array = new Uint8Array(numMaskPx) // ints
    let maskLuminanceMap: Float32Array = new Float32Array(numMaskPx) // floats
    let maskLightnessMap: Float32Array = new Float32Array(numMaskPx) // floats
    let maskHueMap: Uint8Array = new Uint8Array(numMaskPx) // ints

    masterMaskPxIndices[i] = maskPxIndices

    maskPxIndices.forEach((v: number, i: number) => {
      // matching index from our earlier pixelData collection
      const b: number = brightnessMap[v]
      const lum: number = luminanceMap[v]
      const li: number = lightnessMap[v]
      const hue: number = hueMap[v]

      maskBrightnessMap[i] = b
      maskLuminanceMap[i] = lum
      maskLightnessMap[i] = li
      maskHueMap[i] = hue

      maxLum = lum > maxLum ? lum : maxLum
    })

    const meanLuminance = meanFrom(maskLuminanceMap, PIXEL_REDUCTION_FACTOR)
    const meanBrightness = meanFrom(maskBrightnessMap, PIXEL_REDUCTION_FACTOR)
    const meanLightness = meanFrom(maskLightnessMap, PIXEL_REDUCTION_FACTOR)
    const meanHue = meanFrom(maskHueMap, PIXEL_REDUCTION_FACTOR)

    const avgCommonLuminance = avgCommonFrom(maskLuminanceMap, COMPLEX_OP_PIXEL_REDUCTION_FACTOR)
    const avgCommonBrightness = avgCommonFrom(maskBrightnessMap, COMPLEX_OP_PIXEL_REDUCTION_FACTOR)
    const avgCommonLightness = avgCommonFrom(maskLightnessMap, COMPLEX_OP_PIXEL_REDUCTION_FACTOR)
    const avgCommonHue = avgCommonFrom(maskHueMap, COMPLEX_OP_PIXEL_REDUCTION_FACTOR)

    const medianLuminance = medianFrom(maskLuminanceMap, PIXEL_REDUCTION_FACTOR)
    const medianBrightness = medianFrom(maskBrightnessMap, PIXEL_REDUCTION_FACTOR)
    const medianLightness = medianFrom(maskLightnessMap, PIXEL_REDUCTION_FACTOR)
    const medianHue = medianFrom(maskHueMap, PIXEL_REDUCTION_FACTOR)

    const sliceMeanBrightness = sliceMeanFrom(maskBrightnessMap, TGT_QUINTILE, COMPLEX_OP_PIXEL_REDUCTION_FACTOR)
    const sliceMeanLuminance = sliceMeanFrom(maskLuminanceMap, TGT_QUINTILE, COMPLEX_OP_PIXEL_REDUCTION_FACTOR)
    const sliceMeanLightness = sliceMeanFrom(maskLightnessMap, TGT_QUINTILE, COMPLEX_OP_PIXEL_REDUCTION_FACTOR)

    // medianHue seems to really be our main color
    // so pass that value through hue-grouper, multiply out to get our center hue category value
    // then use that as a starting point to map out our hue mask
    const normalizedMedianHue = getHueRangeNumber(medianHue, HUE_NORMALIZATION_STEP) * HUE_NORMALIZATION_STEP_DEG

    const hunchIsLight = avgCommonBrightness.mostCommon > IS_LIGHT_MIN_VALUE && meanBrightness > IS_LIGHT_MIN_VALUE && medianBrightness > IS_LIGHT_MIN_VALUE
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
    })(avgCommonLuminance, hunchIsLight)

    if (hunchHasHighlight) {
      // this value is used to ensure highlighted areas are being masked more completely based on luminance
      lumToAlphaMultiplier = 1 / maxLum
    }

    const { highlightData, luminanceThreshold, hueData } = (() => {
      // TODO: this COULD be a point of failure. if geometricMean receives 0s in its dataset, it will return NaN. it's up to us out here to either:
      // A) strip 0s from the dataset (provided that won't negatively impact what we're calculating)
      // B) use a different form of average-getting that handles 0s correctly
      const luminanceThreshold = LUMINANCE_THRESHOLD_MULTIPLIER * geometricMean([medianLuminance, avgCommonLuminance.mostCommon])
      const highlightData = new Uint8ClampedArray(mask.length)
      const hueData = new Uint8ClampedArray(mask.length)

      maskPxIndices.forEach(i => {
        const realIndex = i * 4

        // BEGIN LUM STUFF
        if (hunchHasHighlight) {
          const lum = luminanceMap[i]

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
        const h = hueMap[i]
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
        highlightData: highlightData.buffer
      }
    })()

    maskBrightnessData.push({
      meanLuminance,
      meanBrightness,
      meanLightness,
      meanHue,
      avgCommonLuminance,
      avgCommonBrightness,
      avgCommonLightness,
      avgCommonHue,
      medianLuminance,
      medianBrightness,
      medianLightness,
      medianHue,
      sliceMeanBrightness,
      sliceMeanLightness,
      sliceMeanLuminance,
      luminanceThreshold,
      highlightMap: highlightData,
      hueMap: hueData,
      hunches: {
        hasHighlight: hunchHasHighlight,
        isLight: hunchIsLight
      }
    })

    setStatus(1 + ((i + 1) / 2 * 0.9))
  })

  // ---------------------------------------------------------------------------
  // BEGIN 2nd-PASS PER-SURFACE OPERATIONS
  // ---------------------------------------------------------------------------
  // what are we doing here? is this getting the brightest wall?
  const brightestSurface = maskBrightnessData.reduce((prev, next: Object) => {
    if (!prev || next.meanBrightness > prev.meanBrightness) {
      return next
    }

    return prev
  }, null)

  if (!brightestSurface) {
    console.error('No brightest surfact, cannot proceed')
    // TODO: handle error of no brightest surface... this means no surfaces?
    return
  }

  function getBrightnessMultiplier (thisBrightness, tgtBrightness = TGT_BRIGHTNESS) {
    return tgtBrightness / (thisBrightness / 255) - 1
  }

  masks.forEach((mask, i) => {
    const thisBrightness = maskBrightnessData[i].meanBrightness
    const thisLum = maskBrightnessData[i].meanLuminance
    const thisACB: {
      [key: string]: number
    } = maskBrightnessData[i].avgCommonBrightness

    const maskPxIndices: number[] = masterMaskPxIndices[i]
    let brightnessMultiplier = getBrightnessMultiplier(brightestSurface.meanBrightness)

    // if thisLum and brightest lum are the same, don't bother -- this is the bright surface
    if (thisLum !== brightestSurface.meanLuminance) {
      const lumDiff = thisLum / brightestSurface.meanLuminance
      // $FlowIgnore - Flow doesn't know what's going on here, but we're geting the two largest num values in array form
      const brightestACBs: number[] = sortBy(Object.values(thisACB)).reverse().slice(0, 2)
      const ACBRatiosWithinThreshhold = brightestACBs.filter((v: number) => (thisACB.mostCommon / v) <= INDIVIDUAL_COMP_ACB_THRESHHOLD)

      if (lumDiff <= INDIVIDUAL_COMP_RELATIVE_BRIGHTNESS_THRESHHOLD &&
        ACBRatiosWithinThreshhold.length) {
        // we are assuming at this point that this wall is painted darker than our lightest wall and should be
        // lightened individually
        brightnessMultiplier = getBrightnessMultiplier(thisBrightness)
        console.log('This is an accent surface! Individual brightness compensation value is:', brightnessMultiplier)
      }
    }

    const { surfaceLighteningData } = (() => {
      const surfaceLighteningData = new Uint8ClampedArray(mask.length)

      console.log(`Target brightness: ${TGT_BRIGHTNESS}, Mean brightness: ${thisBrightness}, Brightness multiplier: ${brightnessMultiplier}`)

      maskPxIndices.forEach(v => {
        const realIndex = v * 4
        const b = brightnessMap[v] / 255 // current brightness % value
        const sineTranslation = mapAlongSine(b)
        const mult = sineTranslation * brightnessMultiplier
        const newValue = compress(compress(b * mult + b, 0.8, 1.5), 0.9, 1.5) // modified brightness % value

        // WARNING: this assumes the new value is, in fact, brighter. a negative value will darken our color. maybe that's okay? probably not something we want though.
        const tc = tinycolor(`rgb(${img[realIndex]}, ${img[realIndex + 1]}, ${img[realIndex + 2]})`).brighten((newValue - b) * 100)
        const rgb = tc.toRgb()

        surfaceLighteningData[realIndex] = rgb.r
        surfaceLighteningData[realIndex + 1] = rgb.g
        surfaceLighteningData[realIndex + 2] = rgb.b
        surfaceLighteningData[realIndex + 3] = 255
      })

      return {
        surfaceLighteningData: surfaceLighteningData.buffer
      }
    })()

    maskBrightnessData[i].surfaceLighteningData = surfaceLighteningData

    setStatus(2 + i)
  })

  // masks.forEach((mask, i) => {
  //   const d = maskBrightnessData[i]

  //   toExcel([
  //     i,
  //     d.meanBrightness,
  //     ,
  //     d.meanLightness,
  //     ,
  //     d.meanLuminance,
  //     ,
  //     d.sliceMeanBrightness.upper,
  //     d.sliceMeanBrightness.middle,
  //     d.sliceMeanBrightness.lower,
  //     d.sliceMeanLightness.upper,
  //     d.sliceMeanLightness.middle,
  //     d.sliceMeanLightness.lower,
  //     d.sliceMeanLuminance.upper,
  //     d.sliceMeanLuminance.middle,
  //     d.sliceMeanLuminance.lower,
  //     d.avgCommonBrightness.mostCommon,
  //     ,
  //     ,
  //     d.avgCommonBrightness.hiMid,
  //     d.avgCommonBrightness.loMid,
  //     d.avgCommonBrightness.leastCommon
  //   ])
  // })

  self.postMessage({
    type: 'COMPLETE',
    payload: {
      meanLuminance,
      medianLuminance,
      avgCommonLuminance,
      meanBrightness,
      medianBrightness,
      avgCommonBrightness,
      meanLightness,
      medianLightness,
      avgCommonLightness,
      lightRatio,
      maskBrightnessData
    }
  }, maskBrightnessData.map(v => v.highlightMap).filter(v => v))

  console.timeEnd('worker time elapsed')
})

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

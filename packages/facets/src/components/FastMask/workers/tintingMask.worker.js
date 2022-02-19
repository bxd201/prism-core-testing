// @flow
import tinycolor from '@ctrl/tinycolor'
import groupBy from 'lodash/groupBy'
import _ from 'lodash'

/* postMessage */
declare var self: DedicatedWorkerGlobalScope;

const ALPHA_THRESHOLD = 50

// size of brightness groups
// smaller number = higher fidelity, worse light concentration accuracy
// larger number = lower fidelity, better light concentration accuracy
const BRIGHTNESS_BRACKET_SIZE = 5

// minimum allowed brightness value
const LUMINANCE_MIN_VALUE = Math.round(255 * 0.15)
const LUMINANCE_MAX_VALUE = Math.round(255 * 0.75)

self.addEventListener('message', (e: Object) => {
  const { imageRGBAdata, imageMaskRgbaData } = e.data
  const len = imageMaskRgbaData.length

  const highlightData = new Uint8ClampedArray(len)
  const bValues = []
  const hValues = []
  const sValues = []
  const overallBrightnessLevel = 0 // -1 = dark; 0 = normal; 1 = bright
  const surfaceIsBright = []
  let surfaceBrightnessLevel = 0 // -1 = dark; 0 = normal; 1 = bright

  // gather hue, saturation, and brightness (not lightness... using perceived brightness for now)
  runPerMaskPixel(imageMaskRgbaData, i => {
    const tc = tinycolor(`"rgb(${imageRGBAdata[i]}, ${imageRGBAdata[i + 1]}, ${imageRGBAdata[i + 2]})"`)
    const hsl = tc.toHsl()
    // const bright = tc.getLuminance() // 0-1; may be more useful since it considers the color as well as its lightness?
    // const bright = Math.round(tc.greyscale().getLuminance() * 255) // greyscale first really knocks luminance down, which is
    // not what we want -- we'll be using these values to remove the multiplication mask and preserve color saturation

    const bright = Math.round(tc.getLuminance() * 255) // "visual" brightness, which is what we want here (maybe)

    bValues.push(bright)
    hValues.push(hsl.h)
    sValues.push(hsl.s)
  })

  const BRIGHTNESS_THRESHOLD = _(bValues)
    .chain()
    .groupBy(a => Math.round(a / BRIGHTNESS_BRACKET_SIZE) * BRIGHTNESS_BRACKET_SIZE)
    .mapValues(a => a.length)
    .thru(obj => Object.keys(obj).map(p => {
      return {
        brightness: parseInt(p, 10),
        count: obj[p]
      }
    }))
    .sortBy('brightness')
    .filter(v => v.brightness > LUMINANCE_MIN_VALUE)
    .reduce((pv, nv) => pv && pv.count > nv.count ? pv : nv, void (0))
    .get('brightness')
    .clamp(LUMINANCE_MIN_VALUE, LUMINANCE_MAX_VALUE)
    .thru(v => isNaN(v) ? LUMINANCE_MIN_VALUE : v)
    .value()

  console.log('Surface brightness threshold detected:', BRIGHTNESS_THRESHOLD)

  runPerImagePixel(imageRGBAdata, i => {
    const tc = tinycolor(`"rgb(${imageRGBAdata[i]}, ${imageRGBAdata[i + 1]}, ${imageRGBAdata[i + 2]})"`)
    // const bright = tc.getLuminance() // 0-1; may be more useful since it considers the color as well as its lightness?
    const isLight = tc.isLight() // "visual" brightness, used for mask alpha calculations among other things

    // overallIsBright.push(isLight)

    const maskAlpha = imageMaskRgbaData[i + 3]
    if (maskAlpha > ALPHA_THRESHOLD) {
      surfaceIsBright.push(isLight)
    }
  })

  surfaceBrightnessLevel = ((isBright) => {
    const brightGroups = groupBy(isBright)
    const brightRatio = brightGroups.true.length / brightGroups.false.length
    console.log('surface brightness ratio:', brightRatio)
    return brightRatio > 1.5 ? 1 : brightRatio < 0.5 ? -1 : 0
  })(surfaceIsBright)

  console.log('Surface brightness level:', surfaceBrightnessLevel)

  runPerMaskPixel(imageMaskRgbaData, i => {
    const tc = tinycolor(`"rgb(${imageRGBAdata[i]}, ${imageRGBAdata[i + 1]}, ${imageRGBAdata[i + 2]})"`)
    const bright = Math.round(tc.getLuminance() * 255) // "visual" brightness, used for mask alpha calculations among other things

    bValues.push(bright)

    if (bright > BRIGHTNESS_THRESHOLD) {
      const alpha = Math.ceil(((bright - BRIGHTNESS_THRESHOLD) / (255 - BRIGHTNESS_THRESHOLD)) * 255)
      highlightData[i] = 255
      highlightData[i + 1] = 255
      highlightData[i + 2] = 255
      highlightData[i + 3] = alpha
    } else {
      highlightData[i] = 0
      highlightData[i + 1] = 0
      highlightData[i + 2] = 0
      highlightData[i + 3] = 0
    }
  })

  self.postMessage({
    highlightMask: highlightData,
    brightnessLevel: overallBrightnessLevel,
    overallBrightnessLevel: overallBrightnessLevel
  })

  // -------------------------------------------------------------------
  // FUNCTION DEFS
  // -------------------------------------------------------------------

  function runPerMaskPixel (imageMaskData: any, cb: Function) {
    const len = imageMaskData.length

    for (let i = 0; i < len; i += 4) {
      const maskAlpha = imageMaskData[i + 3]

      if (maskAlpha > ALPHA_THRESHOLD) {
        cb(i)
      }
    }
  }

  function runPerImagePixel (imageData: any, cb: Function) {
    const len = imageData.length

    for (let i = 0; i < len; i += 4) {
      cb(i)
    }
  }
})

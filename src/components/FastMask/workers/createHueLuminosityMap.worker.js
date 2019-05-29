import tinycolor from '@ctrl/tinycolor'

/* global self, postMessage */

// -------------------------------------------------
// Save the luminosity values of the pixels from the natural image to an array.
// The alpha value of the corresponding pixel in the PNG-8 mask image is tested against the alphaInclusionThreshold.
// -------------------------------------------------
function createLuminosityMap (imageRGBAdata, imageMaskRgbaData) {
  const alphaInclusionThreshold = 20
  let entireImageIndex = 0
  let tintPlaneIndex = 0
  let imageLuminMap = []
  let tintPlaneLuminValues = []

  for (var i = 0; i < imageRGBAdata.length; i += 4) {
    if (imageMaskRgbaData[i + 3] > alphaInclusionThreshold) {
      const imageHSL = tinycolor(imageRGBAdata[i], imageRGBAdata[i + 1], imageRGBAdata[i + 2]).toHsl()

      imageLuminMap[entireImageIndex] = imageHSL.l
      tintPlaneLuminValues[tintPlaneIndex] = imageHSL.l

      tintPlaneIndex += 1
    } else {
      imageLuminMap[entireImageIndex] = 0
    }
    entireImageIndex += 1
  }

  return {
    imageLuminMap,
    tintPlaneLuminValues
  }
}

// -------------------------------------------------
// Sort the array of luminosity arrays and finds the median value of that array.
// For every Tint Plane pixel, write the luminosity difference between it and the median value to an array.
// -------------------------------------------------
function compileDistances (imageLuminMap, tintPlaneLuminValues, pixelCount) {
  tintPlaneLuminValues.sort((a, b) => a - b)

  const medianLuminAdjustment = 0
  const luminosityDiffMap = []
  const lowMiddle = Math.floor((tintPlaneLuminValues.length - 1) / 2)
  const highMiddle = Math.ceil((tintPlaneLuminValues.length - 1) / 2)
  const medianLuminosity = (tintPlaneLuminValues[lowMiddle] + tintPlaneLuminValues[highMiddle]) / 2 + medianLuminAdjustment

  for (var i = 0; i < pixelCount; i++) {
    if (imageLuminMap[i] !== 0) {
      luminosityDiffMap[i] = (imageLuminMap[i] - medianLuminosity) * 2.56 // Multiplying because luminosity values are 0 - 100, but we will want those to be 0-255 for RGBA
    } else {
      luminosityDiffMap[i] = 0
    }
  }

  return luminosityDiffMap
}

function drawShadowsHighlights (imageRGBAdata, luminosityDiffMap, pixelCount) {
  const shadowRGBvalue = 0 // Used to create shadows in an image used by the SVG filter
  const highlightRGBvalue = 255 // Used to create highlights in an image used by the SVG filter
  const source = new Uint8ClampedArray(imageRGBAdata)
  let hueIndex = 0

  for (var arrayIndex = 0; arrayIndex < pixelCount; arrayIndex += 4) {
    const RGBvalue = luminosityDiffMap[hueIndex] > 0 ? highlightRGBvalue : shadowRGBvalue

    source[arrayIndex] = RGBvalue
    source[arrayIndex + 1] = RGBvalue
    source[arrayIndex + 2] = RGBvalue
    source[arrayIndex + 3] = Math.abs(luminosityDiffMap[hueIndex])

    hueIndex += 1
  }

  return source
}

self.addEventListener('message', (e) => {
  const { imageRGBAdata, imageMaskRgbaData, pixelCount } = e.data

  const source = new Uint8ClampedArray(imageRGBAdata)
  const mask = new Uint8ClampedArray(imageMaskRgbaData)

  const { imageLuminMap, tintPlaneLuminValues } = createLuminosityMap(source, mask)
  const luminosityDiffMap = compileDistances(imageLuminMap, tintPlaneLuminValues, pixelCount)
  const imageRgbaWithShadows = drawShadowsHighlights(source, luminosityDiffMap, pixelCount)

  postMessage({
    imageData: imageRgbaWithShadows
  })
})

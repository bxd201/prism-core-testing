/* global self */

import tinycolor from '@ctrl/tinycolor'

// -------------------------------------------------
// Save the luminosity values of the pixels from the natural image to an array.
// The alpha value of the corresponding pixel in the PNG-8 mask image is tested against the alphaInclusionThreshold.
// -------------------------------------------------
function createLuminosityMap (imageRGBAdata, imageMaskRgbaData) {
  const alphaInclusionThreshold = 20
  let entireImageIndex = 0
  let tintPlaneIndex = 0

  const imageAlphaMap = []

  const imageHueMap = [] // The hue of each Tint Plane pixel, will be updated by hueDiffMap
  const tintPlaneHueValues = [] // The initial hue of each Tint Plane pixel, will be used to calculate hueDiffMap

  const imageSaturationMap = [] // The hue of each Tint Plane pixel, will be updated by hueDiffMap
  const tintPlaneSaturationValues = [] // The initial hue of each Tint Plane pixel, will be used to calculate hueDiffMap

  const imageLuminMap = [] // The luminosity of each Tint Plane pixel, will be updated by luminosityDiffMap
  const tintPlaneLuminosityValues = [] // The initial luminosity of each Tint Plane pixel, will be used to calculate luminosityDiffMap

  for (let i = 0; i < imageRGBAdata.length; i += 4) {
    if (imageMaskRgbaData[i + 3] > alphaInclusionThreshold) {
      const thisHueSatLumin = tinycolor(imageRGBAdata[i], imageRGBAdata[i + 1], imageRGBAdata[i + 2]).toHsl()
      const thisHue = thisHueSatLumin.h
      const thisSaturation = thisHueSatLumin.s
      const thisLum = thisHueSatLumin.l

      imageHueMap[entireImageIndex] = thisHue
      tintPlaneHueValues[tintPlaneIndex] = thisHue

      imageSaturationMap[entireImageIndex] = thisSaturation
      tintPlaneSaturationValues[tintPlaneIndex] = thisSaturation

      imageLuminMap[entireImageIndex] = thisLum
      tintPlaneLuminosityValues[tintPlaneIndex] = thisLum

      imageAlphaMap[entireImageIndex] = 1

      tintPlaneIndex += 1
    } else {
      imageAlphaMap[entireImageIndex] = 0
    }
    entireImageIndex += 1
  }

  return {
    imageAlphaMap,
    imageHueMap,
    tintPlaneHueValues,
    imageSaturationMap,
    tintPlaneSaturationValues,
    imageLuminMap,
    tintPlaneLuminosityValues
  }
}

// -------------------------------------------------
// Sort the array of luminosity arrays and finds the median value of that array.
// For every Tint Plane pixel, write the luminosity difference between it and the median value to an array.
// -------------------------------------------------
function compileDistances (imageAlphaMap, imageHueMap, tintPlaneHueValues, imageSaturationMap, tintPlaneSaturationValues, imageLuminMap, tintPlaneLuminosityValues, pixelCount) {
  console.log(imageAlphaMap)
  tintPlaneHueValues.sort((a, b) => a - b)
  tintPlaneSaturationValues.sort((a, b) => a - b)
  tintPlaneLuminosityValues.sort((a, b) => a - b)

  const lowMiddle = Math.floor((tintPlaneLuminosityValues.length - 1) / 2)
  const highMiddle = Math.ceil((tintPlaneLuminosityValues.length - 1) / 2)
  const medianHue = (tintPlaneHueValues[lowMiddle] + tintPlaneHueValues[highMiddle]) / 2
  const medianSaturation = (tintPlaneSaturationValues[lowMiddle] + tintPlaneSaturationValues[highMiddle]) / 2
  const medianLuminosity = (tintPlaneLuminosityValues[lowMiddle] + tintPlaneLuminosityValues[highMiddle]) / 2

  for (let i = 0; i < imageAlphaMap.length; i++) {
    if (imageAlphaMap[i] !== 0) {
      imageHueMap[i] = imageHueMap[i] - medianHue
      // if (imageHueMap[i] > 359) {
      //   imageHueMap[i] = imageHueMap[i] - 359
      // } else if (imageHueMap[i] < 0) {
      //   imageHueMap[i] = 359 + imageHueMap[i]
      // }

      if (imageHueMap[i] < 0) {
        imageHueMap[i] = 359 + imageHueMap[i]
      }

      imageSaturationMap[i] = Math.min(1, Math.max(0, imageSaturationMap[i] - medianSaturation))
      // if (imageSaturationMap[i] > 1) {
      //   imageSaturationMap[i] = 1
      // } else if (imageSaturationMap[i] < 0) {
      //   imageSaturationMap[i] = 0
      // }

      imageLuminMap[i] = Math.min(1, Math.max(0, imageLuminMap[i] - medianLuminosity))
      // imageLuminMap[i] = imageLuminMap[i] - medianLuminosity
      // if (imageLuminMap[i] > 1) {
      //   imageLuminMap[i] = 1
      // } else if (imageLuminMap[i] < 0) {
      //   imageLuminMap[i] = 0
      // }
    }
  }
  // console.log(imageSaturationMap)
  console.log(imageHueMap)

  return {
    imageHueMap,
    imageSaturationMap,
    imageLuminMap
  }
}

function drawShadowsHighlights (imageAlphaMap, imageRGBAdata, imageHueMap2, imageSaturationMap2, imageLuminMap2, pixelCount) {
  let pixelIndex = 0

  for (let arrayIndex = 0; arrayIndex < pixelCount; arrayIndex += 4) {
    if (imageAlphaMap[pixelIndex] > 0) {
      const pixelRGBA = tinycolor(`"hsl(${imageHueMap2[pixelIndex]}, ${imageSaturationMap2[pixelIndex]}%, ${imageLuminMap2[pixelIndex]}%)"`).toRgb()
      // if (pixelIndex > 20000 && pixelIndex < 20099) {
      //   console.log(imageHueMap2[pixelIndex])
      //   console.log(`hsl ${imageHueMap2[pixelIndex]}, ${imageSaturationMap2[pixelIndex]}, ${imageLuminMap2[pixelIndex]}`)
      //   console.log(pixelRGBA)
      // }

      imageRGBAdata[arrayIndex] = pixelRGBA.r
      imageRGBAdata[arrayIndex + 1] = pixelRGBA.g
      imageRGBAdata[arrayIndex + 2] = pixelRGBA.b
      imageRGBAdata[arrayIndex + 3] = 255
    }

    pixelIndex += 1
  }

  return imageRGBAdata
}

self.addEventListener('message', (e) => {
  const { imageRGBAdata, imageMaskRgbaData } = e.data
  // const pixelCount = imageRGBAdata / 4
  const { imageAlphaMap, imageHueMap, tintPlaneHueValues, imageSaturationMap, tintPlaneSaturationValues, imageLuminMap, tintPlaneLuminosityValues } = createLuminosityMap(imageRGBAdata, imageMaskRgbaData)
  const { imageHueMap: imageHueMap2, imageSaturationMap: imageSaturationMap2, imageLuminMap: imageLuminMap2 } = compileDistances(imageAlphaMap, imageHueMap, tintPlaneHueValues, imageSaturationMap, tintPlaneSaturationValues, imageLuminMap, tintPlaneLuminosityValues)
  const imageRgbaWithShadows = drawShadowsHighlights(imageAlphaMap, imageRGBAdata, imageHueMap2, imageSaturationMap2, imageLuminMap2)

  self.postMessage({
    imageData: imageRgbaWithShadows
  })
})

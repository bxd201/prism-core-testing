export function drawShadowsHighlights (imageRGBAdata, luminosityDiffMap, pixelCount) {
  const shadowRGBvalue = 0 // Used to create shadows in an image used by the SVG filter
  const highlightRGBvalue = 255 // Used to create highlights in an image used by the SVG filter

  let hueIndex = 0

  for (let arrayIndex = 0; arrayIndex < pixelCount; arrayIndex += 4) {
    const RGBvalue = luminosityDiffMap[hueIndex] > 0 ? highlightRGBvalue : shadowRGBvalue

    imageRGBAdata[arrayIndex] = RGBvalue
    imageRGBAdata[arrayIndex + 1] = RGBvalue
    imageRGBAdata[arrayIndex + 2] = RGBvalue
    imageRGBAdata[arrayIndex + 3] = Math.abs(luminosityDiffMap[hueIndex])

    hueIndex += 1
  }

  return imageRGBAdata
}

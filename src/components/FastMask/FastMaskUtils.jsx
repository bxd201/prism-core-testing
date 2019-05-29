export function loadImage (img) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.crossOrigin = 'Anonymous'
    image.onload = () => resolve(image)
    image.onerror = () => reject(Error(`Error loading ${img}`))

    image.src = img
  })
}

export function getImageRgbaData (img, width, height) {
  const elem = document.createElement('canvas')
  const ctx = elem.getContext('2d')

  elem.width = width
  elem.height = height

  ctx.drawImage(img, 0, 0)

  return ctx.getImageData(0, 0, width, height)
}

export function createCanvasElementWithData (data, width, height) {
  const elem = document.createElement('canvas')
  const ctx = elem.getContext('2d')

  elem.width = width
  elem.height = height

  ctx.putImageData(data, 0, 0)

  return elem
}

export function drawShadowsHighlights (imageRGBAdata, luminosityDiffMap, pixelCount) {
  const shadowRGBvalue = 0 // Used to create shadows in an image used by the SVG filter
  const highlightRGBvalue = 255 // Used to create highlights in an image used by the SVG filter

  let hueIndex = 0

  for (var arrayIndex = 0; arrayIndex < pixelCount; arrayIndex += 4) {
    const RGBvalue = luminosityDiffMap[hueIndex] > 0 ? highlightRGBvalue : shadowRGBvalue

    imageRGBAdata[arrayIndex] = RGBvalue
    imageRGBAdata[arrayIndex + 1] = RGBvalue
    imageRGBAdata[arrayIndex + 2] = RGBvalue
    imageRGBAdata[arrayIndex + 3] = Math.abs(luminosityDiffMap[hueIndex])

    hueIndex += 1
  }

  return imageRGBAdata
}

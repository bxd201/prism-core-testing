// @flow

// export const POSITION_ENUM = {
//   TOP: 'TOP',
//   MIDDLE: 'MIDDLE',
//   BOTTOM: 'BOTTOM',
//   LEFT: 'LEFT',
//   CENTER: 'CENTER',
//   RIGHT: 'RIGHT'
// }

export function extractRefDimensions(data: any) {
  return Object.keys(data).reduce((acc, curr) => {
    if (curr !== 'url') {
      acc[curr] = data[curr]
    }
    return acc
  }, {})
}

/**
 *
 * @param subject: number - The number to check
 * @param control: number - the base number you are comparing the subject to
 * @param threshold: number - the amount to pad the control with for the comparison
 */
function plusOrMinus(subject: number, control: number, threshold: number) {
  const range = [control - threshold, control + threshold]

  return subject >= range[0] && subject <= range[1]
}

function cropWithCanvas(data: ImageData, x: number, y: number, w: number, h: number) {
  // use a plus/minus of 2 pixel as a threshold to determine  if crop should happen
  // we round during resize to discard the fraction pixels that may arise
  if (plusOrMinus(data.width, w, 2) && plusOrMinus(data.height, h, 2)) {
    return new ImageData(data.data, data.width, data.height)
  }

  const canvas = document.createElement('canvas')
  canvas.width = data.width
  canvas.height = data.height
  const ctx = canvas.getContext('2d')
  ctx.putImageData(data, 0, 0)
  const cropped = ctx.getImageData(x, y, w, h)

  return cropped
}

function drawImageToCanvas(img, w, h) {
  const canvas = document.createElement('canvas')
  const width = w || img.naturalWidth
  const height = h || img.naturalHeight
  const ctx = canvas.getContext('2d')
  ctx.canvas.width = width
  ctx.canvas.height = height
  ctx.drawImage(img, 0, 0, width, height)
  const canvasData = ctx.getImageData(0, 0, width, height)

  return canvasData
}

function drawDataToCanvas(data: ImageData, w: number, h: number) {
  const canvas = document.createElement('canvas')
  canvas.width = data.width
  canvas.height = data.height
  const ctx = canvas.getContext('2d')
  ctx.putImageData(data, 0, 0)

  return canvas
}

function createImage(url: string) {
  const imgPromise = new Promise((resolve, reject) => {
    const img = document.createElement('img')
    img.crossOrigin = 'Anonymous'

    const imgLoadHandler = (e) => {
      e.target.removeEventListener('load', imgLoadHandler)
      resolve(e.target)
    }

    const imgErrorHandler = (e) => {
      e.target.removeEventListener('error', imgErrorHandler)
      reject(new Error(`Could not load: ${url}`))
    }

    img.addEventListener('load', imgLoadHandler)
    img.addEventListener('error', imgErrorHandler)

    img.src = url
  })

  return imgPromise
}

export async function resizeAndCropImageWithCanvas(url: string, newWidth: number, newHeight: number) {
  let image = await createImage(url)
  const ogCanvasData = drawImageToCanvas(image)
  // @todo handle error
  const ogWidth = ogCanvasData.width
  const ogHeight = ogCanvasData.height

  const isPortrait = ogHeight > ogWidth
  const croppedIsPortrait = newHeight > newWidth

  const data = {}

  let phase1Width = -1
  let phase1Height = -1
  let phase2Width = -1
  let phase2Height = -1
  // this assumes that the image is sufficient to crop
  let phase3Width = ogWidth
  let phase3Height = ogHeight

  if (isPortrait) {
    // Phase one: scale the image to match the target width
    phase1Width = newWidth
    phase1Height = Math.floor((newWidth / ogWidth) * ogHeight)

    phase3Width = phase1Width
    phase3Height = phase1Height

    // phase two: scale height to if it is not tall enough
    if (phase3Height < newHeight) {
      phase2Height = newHeight
      phase2Width = Math.floor((newHeight / ogHeight) * ogWidth)

      phase3Width = phase2Width
      phase3Height = phase2Height
    }
  } else {
    // Phase one: scale the image to match the target height
    phase1Height = newHeight
    phase1Width = Math.floor((newHeight / ogHeight) * ogWidth)

    phase3Width = phase1Width
    phase3Height = phase1Height

    // phase two: scale height to if it is not tall enough
    if (phase3Width < newWidth) {
      phase2Width = newWidth
      phase2Height = Math.floor((newWidth * ogHeight) / ogWidth)

      phase3Width = phase2Width
      phase3Height = phase2Height
    }
  }

  // This data obj api was designed to describe an imaged that was rotated,
  // since it is cropped here, the original image should reflect the crop to be compatible with
  // SVG tinting in the scene visualizer, otherwise the mask will distort, these values are used by the viewbox prop
  const largerSide = Math.max(newWidth, newHeight)
  const smallerSide = Math.min(newWidth, newHeight)
  const imageWidth = croppedIsPortrait ? smallerSide : largerSide
  const imageHeight = croppedIsPortrait ? largerSide : smallerSide
  data.portraitWidth = smallerSide
  data.portraitHeight = largerSide
  data.landscapeWidth = largerSide
  data.landscapeHeight = smallerSide
  data.isPortrait = croppedIsPortrait
  data.originalImageWidth = imageWidth
  data.originalImageHeight = imageHeight
  data.imageWidth = imageWidth
  data.imageHeight = imageHeight

  // phase dims used to resize, new dims used to calc phases and then crop!
  const resizedCanvas = drawDataToCanvas(ogCanvasData, phase3Width, phase3Height)
  const resizedImageData = drawImageToCanvas(resizedCanvas, phase3Width, phase3Height)

  // phase three: crop image to new height and width
  const x = phase3Width > newWidth ? Math.floor(phase3Width / 2 - newWidth / 2) : 0
  const y = phase3Height > newHeight ? Math.floor(phase3Height / 2 - newHeight / 2) : 0

  const croppedImageData = cropWithCanvas(resizedImageData, x, y, newWidth, newHeight)

  const finalCanvas = drawDataToCanvas(croppedImageData)
  data.url = finalCanvas.toDataURL()

  return data
}

// @flow
import { getHueRangeNumber,tinycolor } from '../../shared/helpers/ColorDataUtils'

function loadImage (img: string): Promise<any> {
  return new Promise((resolve: any, reject: any) => {
    const image = new Image()
    image.crossOrigin = 'Anonymous'
    image.onload = () => resolve(image)
    image.onerror = () => reject(Error(`Error loading ${img}`))
    image.src = img
  })
}

function createColorTallies (imageData: any, imageWidth: number, imageHeight: number) {
  const imageDataLength = imageData.length
  const tallies = []
  const tallyIndexMap = {}

  for (let i = 0; i < imageDataLength; i += 4) {
    const color = {
      r: imageData[i],
      g: imageData[i + 1],
      b: imageData[i + 2]
    }

    const key = [color.r, color.g, color.b].join(',')

    if (tallyIndexMap.hasOwnProperty(key)) {
      let tallyIndex = tallyIndexMap[key]
      tallies[tallyIndex].count++
      tallies[tallyIndex].byteIndices.push(i)
    } else {
      tallyIndexMap[key] = tallies.length
      const hsl = tinycolor(`"rgb(${color.r}, ${color.g}, ${color.b})"`).toHsl()
      const hueNumber = getHueRangeNumber(hsl.h)
      tallies.push({
        count: 1,
        value: color,
        hsl: hsl,
        hueRangeNumber: hueNumber,
        byteIndices: [i]
      })
    }
  }

  return tallies
}

function getPixelPosition (byteIndex: number, imageWidth: number, imageHeight: number) {
  const pixelIndex = Math.floor(byteIndex / 4)
  const x = pixelIndex % imageWidth
  let y = Math.floor(pixelIndex / imageWidth)
  return { x: (x / imageWidth), y: (y / imageHeight) }
}

function getByteIndex (x: number, y: number, width: number) {
  return 4 * (y * width + x)
}

export {
  createColorTallies,
  getByteIndex,
  getPixelPosition,
  loadImage}

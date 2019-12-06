// @flow
import { rgb } from 'color-space'
import uniqBy from 'lodash/uniqBy'
import { getDeltaE00 } from 'delta-e'

export const drawAcrossLine = (context: Object, to: Object, from: Object, shapeDrawer: Function) => {
  let x0 = parseInt(to.x)
  let y0 = parseInt(to.y)
  const x1 = parseInt(from.x)
  const y1 = parseInt(from.y)
  const dx = Math.abs(x1 - x0)
  const dy = Math.abs(y1 - y0)
  const sx = (x0 < x1) ? 1 : -1
  const sy = (y0 < y1) ? 1 : -1
  let err = dx - dy

  while (true) {
    shapeDrawer.call(this, context, x0, y0)

    if ((x0 === x1) && (y0 === y1)) { break }

    let e2 = 2 * err
    if (e2 > -dy) {
      err -= dy
      x0 += sx
    }
    if (e2 < dx) {
      err += dx
      y0 += sy
    }
  }
}

// eslint-disable-next-line no-unused-vars
export const imagePathListToImageData = (imagePathList: any, width: number, height: number): Object => {
  // eslint-disable-next-line no-unused-vars
  const imageData = new window.ImageData(width, height)
  const { pixelIndexAlphaMap } = imagePathList

  for (let pixelIndexKey in pixelIndexAlphaMap) {
    const index = parseInt(pixelIndexKey)
    // Use the alpha value to create a grayscale image
    const alphaAsGrey = pixelIndexAlphaMap[pixelIndexKey]
    imageData.data[index] = alphaAsGrey
    imageData.data[index + 1] = alphaAsGrey
    imageData.data[index + 2] = alphaAsGrey
    imageData.data[index + 3] = alphaAsGrey
  }

  return imageData
}

const mapLABArrayToObject = (color) => {
  return {
    L: color[0],
    A: color[1],
    B: color[2]
  }
}

export const getColorsFromImagePathList = (imagePathList: any) => {
  const colorList = imagePathList
    .filter(imagePath => {
      // @todo implement using the real types -RS
      return imagePath.data
    })

  const uniqueColorList = uniqBy(colorList, imagePath => imagePath.color.join('_'))
    .map(imagePath => {
      return mapLABArrayToObject(rgb.lab(imagePath.color))
    })

  return uniqueColorList
}

export const separateColors = (colors: Object[], imageData: any, threshold: number): Array[] => {
  const pixelBuckets = colors.map(color => [])

  const data = imageData.data
  for (let i = 0; i < data.length; i += 4) {
    // convert pixel from RGBA -> LAB
    const pixel = mapLABArrayToObject(rgb.lab([data[i], data[i + 1], data[i + 2], data[i + 3]]))
    for (let colorIndex = 0; colorIndex < colors.length; colorIndex++) {
      const colorDiff = getDeltaE00(colors[colorIndex], pixel)
      // 1.5 is a good number to use for a threshold
      if (colorDiff < threshold) {
        pixelBuckets[colorIndex].push(data[i], data[i + 1], data[i + 2], data[i + 3])
      } else {
        pixelBuckets[colorIndex].push(0, 0, 0, 0)
      }
    }
  }

  return pixelBuckets
}

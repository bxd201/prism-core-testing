// @flow
import { rgb } from 'color-space'
import { getDeltaE00 } from 'delta-e'

const mapLABArrayToObject = (color) => {
  return {
    L: color[0],
    A: color[1],
    B: color[2]
  }
}

export const separateColors = (colors: Object[], imageData: any, threshold: number, saveAlpha: boolean): Array[] => {
  const pixelBuckets = colors.map(color => [])
  // alpha values need to be saved as a separate list due to image path implementation
  const alphaPixelMaps = colors.map(color => {
    return {}
  })

  const data = imageData.data
  for (let i = 0; i < data.length; i += 4) {
    // convert pixel from RGBA -> LAB
    const pixel = mapLABArrayToObject(rgb.lab([data[i], data[i + 1], data[i + 2], data[i + 3]]))
    for (let colorIndex = 0; colorIndex < colors.length; colorIndex++) {
      const colorDiff = getDeltaE00(colors[colorIndex], pixel)
      // 1.5 is a good number to use for a threshold
      if (saveAlpha) {
        // This block is for import
        if (colorDiff < threshold) {
          pixelBuckets[colorIndex].push(i)
          alphaPixelMaps[colorIndex][`${i}`] = data[i + 3]
        }
      } else {
        // This block is for export
        if (colorDiff < threshold) {
          pixelBuckets[colorIndex].push(data[i], data[i + 1], data[i + 2], data[i + 3])
        } else {
          pixelBuckets[colorIndex].push(0, 0, 0, 0)
        }
      }
    }
  }

  if (saveAlpha) {
    return {
      pixelIndices: pixelBuckets,
      alphaPixelMaps
    }
  }

  return pixelBuckets
}

export const getUniqueColorsFromPalette = (palette: Object[]) => {
  const colors = palette.map(color => {
    const labColor = rgb.lab([color.red, color.green, color.blue, 255])
    return mapLABArrayToObject(labColor)
  })

  return colors
}

export const processLoadedScene = (ctx: any, colors: Object[], threshold: number, saveAlpha: boolean): Array[] => {
  const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height)
  const uniqueColors = getUniqueColorsFromPalette(colors)
  const colorLayers = separateColors(uniqueColors, imageData, threshold, saveAlpha)

  return colorLayers
}

export const createImageDataAndAlphaPixelMapFromImageData = (imageData) => {
  const alphaPixelMap = {}
  const pixelMap = []

  for (let i = 0; i < imageData.data.length; i += 4) {
    // Add if rgb isn't pure black
    if (imageData.data[i] !== 0 && imageData.data[i + 1] !== 0 && imageData.data[i + 2] !== 0) {
      pixelMap.push(i)
      alphaPixelMap[`${i}`] = imageData.data[i + 3]
    }
  }

  return {
    alphaPixelMap,
    pixelMap
  }
}

export const getColorsFromImagePathList = (imagePathList: Object[]) => {
  const paintItems = []
  const paintTypes = ['paint', 'erase-paint']
  const savedColors = []

  imagePathList.forEach((item, i) => {
    if (item.isEnabled) {
      if (paintTypes.indexOf(item.type) > -1) {
        // In many cases one SHOULD copy an object...however this is a HUUUGE deeply nest object, do not copy.
        // This algorithm should only be used during blocking operations and the product should not be stored, it should be ephemeral.
        paintItems.push(item)
      }
    }
  })

  paintItems.forEach((item, i) => {
    const colorId = item.colorRef.id
    if (!savedColors.find(color => color.id === colorId)) {
      savedColors.push(item.colorRef)
    }
  })

  return savedColors
}

export const getLABFromColor = (colorObj: Object) => {
  const color = rgb.lab([colorObj.red, colorObj.green, colorObj.blue])

  return {
    L: color[0],
    A: color[1],
    B: color[2]
  }
}

export const getInitialDims = (workspace, referenceDims) => {
  if (workspace) {
    return [workspace.width, workspace.height]
  }

  return [referenceDims.imageWidth, referenceDims.imageHeight]
}

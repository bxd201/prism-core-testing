// @flow
import pako from 'pako'

export const getDataFromXML = (xmlString: string, sceneData: Object[], colors: Object[]) => {
  const parser = new window.DOMParser()
  const doc = parser.parseFromString(xmlString, 'application/xml')
  // There is only one surfaces node
  const surfaces = doc.getElementsByTagName('surfaces')[0]
  const project = doc.getElementsByTagName('Project')[0]
  const width = parseInt(project.getAttribute('width'))
  const height = parseInt(project.getAttribute('height'))

  const processedSurfaces = []

  for (let surfaceIndex = 0; surfaceIndex < surfaces.children.length; surfaceIndex++) {
    const surfaceMask = unpackAndColorizeMask(surfaces.children[surfaceIndex], sceneData, colors, width, height)
    processedSurfaces.push(surfaceMask)
  }

  return {
    surfaces: processedSurfaces,
    width,
    height,
    colors
  }
}

export const unpackImageDataFromXML = (imageDataString: string, color: Object, width: number, height: number) => {
  const binaryData = window.atob(imageDataString).split('')
  const binaryCharArray = new Uint8Array(binaryData.map(char => char.charCodeAt(0)))
  const imageDataData = pako.inflate(binaryCharArray)
  // go from ARGB -> RGBA
  const fixedImageData = new Uint8ClampedArray(colorizeAndTransposeAlpha(imageDataData, false))

  return new window.ImageData(fixedImageData, width, height)
}

// @todo - Review typing -RS
// This is a large dataset, do in place
const colorizeAndTransposeAlpha = (imageDataData: Uint8Array, isRGBA: boolean, color: Object) => {
  let alpha = 0
  let red = color ? color.red : 0
  let green = color ? color.green : 0
  let blue = color ? color.blue : 0

  for (let i = 0; i < imageDataData.length; i += 4) {
    if (isRGBA) {
      alpha = imageDataData[i + 3]
      red = alpha
      green = alpha
      blue = alpha

      imageDataData[i] = alpha
      imageDataData[i + 1] = red
      imageDataData[i + 2] = green
      imageDataData[i + 3] = blue
    } else {
      alpha = imageDataData[i]
      red = alpha
      green = alpha
      blue = alpha

      imageDataData[i] = red
      imageDataData[i + 1] = green
      imageDataData[i + 2] = blue
      imageDataData[i + 3] = alpha
    }
  }

  return imageDataData
}

// This is a large dataset, do in place
// eslint-disable-next-line no-unused-vars
const transposeChannels = (imageDataData: Uint8Array, isRGBA: boolean, color: Object) => {
  let alpha = 0
  let red = 0
  let green = 0
  let blue = 0

  for (let i = 0; i < imageDataData.length; i += 4) {
    if (isRGBA) {
      // transpose from RGBA -> ARGB
      red = imageDataData[i]
      green = imageDataData[i + 1]
      blue = imageDataData[i + 2]
      alpha = imageDataData[i + 3]

      imageDataData[i] = alpha
      imageDataData[i + 1] = red
      imageDataData[i + 2] = green
      imageDataData[i + 3] = blue
    } else {
      // transpose from ARGB -> RGBA
      alpha = imageDataData[i]
      red = imageDataData[i + 1]
      green = imageDataData[i + 2]
      blue = imageDataData[i + 3]

      imageDataData[i] = red
      imageDataData[i + 1] = green
      imageDataData[i + 2] = blue
      imageDataData[i + 3] = alpha
    }
  }
}

const unpackAndColorizeMask = (surface: any, sceneData: Object[], colors: Object[], width: number, height: number) => {
  // @todo What is sherlandia001 regionColorMap -RS
  const regionName = surface.getAttribute('region').toLowerCase()
  const { sceneColorPalette: { regionColorMap } } = sceneData
  // eslint-disable-next-line no-unused-vars
  const surfaceInfo = []
  for (let surfaceNameKey in regionColorMap) {
    // Get color using region name
    if (surfaceNameKey.indexOf('_') > -1) {
      const surfaceNameParts = surfaceNameKey.split('_')
      const surfaceName = surfaceNameParts[surfaceNameParts.length - 1]

      if (regionName === surfaceName) {
        const { id: surfaceColorId } = regionColorMap[surfaceNameKey]
        // The color has to be there!
        const surfaceColor = colors.filter((color) => color.id === `${surfaceColorId}`)[0]
        const surfaceMask = surface.children[0]
        const surfaceMaskImageData = unpackImageDataFromXML(surfaceMask.getAttribute('string'), surfaceColor, width, height)

        return {
          surfaceMaskImageData,
          surfaceName
        }
      }
    }
  }
}

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
  const fixedImageData = new Uint8ClampedArray(transposeChannels(imageDataData, false))

  return new window.ImageData(fixedImageData, width, height)
}

// This is a large dataset, do in place, if given a color object it will render in technicolor.
const transposeChannels = (imageDataData: Uint8Array, isRGBA: boolean, color: Object) => {
  let alpha = 0
  let red = color ? color.red : 0
  let green = color ? color.green : 0
  let blue = color ? color.blue : 0

  for (let i = 0; i < imageDataData.length; i += 4) {
    if (isRGBA) {
      // transpose from RGBA -> ARGB
      alpha = imageDataData[i + 3]

      if (color) {
        red = imageDataData[i]
        green = imageDataData[i + 1]
        blue = imageDataData[i + 2]
        alpha = imageDataData[i + 3]
      } else {
        red = alpha
        green = alpha
        blue = alpha
      }

      imageDataData[i] = alpha
      imageDataData[i + 1] = red
      imageDataData[i + 2] = green
      imageDataData[i + 3] = blue
    } else {
      // transpose from ARGB -> RGBA
      alpha = imageDataData[i]

      if (color) {
        alpha = imageDataData[i]
        red = imageDataData[i + 1]
        green = imageDataData[i + 2]
        blue = imageDataData[i + 3]
      } else {
        red = alpha
        green = alpha
        blue = alpha
      }

      imageDataData[i] = red
      imageDataData[i + 1] = green
      imageDataData[i + 2] = blue
      imageDataData[i + 3] = alpha
    }
  }

  return imageDataData
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

export const createCustomSceneMetaData = (imageBaseName: string, width: number, height: number) => {
  return {
    imageBaseName,
    width,
    height
  }
}

// eslint-disable-next-line no-unused-vars
export const imageDataToSurfacesXML = (surfaceData: any[] | null, metaData: Object) => {
  const doc = new window.Document()
  const project = doc.createElement('Project')
  const { width, height, imageBaseName } = metaData

  project.setAttribute('image', imageBaseName)
  project.setAttribute('width', width)
  project.setAttribute('height', height)
  project.setAttribute('version', 2)
  project.setAttribute('empty', true)

  const surfaces = doc.createElement('Surfaces')
  const surfaceCount = surfaceData ? surfaceData.length : 0
  surfaces.setAttribute('numSurfaces', surfaceCount)

  if (surfaceData) {
    surfaceData.forEach((item, i) => {
      let surface = createSurfaceFromImageData(item, width, height, i, doc)
      surfaces.appendChild(surface)
    })
  }

  project.appendChild(surfaces)

  return project
}

export const stringifyXML = (xml: any) => {
  const xmls = new window.XMLSerializer()
  return xmls.serializeToString(xml)
}

const createTimestamp = () => {
  const now = new Date()
  return [
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    now.getHours(),
    now.getMinutes(),
    now.getSeconds(),
    now.getMilliseconds()
  ].join('-')
}

const createSurfaceFromImageData = (imageDataItem: Object, width: number, height: number, index: number, doc: Element) => {
  const surface = doc.createElement('Surface')
  const surfaceName = `Surface-${createTimestamp()}`
  const regionName = `Surface${index}`
  // @todo - Need to implement a wrapper object for export that has properties like surface name -RS format name-timestamp
  surface.setAttribute('name', surfaceName)
  surface.setAttribute('region', regionName)
  surface.setAttribute('width', width)
  surface.setAttribute('height', height)
  surface.setAttribute('version', 2)
  surface.setAttribute('autoQuad', false)
  surface.setAttribute('category', 'Wall')
  surface.setAttribute('sensitivity', 50)
  surface.setAttribute('intensity', 50)
  surface.setAttribute('thickness', 30)
  surface.setAttribute('brightness', 50)
  surface.setAttribute('rotate', 0)
  surface.setAttribute('gridLength', 10)
  surface.setAttribute('gridWidth', 10)
  surface.setAttribute('maxY', 464)
  surface.setAttribute('minY', 0)
  surface.setAttribute('maxX', 699)
  surface.setAttribute('minX', 0)
  surface.setAttribute('quad', '0,0,0,0,0,0,0,0')
  surface.setAttribute('asset', '')

  const surfaceMask = document.createElement('SurfaceMask')
  surfaceMask.setAttribute('color', 65280)
  surfaceMask.setAttribute('version', 2)
  surfaceMask.setAttribute('string', packImageDataForXML(imageDataItem))

  surface.appendChild(surfaceMask)

  const surfaceOverlay = document.createElement('SurfaceOverlay')
  surfaceOverlay.setAttribute('width', 5)
  surfaceOverlay.setAttribute('length', 3)
  surfaceOverlay.setAttribute('centerX', -1)
  surfaceOverlay.setAttribute('centerY', -1)
  surfaceOverlay.setAttribute('type', 'rectOverlay')
  surfaceOverlay.setAttribute('rotate', 0)

  surface.appendChild(surfaceOverlay)

  return surface
}

const packImageDataForXML = (imageDataItem: number[]) => {
  const imageDataData = new Uint8Array(imageDataItem)
  transposeChannels(imageDataData, true)
  const output = pako.deflate(imageDataData, { to: 'string' })

  return window.btoa(output)
}

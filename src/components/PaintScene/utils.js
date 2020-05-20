// @flow
import { getDeltaE00 } from 'delta-e'
import difference from 'lodash/difference'
import uniqueId from 'lodash/uniqueId'
import cloneDeep from 'lodash/cloneDeep'
import { toolNames, brushSquareShape, paintBrushMediumCircleClass,
  brushRoundShape, brushMediumSize, paintBrushMediumClass,
  brushSmallSize, brushTinySize, paintBrushLargeCircleClass,
  paintBrushSmallClass, paintBrushSmallCircleClass, paintBrushTinyClass,
  brushLargeSize, paintBrushLargeClass, paintBrushTinyCircleClass } from './data'

const MAX_RES_TIME = 3000

export const getPaintAreaPath = (imagePathList, canvas, width, height, color) => {
  const RGB = getActiveColorRGB(color)
  const [array, pixelIndexAlphaMap] = getImageCordinateByPixelPaintBrush(canvas, width, height, true)
  const newArea = {
    type: 'paint',
    id: uniqueId(),
    color: RGB,
    data: array,
    pixelIndexAlphaMap: pixelIndexAlphaMap,
    isEnabled: true,
    linkedOperation: null,
    siblingOperations: null,
    // A reference to the full color object need for persistence
    colorRef: { ...color }
  }
  const copyImagePathList = copyImageList(imagePathList)
  copyImagePathList.push(newArea)
  return { newImagePathList: copyImagePathList, paintPath: array }
}

export const getImageCordinateByPixel = (canvas, color, width, height, returnPixelIndexAlphaMap = true) => {
  const ctx = canvas.current.getContext('2d')
  let imageData = ctx.getImageData(0, 0, width, height)
  let data = imageData.data
  let pixelArray = []
  let pixelIndexAlphaMap = {}
  for (let index = 0; index < data.length; index += 4) {
    if (data[index] === color[0] && data[index + 1] === color[1] && data[index + 2] === color[2]) {
      pixelArray.push(index)
      if (returnPixelIndexAlphaMap) pixelIndexAlphaMap[index] = data[index + 3]
    }
  }
  if (returnPixelIndexAlphaMap) {
    return [pixelArray, pixelIndexAlphaMap]
  } else {
    return pixelArray
  }
}

export const getImageCordinateByPixelPaintBrush = (canvas, width, height, returnPixelIndexAlphaMap = true) => {
  const ctx = canvas.current.getContext('2d')
  let imageData = ctx.getImageData(0, 0, width, height)
  let data = imageData.data
  let pixelArray = []
  let pixelIndexAlphaMap = {}
  for (let index = 0; index < data.length; index += 4) {
    if (data[index] !== 0 || data[index + 1] !== 0 || data[index + 2] !== 0) {
      pixelArray.push(index)
      if (returnPixelIndexAlphaMap) pixelIndexAlphaMap[index] = data[index + 3]
    }
  }
  if (returnPixelIndexAlphaMap) {
    return [pixelArray, pixelIndexAlphaMap]
  } else {
    return pixelArray
  }
}

export const checkColorRGBEqual = (rgb, newRgb) => {
  return rgb[0] === newRgb[0] && rgb[1] === newRgb[1] && rgb[2] === newRgb[2] && rgb[3] === newRgb[3]
}

export const getActiveColorRGB = (color) => {
  const { red, green, blue } = color
  return [red, green, blue, 255]
}

export const drawCircle = (circleObj) => {
  var ctx = circleObj.ctx
  ctx.save()
  ctx.beginPath()
  ctx.globalCompositeOperation = circleObj.type
  ctx.arc(circleObj.x, circleObj.y, circleObj.radius, circleObj.startAngle, circleObj.endAngle, false)
  ctx.lineWidth = circleObj.lineWidth
  ctx.strokeStyle = circleObj.color
  ctx.lineCap = 'round'
  ctx.fillStyle = circleObj.fillStyle
  ctx.setTransform(circleObj.pulse, 0, 0, circleObj.pulse, 0, 0)
  ctx.fill()
  ctx.stroke()
  ctx.closePath()
  ctx.restore()
}

export const Circle = (ctx, x, y, radius, fillStyle, type = 'source-over', pulse) => {
  let circleObj = {
    ctx: ctx,
    x: x,
    y: y,
    radius: radius,
    lineWidth: 2,
    type: type,
    pulse: pulse
  }
  circleObj.startAngle = 0
  circleObj.endAngle = Math.PI * 2
  circleObj.color = `rgba(255, 255, 255, 255)`
  circleObj.fillStyle = fillStyle
  drawCircle(circleObj)
  return circleObj
}

export const repaintCircleLine = (ctx, start, list, scale) => {
  ctx.beginPath()
  for (let i = 0; i < list.length; i++) {
    Circle(ctx, list[i][0], list[i][1], 6, 'rgba(255, 255, 255, 0)')
    if (i === 0) {
      drawLine(ctx, start, list[i], true)
    } else {
      drawLine(ctx, list[i - 1], list[i], true)
    }
  }
  ctx.closePath()
}

export const pointInsideCircle = (x, y, circle, r) => {
  let dx = circle[0] - x
  let dy = circle[1] - y
  return dx * dx + dy * dy <= r * r
}

export const drawLine = (ctx, lineStart, end, isDash) => {
  ctx.save()
  ctx.beginPath()
  ctx.strokeStyle = '#fff'
  ctx.lineWidth = 1.5
  isDash && ctx.setLineDash([5, 15])
  ctx.moveTo(lineStart[0], lineStart[1])
  ctx.lineTo(end[0], end[1])
  ctx.stroke()
  ctx.setLineDash([])
  ctx.closePath()
  ctx.restore()
}

export const dropPin = (x, y, isAnimate) => {
  if (isAnimate) {
    return {
      pinX: x,
      pinY: y,
      showAnimatePin: true,
      showNonAnimatePin: true
    }
  } else {
    return {
      currPinX: x,
      currPinY: y,
      showAnimatePin: isAnimate,
      showNonAnimatePin: true
    }
  }
}

export const createPolygon = (polyList = [[0, 0]], canvas, width, height, color, operation) => {
  const ctx = canvas.current.getContext('2d')
  ctx.fillStyle = color
  ctx.globalCompositeOperation = operation
  if (polyList.length > 2) {
    ctx.beginPath()
    ctx.moveTo(polyList[0][0], polyList[0][1])
    for (let i = 1; i < polyList.length; i++) {
      ctx.lineTo(polyList[i][0], polyList[i][1])
    }
    ctx.closePath()
    ctx.fill()
  } else {
    clearCanvas(canvas, width, height)
  }
}

export const checkIntersection = (areaA, areaB, getIntersectionData = false) => {
  const setA = new Set(areaA)
  const setB = new Set(areaB)
  if (!getIntersectionData) {
    return [...setA].some(x => setB.has(x))
  } else {
    const intersection = new Set([...setA].filter(x => setB.has(x)))
    return Array.from(intersection)
  }
}

export const repaintImageByPath = (
  imagePathList: { data: number[], color: number[], isEnabled: Boolean, type: string, id: string, pixelIndexAlphaMap?: number[] }[],
  canvas: { current: HTMLCanvasElement },
  width: number,
  height: number,
  isEraseRepaint: boolean = false, // not being used
  groupIds: string[] = []
) => {
  if (imagePathList.length < 1) { return }
  const ctx: CanvasRenderingContext2D = canvas.current.getContext('2d')
  let imageData: ImageData = ctx.getImageData(0, 0, width, height)
  imagePathList
    .filter(imagePath => {
      const isUnselectType = ['unselect', 'unselect-group', 'ungroup'].includes(imagePath.type)
      const containsGroupId = groupIds.includes(imagePath.id)
      return imagePath.data && imagePath.isEnabled && ((!isUnselectType && !containsGroupId) || (imagePath.type === 'select-group' && containsGroupId))
    })
    .forEach(({ id, data, color, type, pixelIndexAlphaMap }) => {
      data.forEach((d: number) => {
        imageData.data[d] = color[0]
        imageData.data[d + 1] = color[1]
        imageData.data[d + 2] = color[2]
        if (['delete', 'delete-group'].includes(type)) {
          imageData.data[d + 3] = 0
        } else if (imageData.data[d + 3] === undefined && pixelIndexAlphaMap && pixelIndexAlphaMap[d]) {
          imageData.data[d + 3] = pixelIndexAlphaMap[d]
        } else {
          imageData.data[d + 3] = 255
        }
      })
    })
  ctx.putImageData(imageData, 0, 0)
}

export const createImagePathItem = (
  data: number[],
  pixelIndexAlphaMap: Object,
  colorRef: Object,
  type: string,
  drawOrder: number,
  isEnabled: boolean = true,
  excludeFromHistory: boolean = false) => {
  const color = [colorRef.red, colorRef.green, colorRef.blue]

  return {
    id: uniqueId(),
    data,
    pixelIndexAlphaMap,
    color,
    colorRef: cloneDeep(colorRef),
    type,
    drawOrder,
    isEnabled,
    excludeFromHistory
  }
}

export const drawImagePixelByPath = (ctx, width, height, color, path) => {
  let imageData = ctx.getImageData(0, 0, width, height)
  let data = imageData.data
  if (path) {
    for (let i = 0; i < path.length; i++) {
      data[path[i]] = color[0]
      data[path[i] + 1] = color[1]
      data[path[i] + 2] = color[2]
      data[path[i] + 3] = color[3]
    }
  }
  ctx.putImageData(imageData, 0, 0)
}

export const clearCanvas = (canvas, width, height) => {
  const ctx = canvas.current.getContext('2d')
  ctx.clearRect(0, 0, width, height)
}

export const whiteBlack = (ctx, width, height) => {
  let originPixel = ctx.getImageData(0, 0, width, height)
  for (let i = 0; i < originPixel.data.length; i += 4) {
    let avg = (originPixel.data[i] + originPixel.data[i + 1] + originPixel.data[i + 2]) / 3
    originPixel.data[i] = avg
    originPixel.data[i + 1] = avg
    originPixel.data[i + 2] = avg
  }
  ctx.putImageData(originPixel, 0, 0, 0, 0, width, height)
}

export const edgeDetect = (canvas, targetImagePath, targetImageColor, width, height) => {
  /** This function is adding border of the specific paint area
   * Step to highlight border of paint area:
   * 1.create a temporary processing canvas to get whiteblack color version of paint area
   * Because of whole canvas only contain two types of pixel, so we just need check if "redIndex" of each
   * pixel if equal its "redIndex" of the previous pixel or top pixel or bottom pixel or next pixel.
   * if met any of above condition, then we can say the pixel is "border pixel"
   * 2.loop through whole canvas then we know which pixel is edge, push the edge into array and return it for
   * unselect use
   * 3.we get the edge list now then we can paint these border into our origin paint canvas
  */
  let edge = []
  const originCtx = canvas.current.getContext('2d')
  let processingCanvas = document.createElement('canvas')
  processingCanvas.width = width
  processingCanvas.height = height
  const ctx = processingCanvas.getContext('2d')
  drawImagePixelByPath(ctx, width, height, targetImageColor, targetImagePath)
  whiteBlack(ctx, width, height)
  let pixel = ctx.getImageData(0, 0, width, height)
  let index = null
  let currVal = null
  let prevIndexVal = null
  let nextIndexVal = null
  let topIndexVal = null
  let bottomIndexVal = null

  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      index = (pixel.width * i + j) * 4
      currVal = pixel.data[index]
      prevIndexVal = index - 4 >= 0 ? pixel.data[index - 4] : pixel.data[index]
      nextIndexVal = pixel.data[index + 4]
      topIndexVal = (index - width * 4) >= 0 ? pixel.data[index - width * 4] : pixel.data[index]
      bottomIndexVal = pixel.data[index + width * 4]
      if (currVal !== prevIndexVal || currVal !== nextIndexVal || currVal !== topIndexVal || currVal !== bottomIndexVal) {
        edge.push(index)
      }
    }
  }
  drawImagePixelByPath(originCtx, width, height, [255, 255, 255, 255], edge)
  return edge
}

export const eraseIntersection = (imagePathList: Object[], erasePath: any) => {
  const originImagePathList = copyImageList(imagePathList)
  let siblingList = []
  for (let i = 0; i < originImagePathList.length; i++) {
    const data = originImagePathList[i].data
    const pixelIndexAlphaMap = originImagePathList[i].pixelIndexAlphaMap
    const isEnabled = originImagePathList[i].isEnabled
    const color = originImagePathList[i].color
    const linkId = originImagePathList[i].id
    const drawOrder = originImagePathList[i].drawOrder
    const type = originImagePathList[i].type
    const isHasIntersection = (type !== 'delete' ? checkIntersection(data, erasePath) : false)

    if (isHasIntersection && isEnabled && type !== 'delete' && type !== 'delete-group') {
      originImagePathList[i].isEnabled = false
      const remainAreaPath = difference(data, erasePath)
      const newId = uniqueId()
      // @todo [IMPROVEMENT] possible candidate for imagepath factory -RS
      originImagePathList.push({
        type: 'paint',
        subType: 'erase-paint',
        id: newId,
        color: color,
        colorRef: originImagePathList[i].colorRef,
        data: remainAreaPath,
        pixelIndexAlphaMap: pixelIndexAlphaMap,
        isEnabled: true,
        linkedOperation: linkId,
        siblingOperations: null,
        drawOrder: drawOrder
      })
      siblingList.push(newId)
    }
  }

  originImagePathList.forEach((imagePathElement) => {
    if (siblingList.includes(imagePathElement.id)) {
      imagePathElement.siblingOperations = siblingList.filter((id) => {
        return id !== imagePathElement.id
      })
    }
  })
  return originImagePathList
}

/** using flood fill algorithm to get specific area and fill color to image
 * similar is value refer to distance between two color you would set.
 * it is set as 100 by default which you want to paint on the same color.*
*/
export const getSelectArea = (imageData, newColor, x, y, similar = 100, performance) => {
  let resultArr = []
  const { width, height } = imageData
  const stack = []
  const baseColor = getColorAtPixel(imageData, x, y)
  const colorForMatch = { r: newColor[0], g: newColor[1], b: newColor[2], a: newColor[3] }
  let operator = { x, y }

  // Check if base color and new color are the same or similar
  if (colorMatch(baseColor, colorForMatch, similar)) {
    return
  }

  // Add the clicked location to stack
  stack.push({ x: operator.x, y: operator.y })

  while (stack.length) {
    if (window.performance.now() - performance > MAX_RES_TIME) {
      return resultArr
    }
    operator = stack.pop()
    let contiguousDown = true // Vertical is assumed to be true
    let contiguousUp = true // Vertical is assumed to be true
    let contiguousLeft = false
    let contiguousRight = false

    // Move to top most contiguousDown pixel
    while (contiguousUp && operator.y >= 0) {
      operator.y--
      contiguousUp = colorMatch(getColorAtPixel(imageData, operator.x, operator.y), baseColor, similar)
    }

    // Move downward
    while (contiguousDown && operator.y < height) {
      setColorAtPixel(imageData, newColor, operator.x, operator.y)
      const index = width * operator.y * 4 + operator.x * 4
      resultArr.push(index)
      // Check left
      if (operator.x - 1 >= 0 && colorMatch(getColorAtPixel(imageData, operator.x - 1, operator.y), baseColor, similar)) {
        if (!contiguousLeft) {
          contiguousLeft = true
          stack.push({ x: operator.x - 1, y: operator.y })
        }
      } else {
        contiguousLeft = false
      }

      // Check right
      if (operator.x + 1 < width && colorMatch(getColorAtPixel(imageData, operator.x + 1, operator.y), baseColor, similar)) {
        if (!contiguousRight) {
          stack.push({ x: operator.x + 1, y: operator.y })
          contiguousRight = true
        }
      } else {
        contiguousRight = false
      }

      operator.y++
      contiguousDown = colorMatch(getColorAtPixel(imageData, operator.x, operator.y), baseColor, similar)
    }
  }
  return resultArr
}

/** Inspired by https://lodev.org/cgtutor/floodfill.html,
 * This article using different ways to implement flood fill algorithm
 * I believe the last one is the most efficiency one.
 * so I modified it for our canvas tool use.
*/
export const floodFillScanLineStack = (imageData, newColor, x, y, similar, performance) => {
  const oldColor = getColorAtPixel(imageData, x, y)
  const { width, height } = imageData
  let resultArr = []
  let spanAbove
  let spanBelow
  let stack = []
  const color = { r: newColor[0], g: newColor[1], b: newColor[2], a: newColor[3] }
  stack.push({ x: x, y: y })

  if (colorMatch(oldColor, color, similar)) {
    return
  }

  while (stack.length) {
    if (window.performance.now() - performance > MAX_RES_TIME) {
      return resultArr
    }
    let item = stack.pop()
    let x1 = item.x
    let y1 = item.y
    while (x1 > 0 && colorMatch(getColorAtPixel(imageData, x1, y1), oldColor, similar)) {
      x1--
    }
    x1++
    spanAbove = 0
    spanBelow = 0
    while (x1 < width && colorMatch(getColorAtPixel(imageData, x1, y1), oldColor, similar)) {
      setColorAtPixel(imageData, newColor, x1, y1)
      const index = width * y1 * 4 + x1 * 4
      resultArr.push(index)
      if (!spanAbove && y1 > 0 && colorMatch(getColorAtPixel(imageData, x1, y1 - 1), oldColor, similar)) {
        stack.push({ x: x1, y: y1 - 1 })
        spanAbove = 1
      } else if (spanAbove && y1 > 0 && !colorMatch(getColorAtPixel(imageData, x1, y1 - 1), oldColor, similar)) {
        spanAbove = 0
      }
      if (!spanBelow && y1 < height - 1 && colorMatch(getColorAtPixel(imageData, x1, y1 + 1), oldColor, similar)) {
        stack.push({ x: x1, y: y1 + 1 })
        spanBelow = 1
      } else if (spanBelow && y1 < height - 1 && !colorMatch(getColorAtPixel(imageData, x1, y1 + 1), oldColor, similar)) {
        spanBelow = 0
      }
      x1++
    }
  }
  return resultArr
}

export const colorMatch = (a, b, similar) => {
  if (similar !== 100) {
    const colorA = rgb2lab([a.r, a.g, a.b])
    const colorB = rgb2lab([b.r, b.g, b.b])
    const colorC = rgb2lab([0, 0, 0])
    const labA = { L: colorA[0], A: colorA[1], B: colorA[2] }
    const labB = { L: colorB[0], A: colorB[1], B: colorB[2] }
    const labC = { L: colorC[0], A: colorC[1], B: colorC[2] }
    const colorDistance = getDeltaE00(labA, labB)
    return getDeltaE00(labA, labC) < 1 ? colorDistance < 1 : colorDistance < 8
  }
  return a.r === b.r && a.g === b.g && a.b === b.b
}

export const getColorAtPixel = (imageData, x, y) => {
  const { width, data } = imageData

  return {
    r: data[4 * (width * y + x) + 0],
    g: data[4 * (width * y + x) + 1],
    b: data[4 * (width * y + x) + 2],
    a: data[4 * (width * y + x) + 3]
  }
}

export const setColorAtPixel = (imageData, color, x, y) => {
  const { width, data } = imageData

  data[4 * (width * y + x) + 0] = color.r & 0xff
  data[4 * (width * y + x) + 1] = color.g & 0xff
  data[4 * (width * y + x) + 2] = color.b & 0xff
  data[4 * (width * y + x) + 3] = color.a & 0xff
}

export const hexToRGB = (hex) => {
  hex = hex.replace('#', '')
  const r = parseInt(hex.substring(0, hex.length / 3), 16)
  const g = parseInt(hex.substring(hex.length / 3, 2 * hex.length / 3), 16)
  const b = parseInt(hex.substring(2 * hex.length / 3, 3 * hex.length / 3), 16)
  return { red: r, green: g, blue: b }
}

export const copyImageList = (arr) => {
  var out = []
  for (var i = 0, len = arr.length; i < len; i++) {
    var item = arr[i]
    var obj = {}
    for (var k in item) {
      obj[k] = item[k]
    }
    out.push(obj)
  }
  return out
}

const rgb2lab = (rgb) => {
  // eslint-disable-next-line one-var
  var r = rgb[0] / 255,
    g = rgb[1] / 255,
    b = rgb[2] / 255,
    x, y, z

  r = (r > 0.04045) ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92
  g = (g > 0.04045) ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92
  b = (b > 0.04045) ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92

  x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047
  y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.00000
  z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883

  x = (x > 0.008856) ? Math.pow(x, 1 / 3) : (7.787 * x) + 16 / 116
  y = (y > 0.008856) ? Math.pow(y, 1 / 3) : (7.787 * y) + 16 / 116
  z = (z > 0.008856) ? Math.pow(z, 1 / 3) : (7.787 * z) + 16 / 116

  return [(116 * y) - 16, 500 * (x - y), 200 * (y - z)]
}

export const filterErasePath = (erasePath, deleteAreaList) => {
  let updateErasePath = [...erasePath]
  deleteAreaList.forEach(area => {
    const intersection = checkIntersection(area.data, erasePath, true)
    if (intersection.length > 0) {
      updateErasePath = difference(updateErasePath, intersection)
    }
  })
  return updateErasePath
}

export const updateDeleteAreaList = (paintPath, deleteAreaList) => {
  return deleteAreaList.filter((area) => {
    const intersection = checkIntersection(area.data, paintPath, true)
    if (intersection.length > 0) {
      area.data = difference(area.data, intersection)
      return true
    }
  })
}

export const breakGroupIfhasIntersection = (state, ref) => {
  const { groupAreaList, groupSelectList } = state
  const { CFICanvasPaint, canvasOffsetWidth, canvasOffsetHeight } = ref
  let idsToUngroup = []
  let newGroupSelectList = []
  const drawPath = getImageCordinateByPixelPaintBrush(CFICanvasPaint, canvasOffsetWidth, canvasOffsetHeight, false)
  for (let i = 0; i < groupAreaList.length; i++) {
    const isHasIntersection = checkIntersection(groupAreaList[i].selectPath, drawPath)
    if (isHasIntersection) {
      groupAreaList.splice(i, 1)
      i--
    }
  }
  if (idsToUngroup.length !== 0) {
    newGroupSelectList = groupSelectList.filter(item => {
      return (idsToUngroup.indexOf(item.id) === -1)
    })
  }
  return { newGroupSelectList: newGroupSelectList, newGroupAreaList: groupAreaList }
}

export const getCanvasWrapperOffset = (CFIWrapper) => {
  let canvasWrapperOffset = {}
  if (CFIWrapper.current) {
    const wrapperClientOffset = CFIWrapper.current.getBoundingClientRect()
    canvasWrapperOffset.x = parseInt(wrapperClientOffset.left, 10)
    canvasWrapperOffset.y = parseInt(wrapperClientOffset.top, 10)
    canvasWrapperOffset.width = parseInt(wrapperClientOffset.width, 10)
    canvasWrapperOffset.height = parseInt(wrapperClientOffset.height, 10)
  }
  return canvasWrapperOffset
}

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

export const drawPaintBrushPath = (context: Object, to: Object, from: Object, width: number, brushShape: string, clip: boolean, state: Object, props: Object, ref: Object) => {
  const { lpActiveColor } = props
  const { activeTool } = state
  const { CFICanvas2, canvasOriginalDimensions } = ref
  const lpActiveColorRGB = (activeTool === toolNames.ERASE) ? `rgba(255, 255, 255, 1)` : `rgb(${lpActiveColor.red}, ${lpActiveColor.green}, ${lpActiveColor.blue})`
  context.fillStyle = lpActiveColorRGB
  const canvasClientOffset = CFICanvas2.current.getBoundingClientRect()
  const scale = canvasOriginalDimensions.width / canvasClientOffset.width
  const radius = Math.round(0.5 * width * scale)
  if (clip) {
    context.save()
    context.globalCompositeOperation = 'destination-out'
    context.beginPath()
    drawAcrossLine(context, to, from, (ctx, x, y) => {
      if (brushShape === brushSquareShape) {
        ctx.rect(x - radius, y - radius, width * scale, width * scale)
      } else {
        ctx.arc(x, y, radius, 0, 2 * Math.PI)
      }
    })
    context.fill()
    context.restore()
  } else {
    context.save()
    context.beginPath()
    drawAcrossLine(context, to, from, (ctx, x, y) => {
      if (brushShape === brushSquareShape) {
        ctx.rect(x - radius, y - radius, width * scale, width * scale)
      } else {
        ctx.arc(x, y, radius, 0, 2 * Math.PI)
        ctx.closePath()
      }
    })
    context.fill()
    context.restore()
  }
}

export const drawPaintBrushPoint = (point: Object, lastPoint: Object, state: Object, props: Object, ref) => {
  const { paintBrushWidth, activeTool, eraseBrushWidth, paintBrushShape, eraseBrushShape } = state
  const { CFICanvasContext2, CFICanvasContextPaint } = ref
  const previousPoint = lastPoint || point

  if (activeTool === toolNames.ERASE) {
    drawPaintBrushPath(CFICanvasContext2, point, previousPoint, eraseBrushWidth, eraseBrushShape, true, state, props, ref)
    drawPaintBrushPath(CFICanvasContextPaint, point, previousPoint, eraseBrushWidth, eraseBrushShape, false, state, props, ref)
  } else {
    drawPaintBrushPath(CFICanvasContextPaint, point, previousPoint, paintBrushWidth, paintBrushShape, false, state, props, ref)
  }
}

export const drawPaintBrushPathUsingLine = (ctx: Object, currentPoint: Object, lastPoint: Object, paintBrushWidth: number, paintBrushShape: string, clip: boolean, color: string, ref: Object) => {
  const { CFICanvas2, canvasOriginalDimensions } = ref
  ctx.save()
  if (paintBrushShape === brushRoundShape) {
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }
  const canvasClientOffset = CFICanvas2.current.getBoundingClientRect()
  const scale = canvasOriginalDimensions.width / canvasClientOffset.width
  ctx.lineWidth = paintBrushWidth * scale
  ctx.strokeStyle = color
  ctx.moveTo(lastPoint.x, lastPoint.y)
  ctx.lineTo(currentPoint.x, currentPoint.y)
  if (clip) {
    ctx.clip()
  } else {
    ctx.stroke()
  }
  ctx.restore()
}

export const constgetPaintBrushActiveClass = (state) => {
  const { paintBrushWidth, paintBrushShape } = this.state
  let paintBrushActiveClass = ''
  let paintBrushCircleActiveClass = ''
  if (paintBrushWidth === brushLargeSize) {
    paintBrushActiveClass = paintBrushLargeClass
    if (paintBrushShape === brushRoundShape) paintBrushCircleActiveClass = paintBrushLargeCircleClass
  } else if (paintBrushWidth === brushMediumSize) {
    paintBrushActiveClass = paintBrushMediumClass
    if (paintBrushShape === brushRoundShape) paintBrushCircleActiveClass = paintBrushMediumCircleClass
  } else if (paintBrushWidth === brushSmallSize) {
    paintBrushActiveClass = paintBrushSmallClass
    if (paintBrushShape === brushRoundShape) paintBrushCircleActiveClass = paintBrushSmallCircleClass
  } else if (paintBrushWidth === brushTinySize) {
    paintBrushActiveClass = paintBrushTinyClass
    if (paintBrushShape === brushRoundShape) paintBrushCircleActiveClass = paintBrushTinyCircleClass
  }
  return { paintBrushActiveClass: paintBrushActiveClass, paintBrushCircleActiveClass: paintBrushCircleActiveClass }
}

export const getPaintBrushActiveClass = (state) => {
  const { paintBrushWidth, paintBrushShape } = state
  let paintBrushActiveClass = ''
  let paintBrushCircleActiveClass = ''
  if (paintBrushWidth === brushLargeSize) {
    paintBrushActiveClass = paintBrushLargeClass
    if (paintBrushShape === brushRoundShape) paintBrushCircleActiveClass = paintBrushLargeCircleClass
  } else if (paintBrushWidth === brushMediumSize) {
    paintBrushActiveClass = paintBrushMediumClass
    if (paintBrushShape === brushRoundShape) paintBrushCircleActiveClass = paintBrushMediumCircleClass
  } else if (paintBrushWidth === brushSmallSize) {
    paintBrushActiveClass = paintBrushSmallClass
    if (paintBrushShape === brushRoundShape) paintBrushCircleActiveClass = paintBrushSmallCircleClass
  } else if (paintBrushWidth === brushTinySize) {
    paintBrushActiveClass = paintBrushTinyClass
    if (paintBrushShape === brushRoundShape) paintBrushCircleActiveClass = paintBrushTinyCircleClass
  }
  return { paintBrushActiveClass: paintBrushActiveClass, paintBrushCircleActiveClass: paintBrushCircleActiveClass }
}

export const getEraseBrushActiveClass = (state) => {
  const { eraseBrushWidth, eraseBrushShape } = state
  let eraseBrushActiveClass = ''
  let eraseBrushCircleActiveClass = ''
  if (eraseBrushWidth === brushLargeSize) {
    eraseBrushActiveClass = paintBrushLargeClass
    if (eraseBrushShape === brushRoundShape) eraseBrushCircleActiveClass = paintBrushLargeCircleClass
  } else if (eraseBrushWidth === brushMediumSize) {
    eraseBrushActiveClass = paintBrushMediumClass
    if (eraseBrushShape === brushRoundShape) eraseBrushCircleActiveClass = paintBrushMediumCircleClass
  } else if (eraseBrushWidth === brushSmallSize) {
    eraseBrushActiveClass = paintBrushSmallClass
    if (eraseBrushShape === brushRoundShape) eraseBrushCircleActiveClass = paintBrushSmallCircleClass
  } else if (eraseBrushWidth === brushTinySize) {
    eraseBrushActiveClass = paintBrushTinyClass
    if (eraseBrushShape === brushRoundShape) eraseBrushCircleActiveClass = paintBrushTinyCircleClass
  }
  return { eraseBrushActiveClass: eraseBrushActiveClass, eraseBrushCircleActiveClass: eraseBrushCircleActiveClass }
}

export const canvasDimensionFactors = (options: Object) => {
  const { canvasWidth, canvasHeight, containerWidth, containerHeight, panX, panY, zoom } = options
  let canvasScaleX = canvasWidth / containerWidth
  let canvasScaleY = canvasHeight / containerHeight
  let shouldFitWidth = false
  let shouldFitHeight = false
  let width = 0
  let height = 0

  if (canvasScaleX > canvasScaleY) {
    // image is wider than it is tall
    shouldFitWidth = true
  } else {
    // image is taller than it is wide
    shouldFitHeight = true
  }

  if (shouldFitWidth) {
    width = containerWidth * zoom
    height = width * canvasHeight / canvasWidth
  } else if (shouldFitHeight) {
    height = containerHeight * zoom
    width = height * canvasWidth / canvasHeight
  }

  const widthFactor = width / containerWidth
  const heightFactor = height / containerHeight
  const clampedPanX = (widthFactor < 1) ? 0.5 : panX
  const clampedPanY = (heightFactor < 1) ? 0.5 : panY
  const xFactor = clampedPanX * (1 - widthFactor)
  const yFactor = clampedPanY * (1 - heightFactor)

  return {
    widthFactor, heightFactor, xFactor, yFactor
  }
}

export const shouldCanvasResize = (prevWidth: number, newWidth: number) => {
  if (newWidth !== prevWidth) {
    return newWidth
  }
  return 0
}

export const applyDimensionFactorsToCanvas = (factors: Object, ref: Object) => {
  const { CFICanvas, CFICanvas2, CFICanvasPaint } = ref
  applyDimensionFactorsByCanvas(factors, CFICanvas)
  applyDimensionFactorsByCanvas(factors, CFICanvas2)
  applyDimensionFactorsByCanvas(factors, CFICanvasPaint)
}

export const applyDimensionFactorsByCanvas = (factors: Object, canvas: RefObject) => {
  canvas.current.style.width = `${Math.floor(factors.widthFactor * 100)}%`
  canvas.current.style.height = `${Math.floor(factors.heightFactor * 100)}%`
  canvas.current.style.left = `${Math.floor(factors.xFactor * 100)}%`
  canvas.current.style.top = `${Math.floor(factors.yFactor * 100)}%`
}

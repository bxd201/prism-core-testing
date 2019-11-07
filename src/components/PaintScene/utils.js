import { getDeltaE00 } from 'delta-e'
import difference from 'lodash/difference'
import uniqueId from 'lodash/uniqueId'

const MAX_STACK_SIZE = 200

export const getPaintAreaPath = (imagePathList, canvas, width, height, color, isPaintBrush = false) => {
  const RGB = getActiveColorRGB(color)
  const array = (isPaintBrush) ? getImageCordinateByPixelPaintBrush(canvas, width, height) : getImageCordinateByPixel(canvas, RGB, width, height)
  const newArea = {
    id: uniqueId(),
    color: RGB,
    data: array,
    isEnabled: true,
    linkedOperation: null,
    siblingOperations: null
  }
  const copyImagePathList = copyImageList(imagePathList)
  copyImagePathList.push(newArea)
  return copyImagePathList
}

export const getImageCordinateByPixel = (canvas, color, width, height) => {
  const ctx = canvas.current.getContext('2d')
  let imageData = ctx.getImageData(0, 0, width, height)
  let data = imageData.data
  let pixelArray = []
  for (let index = 0; index < data.length; index += 4) {
    if (data[index] === color[0] && data[index + 1] === color[1] && data[index + 2] === color[2]) {
      pixelArray.push(index)
    }
  }
  return pixelArray
}

export const getImageCordinateByPixelPaintBrush = (canvas, width, height) => {
  const ctx = canvas.current.getContext('2d')
  let imageData = ctx.getImageData(0, 0, width, height)
  let data = imageData.data
  let pixelArray = []
  for (let index = 0; index < data.length; index += 4) {
    if (data[index] !== 0 && data[index + 1] !== 0 && data[index + 2] !== 0) {
      pixelArray.push(index)
    }
  }
  return pixelArray
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
  ctx.fill()
  ctx.stroke()
  ctx.closePath()
  ctx.restore()
}

export const Circle = (ctx, x, y, radius, scale, fillStyle, type = 'source-over', alpha = 255) => {
  let circleObj = {
    ctx: ctx,
    x: x,
    y: y,
    radius: radius * scale,
    lineWidth: 2,
    type: type
  }
  circleObj.startAngle = 0
  circleObj.endAngle = Math.PI * 2
  circleObj.color = `rgba(255, 255, 255, ${alpha})`
  circleObj.fillStyle = fillStyle
  drawCircle(circleObj)
  return circleObj
}

export const drawHollowCircle = (ctxDraw, cursorX, cursorY, scale, color, alpha) => {
  Circle(ctxDraw, cursorX, cursorY, 10, scale, color, 'source-over', alpha)
  Circle(ctxDraw, cursorX, cursorY, 4, scale, 'rgba(255, 255, 255, 0)', 'source-over', alpha)
  Circle(ctxDraw, cursorX, cursorY, 2, scale, 'rgba(255, 255, 255, 255)', 'destination-out')
}

export const repaintCircleLine = (ctx, start, list, scale) => {
  ctx.beginPath()
  for (let i = 0; i < list.length; i++) {
    Circle(ctx, list[i][0], list[i][1], 6, scale, 'rgba(255, 255, 255, 0)')
    if (i === 0) {
      drawLine(ctx, start, list[i], true, scale)
    } else {
      drawLine(ctx, list[i - 1], list[i], true, scale)
    }
  }
  ctx.closePath()
}

export const pointInsideCircle = (x, y, circle, r) => {
  let dx = circle[0] - x
  let dy = circle[1] - y
  return dx * dx + dy * dy <= r * r
}

export const alterRGBByPixel = (canvas, color, width, height) => {
  const ctx = canvas.current.getContext('2d')
  let imageData = ctx.getImageData(0, 0, width, height)
  let data = imageData.data
  for (let i = 0; i < data.length; i += 4) {
    data[i] = color[0]
    data[i + 1] = color[1]
    data[i + 2] = color[2]
  }
  ctx.putImageData(imageData, 0, 0)
}

export const drawLine = (ctx, lineStart, end, isDash, scale = 1) => {
  ctx.save()
  ctx.beginPath()
  ctx.strokeStyle = '#fff'
  ctx.lineWidth = 1.5 * scale
  isDash && ctx.setLineDash([5, 15])
  ctx.moveTo(lineStart[0], lineStart[1])
  ctx.lineTo(end[0], end[1])
  ctx.stroke()
  ctx.setLineDash([])
  ctx.closePath()
  ctx.restore()
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

export const checkIntersection = (areaA, areaB) => {
  const setA = new Set(areaA)
  const setB = new Set(areaB)
  const intersection = new Set([...setA].filter(x => setB.has(x)))
  return Array.from(intersection)
}

export const repaintImageByPath = (imagePathList, canvas, width, height, isEraseRepaint = false) => {
  const ctx = canvas.current.getContext('2d')
  let imageData = ctx.getImageData(0, 0, width, height)
  let data = imageData.data
  for (let i = 0; i < imagePathList.length; i++) {
    if (!isEraseRepaint && !imagePathList[i].hasOwnProperty('drawOrder')) {
      imagePathList[i].drawOrder = i
    }
  }

  const redrawByOrder = imagePathList.map((item, i) => {
    return {
      drawOrder: item.drawOrder,
      historyIndex: i
    }
  }).sort((a, b) => {
    if (a.drawOrder < b.drawOrder) {
      return -1
    }
    if (a.drawOrder > b.drawOrder) {
      return 1
    }
    return 0
  })

  redrawByOrder.forEach(item => {
    const selectedItem = imagePathList[item.historyIndex]
    const path = selectedItem.data
    const color = selectedItem.color
    const isEnabled = selectedItem.isEnabled

    if (path && isEnabled) {
      for (let j = 0; j < path.length; j++) {
        data[path[j]] = color[0]
        data[path[j] + 1] = color[1]
        data[path[j] + 2] = color[2]
        data[path[j] + 3] = color[3]
      }
    }
  })

  ctx.putImageData(imageData, 0, 0)
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

export const eraseIntersection = (imagePathList, erasePath) => {
  const originImagePathList = copyImageList(imagePathList)
  let siblingList = []
  for (let i = 0; i < originImagePathList.length; i++) {
    const data = originImagePathList[i].data
    const isEnabled = originImagePathList[i].isEnabled
    const color = originImagePathList[i].color
    const linkId = originImagePathList[i].id
    const drawOrder = originImagePathList[i].drawOrder
    const intersection = checkIntersection(data, erasePath)
    if (intersection.length > 0 && isEnabled) {
      originImagePathList[i].isEnabled = false
      const remainAreaPath = difference(data, erasePath)
      const newId = uniqueId()
      originImagePathList.push({
        id: newId,
        color: color,
        data: remainAreaPath,
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
export const getSelectArea = (imageData, newColor, x, y, similar = 100) => {
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
    if (stack.length > MAX_STACK_SIZE) {
      /* * when doing Paint Area, colorMatch function would check color if is similar,
      to reduce space complex and avoid stackoverflow, so we set max_stack_size */
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

export const colorMatch = (a, b, similar) => {
  if (similar !== 100) {
    const colorA = rgb2lab([a.r, a.g, a.b])
    const colorB = rgb2lab([b.r, b.g, b.b])
    let labA = { L: colorA[0], A: colorA[1], B: colorA[2] }
    let labB = { L: colorB[0], A: colorB[1], B: colorB[2] }
    const colorDistance = getDeltaE00(labA, labB)
    if (colorDistance < 100 - similar) {
      return true
    } else {
      return false
    }
  } else {
    return a.r === b.r && a.g === b.g && a.b === b.b && a.a === b.a
  }
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

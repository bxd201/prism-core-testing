import { getDeltaE00 } from 'delta-e'
export const getPaintAreaPath = (imagePathList, canvas, width, height, color) => {
  const RGB = getActiveColorRGB(color)
  const array = getImageCordinateByPixel(canvas, RGB, width, height)
  const newArea = {
    color: RGB,
    data: array
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

export const checkColorRGBEqual = (rgb, newRgb) => {
  return rgb[0] === newRgb[0] && rgb[1] === newRgb[1] && rgb[2] === newRgb[2] && rgb[3] === newRgb[3]
}

export const getActiveColorRGB = (color) => {
  const { red, green, blue } = color
  return [red, green, blue, 255]
}

export const drawCircle = (ctx, x, y) => {
  ctx.save()
  ctx.beginPath()
  ctx.strokeStyle = '#fff'
  ctx.arc(x, y, 10, 0, Math.PI * 2, false)
  ctx.closePath()
  ctx.stroke()
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

export const repaintImageByPath = (imagePathList, canvas, width, height) => {
  const ctx = canvas.current.getContext('2d')
  for (let i = 0; i < imagePathList.length; i++) {
    drawImagePixelByPath(ctx, width, height, imagePathList[i].color, imagePathList[i].data)
  }
}

export const drawImagePixelByPath = (ctx, width, height, color, path) => {
  let imageData = ctx.getImageData(0, 0, width, height)
  let data = imageData.data
  for (let i = 0; i < path.length; i++) {
    data[path[i]] = color[0]
    data[path[i] + 1] = color[1]
    data[path[i] + 2] = color[2]
    data[path[i] + 3] = color[3]
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
  for (let i = 0; i < originImagePathList.length; i++) {
    const intersection = checkIntersection(originImagePathList[i].data, erasePath)
    if (intersection.length > 0) {
      const remainArea = new Set([...originImagePathList[i].data])
      for (let i = 0; i < intersection.length; i++) {
        remainArea.delete(intersection[i])
      }
      originImagePathList[i].data = [...remainArea]
    }
  }
  return originImagePathList
}

export const getSelectArea = (imageData, newColor, x, y, similar = 100) => {
  let resultArr = []
  const { width, height } = imageData
  const stack = []
  const baseColor = getColorAtPixel(imageData, x, y)
  let operator = { x, y }

  // Check if base color and new color are the same
  if (colorMatch(baseColor, newColor)) {
    return
  }

  // Add the clicked location to stack
  stack.push({ x: operator.x, y: operator.y })

  while (stack.length) {
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

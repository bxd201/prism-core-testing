import cloneDeep from 'lodash/cloneDeep'

export const getPaintAreaPath = (imagePathList, canvas, width, height, color) => {
  /** This function is to create merged paint area path based on given imageList
   * Because we using index to stand for image path, and each index is unique in the canvas. so if any of image has
   * intersection, then we say their index are same.
   * So now The whole question we can convert it to how to merge array inside a 2D array which has intersection,
   * so there are some possible cases as list below.
   * 1.paint areas dont have intersection no matter there color are same or not. we dont do anything
   * 2.paint areas have same color and have intersection, then we merge the area
   * current imageList "[[1, 2, 3], [4, 5]" comming image path "[5, 6]", then we get "[[1, 2, 3],[4, 5, 6]]"
   * current imageList "[[1, 2, 3], [4, 5], [7, 8]]" comming image path "[3, 4, 6]", then we get "[[1, 2, 3, 4, 5, 6],[7, 8]]"
   * 3.paint areas hava different color and have intersection, then we need take out intersection area path from covered image,
   * if whole intersection beem took out, and remain nothing in covered image then we can say the old image be full cover, then
   * we remove it from the pathlist.
  */
  const RGB = getActiveColorRGB(color)
  const array = getImageCordinateByPixel(canvas, RGB, width, height)
  const newArea = {
    color: RGB,
    data: array
  }
  const copyImagePathList = cloneDeep(imagePathList)
  if (copyImagePathList.length === 0) {
    copyImagePathList.push(newArea)
  } else {
    let mergeArea = cloneDeep(newArea)
    for (let i = 0; i < copyImagePathList.length; i++) {
      const hasSameColor = checkColorRGBEqual(copyImagePathList[i].color, mergeArea.color)
      const intersection = checkIntersection(copyImagePathList[i].data, mergeArea.data)
      if (intersection.length > 0) {
        if (hasSameColor) {
          const newMergeArea = {
            color: mergeArea.color,
            data: [...new Set([...mergeArea.data, ...copyImagePathList[i].data])]
          }
          copyImagePathList.splice(i, 1)
          i--
          mergeArea = cloneDeep(newMergeArea)
        } else {
          const remainArea = new Set([...copyImagePathList[i].data])
          for (let i = 0; i < intersection.length; i++) {
            remainArea.delete(intersection[i])
          }
          copyImagePathList[i].data = [...remainArea]
        }
      } else {
        copyImagePathList.push(mergeArea)
      }
    }
    for (let i = 0; i < copyImagePathList.length; i++) {
      if (copyImagePathList[i].data.length === 0) {
        copyImagePathList.splice(i, 1)
        i--
      }
    }
    copyImagePathList.push(mergeArea)
  }
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

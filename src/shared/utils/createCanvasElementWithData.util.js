// @flow
export default function createCanvasElementWithData (data: ImageData, width: number = 0, height: number = 0, atX: number = 0, atY: number = 0): HTMLCanvasElement {
  const elem = document.createElement('canvas')
  const ctx = elem.getContext('2d')

  elem.width = width
  elem.height = height

  ctx.putImageData(data, atX, atY)

  return elem
}

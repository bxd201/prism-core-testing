// @flow
export default function getImageDataFromImage (img: Image, width: number = 0, height: number = 0): ImageData {
  const elem = document.createElement('canvas')
  const ctx = elem.getContext('2d')

  elem.width = width
  elem.height = height

  ctx.drawImage(img, 0, 0, width, height)

  return ctx.getImageData(0, 0, width, height)
}

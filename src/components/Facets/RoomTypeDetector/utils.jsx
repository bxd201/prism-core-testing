export function loadImage (img) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.crossOrigin = 'Anonymous'
    image.onload = () => resolve(image)
    image.onerror = () => reject(Error(`Error loading ${img}`))

    image.src = img
  })
}

export function getImageRgbaData (img, width, height) {
  const elem = document.createElement('canvas')
  const ctx = elem.getContext('2d')

  elem.width = width
  elem.height = height

  ctx.drawImage(img, 0, 0, width, height)

  return ctx.getImageData(0, 0, width, height)
}

export function createCanvasElementWithData (data, width, height) {
  const elem = document.createElement('canvas')
  const ctx = elem.getContext('2d')

  elem.width = width
  elem.height = height

  ctx.putImageData(data, 0, 0)

  return elem
}

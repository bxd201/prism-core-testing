// @flow
export default function loadImage (src: string): Promise<Image> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.crossOrigin = 'Anonymous'
    image.onload = () => resolve(image)
    image.onerror = () => reject(Error(`Error loading ${src}`))

    image.src = src
  })
}

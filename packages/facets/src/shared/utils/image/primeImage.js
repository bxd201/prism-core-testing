// @flow
export default function primeImage (baseImage: string, surface: string, callback: Function): string {
  function handleSurfaceLoaded (e: Event) {
    const canvas = document.createElement('canvas')
    const width = e.target.naturalWidth
    const height = e.target.naturalHeight
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    ctx.drawImage(backgroundImage, 0, 0)
    ctx.save()

    const workingCanvas = document.createElement('canvas')
    workingCanvas.width = width
    workingCanvas.height = height
    const workingCtx = workingCanvas.getContext('2d')
    workingCtx.drawImage(e.target, 0, 0)

    const baseData = ctx.getImageData(0, 0, width, height)
    const { data: maskData } = workingCtx.getImageData(0, 0, width, height)

    for (let i = 0; i < maskData.length; i += 4) {
      // use any completely non-transparent pixel from the mask to desaturate the base image
      if (maskData[i] && maskData[i + 1] && maskData[i + 2] && maskData[i + 3]) {
        // get grayscale value
        const grayVal = baseData.data[i] * 0.299 + baseData.data[i + 1] * 0.587 + baseData.data[i + 2] * 0.114

        baseData.data[i] = grayVal
        baseData.data[i + 1] = grayVal
        baseData.data[i + 2] = grayVal
      }
    }

    ctx.clearRect(0, 0, width, height)
    ctx.putImageData(baseData, 0, 0)
    ctx.save()

    ctx.globalAlpha = 0.73
    ctx.globalCompositeOperation = 'overlay'
    ctx.drawImage(e.target, 0, 0)
    ctx.restore()

    const primedImage = canvas.toDataURL()
    callback(primedImage, width, height)

    e.target.removeEventListener('load', handleSurfaceLoaded)
  }

  function handleBgLoaded (e: Event) {
    const surfaceImage = document.createElement('img')
    surfaceImage.addEventListener('load', handleSurfaceLoaded)
    surfaceImage.src = surface

    e.target.removeEventListener('load', handleBgLoaded)
  }

  const backgroundImage = document.createElement('img')
  backgroundImage.addEventListener('load', handleBgLoaded)
  backgroundImage.src = baseImage
}

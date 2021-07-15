// @flow
import Jimp from 'jimp'

// export const POSITION_ENUM = {
//   TOP: 'TOP',
//   MIDDLE: 'MIDDLE',
//   BOTTOM: 'BOTTOM',
//   LEFT: 'LEFT',
//   CENTER: 'CENTER',
//   RIGHT: 'RIGHT'
// }

export const IMAGE_MANIPULATION_ENUM = {
  SCALE_AND_CROP: 'SCALE_AND_CROP',
  SCALE_TO_HEIGHT: 'SCALE_TO_HEIGHT'
}

export function scaleAndCropImageToSquare (url: string, toWidth: number) {
  return editImage(url, toWidth, IMAGE_MANIPULATION_ENUM.SCALE_AND_CROP)
}

export function scaleImage (url: string, toHeight: number) {
  return editImage(url, toHeight, IMAGE_MANIPULATION_ENUM.SCALE_TO_HEIGHT)
}

export async function editImage (url: string, constraint: number, operation) {
  let image = await Jimp.read(url)
  const width = image.getWidth()
  const height = image.getHeight()

  const isPortrait = height > width
  const scaleFactor = isPortrait ? height / width : width / height

  const scaleWidth = isPortrait ? constraint : Math.floor(constraint * scaleFactor)
  const scaleHeight = isPortrait ? Math.floor(constraint * scaleFactor) : constraint

  const x = Math.floor(isPortrait ? 0 : (scaleWidth - constraint) / 2)
  const y = Math.floor(isPortrait ? (scaleHeight - constraint) / 2 : 0)

  // @todo return image url and image refs -RS

  const data = {
    originalImageWidth: width,
    originalImageHeight: height,
    originalIsPortrait: isPortrait
  }

  if (operation === IMAGE_MANIPULATION_ENUM.SCALE_AND_CROP) {
    data.imageWidth = constraint
    data.imageHeight = constraint
    data.landscapeWidth = constraint
    data.landscapeHeight = constraint
    data.isPortrait = false

    image = image.scaleToFit(scaleWidth, scaleHeight).crop(x, y, constraint, constraint)
  }

  if (operation === IMAGE_MANIPULATION_ENUM.SCALE_TO_HEIGHT) {
    const scaleToHeight = constraint
    const scaleToWidth = Math.floor(scaleFactor * scaleToHeight)
    data.imageWidth = scaleToWidth
    data.imageHeight = scaleToHeight
    data.isPortrait = isPortrait

    if (isPortrait) {
      data.portraitWidth = scaleWidth
      data.portraitHeight = scaleHeight
    } else {
      data.landscapeWidth = scaleWidth
      data.landscapeHeight = scaleHeight
    }

    image = image.scaleToFit(scaleToWidth, scaleToHeight)
  }

  image.getBase64(Jimp.AUTO, (err, payload) => {
    if (err) {
      console.error(err)
    }
    data.url = payload
  })
  return data
}

export function extractRefDimensions (data: any) {
  return Object.keys(data).reduce((acc, curr) => {
    if (curr !== 'url') {
      acc[curr] = data[curr]
    }
    return acc
  }, {})
}

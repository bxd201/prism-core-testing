import heic2any from 'heic2any'
import { ProcessedImageMetadata } from '../../types'

export const convertImage = async (file: File): Promise<Blob> => (
  await heic2any({
    blob: file,
    toType: 'image/jpeg',
    quality: 1
  })
)

interface setImageMetadataReturn {
  then: (cb: (imageMetadata: ProcessedImageMetadata) => void) => void
}
export const setImageMetadata = (url: string, maxHeight: number): setImageMetadataReturn => {
  const image = new Image()
  const imageMetadata: ProcessedImageMetadata = {
    originalImageHeight: 0,
    originalImageWidth: 0,
    originalIsPortrait: false,
    url
  }
  image.src = url

  return {
    then: cb => {
      image.onload = () => {
        const height = image.height
        const width = image.width
        const isPortrait = height > width

        imageMetadata.originalImageHeight = height
        imageMetadata.originalImageWidth = width
        imageMetadata.originalIsPortrait = isPortrait

        const scaleToWidth = maxHeight ? Math.floor(maxHeight * width / height) : width
        const scaleToHeight = maxHeight ?? height

        imageMetadata.imageHeight = scaleToHeight
        imageMetadata.imageWidth = scaleToWidth
        imageMetadata.isPortrait = isPortrait

        if (isPortrait) {
          imageMetadata.portraitHeight = scaleToHeight
          imageMetadata.portraitWidth = scaleToWidth
        } else {
          imageMetadata.landscapeHeight = scaleToHeight
          imageMetadata.landscapeWidth = scaleToWidth
        }

        cb(imageMetadata)
      }
    }
  }
}
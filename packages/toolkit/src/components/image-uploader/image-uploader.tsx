import React, { forwardRef, SyntheticEvent, useState } from 'react'
import heic2any from 'heic2any'
import { ProcessedImageMetadata } from '../../types'

export interface ImageUploaderProps {
  imageProcessLoader?: JSX.Element
  maxHeight?: number
  processedImageMetadata: (imageMetadata: ProcessedImageMetadata) => void
}

/**
 * Uploads an image, resizes the image when max height is set, and returns processed image metadata
 * @param {JSX.Element} imageProcessLoader - optional image process loader
 * @param {number} maxHeight - optional constrained height of the image uploaded
 * @param {HTMLAttributes} otherProps - optional props like `aria-label`, `className`, and `style` for uploader
 * @param {(imageMetadata: ProcessedImageMetadata) => void} processedImageMetadata - processed image metadata callback function
 * @param {(e: SyntheticEvent<HTMLInputElement>) => void} ref - optional input element reference
 * @example
 * ```JSX
 *   <ImageUploader processedImageMetadata={imageMetadata => {}} ref={imageUploadRef} />
 * ```
 */
const ImageUploader = forwardRef<HTMLInputElement, ImageUploaderProps>(
  ({ imageProcessLoader = <>loading...</>, maxHeight, processedImageMetadata, ...otherProps }, ref): JSX.Element => {
    const [isProcessing, setIsProcessing] = useState(false)

    const convertImage = async (file: File): Promise<Blob> => (
      await (heic2any({
        blob: file,
        toType: 'image/jpeg',
        quality: 1,
      }) as Promise<Blob>)
    )

    const hasHEICExt = (fileName = ''): boolean => {
      const nameParts = fileName.toLowerCase().split('.')
      return nameParts?.indexOf('heic') === nameParts.length - 1
    }

    const setImageMetadata = (url: string): void => {
      const image = new Image()
      const imageMetadata: ProcessedImageMetadata = {
        originalImageHeight: 0,
        originalImageWidth: 0,
        originalIsPortrait: false,
        url
      }

      image.src = url
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

        processedImageMetadata(imageMetadata)
        setIsProcessing(false)
      }
    }

    const handleUpload = (e: SyntheticEvent<HTMLInputElement>): void => {
      setIsProcessing(true)
      const input = e.target as HTMLInputElement
      const files = input.files

      if (files?.length) {
        const imageFile = files[0]
        // check file ext as a fallback for machines that may not have HEIC file types registered
        if (imageFile.type === 'image/heic' || hasHEICExt(imageFile.name)) {
          convertImage(imageFile)
            .then(imageBlob => {
              setImageMetadata(URL.createObjectURL(imageBlob))
            })
            .catch(err => {
              console.error(err)
            })
        } else {
          setImageMetadata(URL.createObjectURL(imageFile))
        }
      }
    }

    return (
      <div {...otherProps}>
        <input
          className='hidden'
          accept='.png, .jpg, .jpeg, .heic'
          type='file'
          ref={ref}
          onChange={handleUpload}
        />
        {isProcessing && imageProcessLoader}
      </div>
    )
  }
)

export default ImageUploader

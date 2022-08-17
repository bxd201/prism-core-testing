import React, { forwardRef, SyntheticEvent, useState } from 'react'
import { convertImage, setImageMetadata } from './image-uploader.utils'
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

    const hasHEICExt = (fileName = ''): boolean => {
      const nameParts = fileName.toLowerCase().split('.')
      return nameParts?.indexOf('heic') === nameParts.length - 1
    }

    const handleImageMetadata = (url: string): void => {
      setImageMetadata(url, maxHeight)
        .then(imageMetadata => {
          processedImageMetadata(imageMetadata)
          setIsProcessing(false)
        })
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
              handleImageMetadata(URL.createObjectURL(imageBlob))
            })
            .catch(err => {
              console.error(err)
            })
        } else {
          handleImageMetadata(URL.createObjectURL(imageFile))
        }
      }
    }

    return (
      <div {...otherProps}>
        <input
          accept='.png, .jpg, .jpeg, .heic'
          className='hidden'
          data-testid='input'
          onChange={handleUpload}
          ref={ref}
          type='file'
        />
        {isProcessing && imageProcessLoader}
      </div>
    )
  }
)

export default ImageUploader

import React, { useRef, useState } from 'react'
import CircleLoader from '../circle-loader/circle-loader'
import ImageUploader from './image-uploader'
import { ProcessedImageMetadata } from '../../types'

const Template = (args): JSX.Element => {
  const imageUploadRef = useRef<HTMLInputElement>()
  const [image, setImage] = useState<ProcessedImageMetadata>()

  return (
    <>
      <button className='relative px-6 py-3 border border-black z-20' onClick={() => imageUploadRef.current?.click()}>
        Upload
      </button>
      <ImageUploader
        {...args}
        className='flex justify-center items-center absolute top-0 right-4 bottom-4 left-0 w-full h-full z-10'
        imageProcessLoader={<CircleLoader aria-label='loader' />}
        processedImageMetadata={imageMetadata => {
          args.processedImageMetadata(imageMetadata)
          setImage(imageMetadata)
        }}
        ref={imageUploadRef}
      />
      <img className='relative mt-4' src={image?.url} style={{ minWidth: `${image?.imageWidth}px`, height: `${image?.imageHeight}px` }} />
    </>
  )
}

export const Default = Template.bind({})
Default.args = { maxHeight: 1000 }

export default {
  title: 'ImageUploader',
  component: ImageUploader,
  argTypes: {
    imageProcessLoader: { table: { defaultValue: { summary: 'loading...' } } },
    maxHeight: {
      control: { type: 'number', min: 200, max: 2000, step: 100 },
      description: 'constrained height of the image uploaded',
    },
    otherProps: { description: 'optional props like `aria-label`, `className`, and `style`' },
    processedImageMetadata: {
      action: 'processedImageMetadata',
      description: 'Processed image metadata callback function'
    },
    ref: { description: 'input element reference - used to start upload `click()`' }
  }
}

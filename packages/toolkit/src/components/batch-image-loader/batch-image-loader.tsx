// This comp uses the image queue and fires a callback when they have all loaded

// DON NOT HOLD ON TO THE REFS RETURNED in the handleImagesLoaded
import React, { useRef, useState, useEffect, SyntheticEvent } from 'react'
import ImageQueue from '../image-queue/image-queue'

export interface OrderedImageItem {
  index: number
  target: HTMLImageElement
}
export type BatchImageLoaderCallback = (images: OrderedImageItem[]) => void
export interface BatchImageLoaderProps {
  urls: string[]
  handleImagesLoaded: BatchImageLoaderCallback
}

const BatchImageLoader = (props: BatchImageLoaderProps): JSX.Element => {
  const imageRefs = useRef([])
  const { urls, handleImagesLoaded } = props
  const [imageRefsCount, setImageRefsCount] = useState(0)
  useEffect(() => {
    if (imageRefs.current.length && imageRefs.current.length === urls.length) {
      const sortedImages = imageRefs.current.sort((a, b) => {
        if (a.index > b.index) {
          return 1
        }

        if (a.index < b.index) {
          return -1
        }

        return 0
      })
      console.warn(
        'Use event DOM references safely in the handleImagesLoaded callback of BatchImageLoader, do not hold on to them.'
      )
      handleImagesLoaded(sortedImages)
    }
  }, [imageRefsCount])

  useEffect(() => {
    return () => {
      imageRefs.current.length = 0
    }
  }, [])

  const accumulateImages = (e: SyntheticEvent, i: number): void => {
    imageRefs.current.push({ index: i, target: e.target })
    setImageRefsCount(imageRefs.current.length)
  }

  return <ImageQueue dataUrls={urls} addToQueue={accumulateImages} />
}

export default BatchImageLoader

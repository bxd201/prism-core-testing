// @flow
import React, { useRef, useState } from 'react'
import { CircleLoader } from '@prism/toolkit'

import { type SegmentationResults } from 'src/shared/hooks/useDeepLabModelForSegmentation'

import './ObjectLoader.scss'
import Pieces from './Pieces'

type ObjectLoaderProps = {
  roomData: SegmentationResults,
  imgSrc: string
}
const baseClassName = 'ObjectLoader'
const overlayClassName = `${baseClassName}__overlay`
const bgClassName = `${baseClassName}__bg`

function ObjectLoader ({ roomData, imgSrc }: ObjectLoaderProps) {
  const imgRef = useRef(null)
  const [imageDims, setImageDims] = useState(null)
  const [imageWidth, setImageWidth] = useState(0)
  const [imageHeight, setImageHeight] = useState(0)

  const imgLoaded = (e: SyntheticEvent) => {
    const dims = imgRef.current.getBoundingClientRect()
    setImageDims(dims)
    const { width, height } = getBgWrapperDims({ width: e.target.naturalWidth, height: e.target.naturalHeight }, 513)
    setImageWidth(width)
    setImageHeight(height)
  }

  // @todo This only works for portrait!!!! -RS
  const getBgWrapperDims = (dims: any, maxWidth: number) => {
    const { width, height } = dims
    let newWidth = width
    let newHeight = height
    const isTooBig = Math.max(width, height) > maxWidth

    if (isTooBig) {
      newWidth = maxWidth
      newHeight = Math.floor(maxWidth * height / width)
    }

    const newDims = { width: newWidth, height: newHeight }
    return newDims
  }

  return (
    <>
      <img style={{ display: 'none' }} src={imgSrc} ref={imgRef} onLoad={imgLoaded} alt='This is invisible to the user' />
      <div className={baseClassName}>
        <div style={imageDims ? { width: imageWidth, height: imageHeight } : null} className={overlayClassName}>
          {roomData ? <Pieces roomData={roomData} /> : null}
        </div>
        {imageDims ? <img className={bgClassName} style={imageDims ? { width: imageWidth, height: imageHeight } : null} src={imgSrc} alt='user upload' /> : <CircleLoader />}
      </div>
    </>
  )
}

export default ObjectLoader

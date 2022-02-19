/**
 * This component encapsulates all of the match photo logic
 */
// @flow
import React, { useEffect, useRef, useState } from 'react'
import { CircleLoader } from '../ToolkitComponents'
import ColorPinsGenerationByHue from './workers/colorPinsGenerationByHue.worker'
import PrismImage from '../PrismImage/PrismImage'
import type { Color } from '../../shared/types/Colors'
import MatchPhoto from './MatchPhoto'

import './MatchPhotoContainer.scss'
import type { ImageDimensions } from '../../shared/types/lib/CVWTypes'

type MatchPhotoContainerProps = {
 imageUrl: string,
  colors: Color[],
  maxSceneHeight: number,
  scalingWidth: number,
  // needed by current matchphoto
  imageDims: ImageDimensions
}

const baseClass = 'match-photo-container-wrapper'

const MatchPhotoContainer = (props: MatchPhotoContainerProps) => {
  const { imageUrl, colors, maxSceneHeight, scalingWidth, imageDims } = props
  const imageRef = useRef()
  const [imageData, setImageData] = useState(null)
  const [width, setWidth] = useState(0)
  const [height, setHeight] = useState(0)
  const [imageIsPortrait, setImageIsPortrait] = useState(null)
  const [pins, setPins] = useState(null)

  const handleImageLoaded = (payload: PrismImageData) => {
    const { data, width, height, isPortrait } = payload
    setImageData(data)
    setWidth(width)
    setHeight(height)
    setImageIsPortrait(isPortrait)
  }

  useEffect(() => {
    if (colors && imageData && !pins) {
      // $FlowIgnore - flow can't understand how the worker is being used since it's not exporting anything
      const colorPinsGenerationByHueWorker = new ColorPinsGenerationByHue()

      const messageHandler = (e: any) => {
        const { pinsRandom } = e.data
        setPins(pinsRandom)

        if (colorPinsGenerationByHueWorker) {
          colorPinsGenerationByHueWorker.removeEventListener('message', messageHandler)
          colorPinsGenerationByHueWorker.terminate()
        }
      }

      colorPinsGenerationByHueWorker.addEventListener('message', messageHandler)
      colorPinsGenerationByHueWorker.postMessage({ imageData: imageData, imageDimensions: { width: width, height: height }, colors })
    }
  }, [imageUrl, imageData, width, height, colors, pins])
  return (<div className={baseClass}>
    {imageUrl ? <PrismImage ref={imageRef} source={imageUrl} loadedCallback={handleImageLoaded} scalingWidth={scalingWidth} /> : null }
    { pins
      ? <MatchPhoto
      imageUrl={imageUrl}
      wrapperWidth={scalingWidth}
      isPortrait={imageIsPortrait}
      imageDims={imageDims}
      pins={pins}
      maxHeight={maxSceneHeight} />
      : <CircleLoader /> }
  </div>)
}

export default MatchPhotoContainer

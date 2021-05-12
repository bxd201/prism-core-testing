/**
 * This component encapsulates all of the match photo logic
 */
// @flow
import React, { useEffect, useRef, useState } from 'react'
import ColorPinsGenerationByHue from './workers/colorPinsGenerationByHue.worker'
import PrismImage from '../PrismImage/PrismImage'
import type { Color } from '../../shared/types/Colors'

type MatchPhotoContainerProps = {
 imageUrl: string,
  scalingWidth: number,
  colors: Color[]
}

const MatchPhotoContainer = (props: MatchPhotoContainerProps) => {
  const { imageUrl, scalingWidth, colors } = props
  // @todo may not need image ref -RS
  const imageRef = useRef()
  const hasLoaded = useState(false)
  const [imageData, setImageData] = useState(null)
  const [width, setWidth] = useState(0)
  const [height, setHeight] = useState(0)
  // eslint-disable-next-line no-unused-vars
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
    // $FlowIgnore - flow can't understand how the worker is being used since it's not exporting anything
    const messageHandler = (e: any) => {
      const { pinsRandom } = e.data
      setPins(pinsRandom)
      if (colorPinsGenerationByHueWorker) {
        colorPinsGenerationByHueWorker.removeEventListener('message', messageHandler)
        colorPinsGenerationByHueWorker.terminate()
      }
    }

    const colorPinsGenerationByHueWorker = new ColorPinsGenerationByHue()
    colorPinsGenerationByHueWorker.addEventListener('message', messageHandler)
    colorPinsGenerationByHueWorker.postMessage({ imageData: imageData, imageDimensions: { width: width, height: height }, colors })
  }, [imageUrl, imageData, width, height])
  return (<>
    <PrismImage ref={imageRef} source={imageUrl} loadedCallback={handleImageLoaded} shouldResample={hasLoaded} scalingWidth={scalingWidth} />
  </>)
}

export default MatchPhotoContainer

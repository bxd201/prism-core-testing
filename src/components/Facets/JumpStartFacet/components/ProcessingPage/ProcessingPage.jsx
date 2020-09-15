// @flow
import React, { useState } from 'react'

import './ProcessingPage.scss'
import ObjectLoader from '../ObjectLoader/ObjectLoader'
import type { SegmentationResults } from '../../../../../shared/hooks/useDeepLabModelForSegmentation'

type ProcessingPageProps = {
  isLoading: boolean,
  isProcessing: boolean,
  // call onBeginInteraction method when interaction begins
  // eslint-disable-line react/no-unused-prop-types
  onBeginInteraction?: Function,
  // call onEndInteraction method when interaction ends
  // eslint-disable-line react/no-unused-prop-types,
  onEndInteraction?: Function,
  // eslint-disable-next-line react/no-unused-prop-types
  imgUrl: string,
  roomData: SegmentationResults
}

function ProcessingPage (props: ProcessingPageProps) {
  const { isLoading = false, isProcessing = false, onBeginInteraction, onEndInteraction, roomData, imgUrl } = props
  const message = isLoading ? 'Loading...' : isProcessing ? 'Processing...' : 'Processing complete. Ready when you are!'
  const [isInteracting, setIsInteracting] = useState(false)

  return (
    <div className='JSFCommon__band JSFCommon__band--pad'>
      <div className='JSFCommon__content JSFCommon__content--centered JSFCommon__text'>
        <ObjectLoader roomData={roomData} img={imgUrl} />
        <p>{message}</p>
        <button className='JSFProcessingPage__demo-btn' disabled={isInteracting} onClick={() => {
          setIsInteracting(true)
          onBeginInteraction && onBeginInteraction()
        }}>Begin</button>
        <button className='JSFProcessingPage__demo-btn' disabled={!isInteracting} onClick={() => {
          setIsInteracting(false)
          onEndInteraction && onEndInteraction()
        }}>End</button>
      </div>
    </div>
  )
}

export default ProcessingPage

// @flow
import React, { useState } from 'react'
import CircleLoader from 'src/components/Loaders/CircleLoader/CircleLoader'

import './ProcessingPage.scss'

type ProcessingPageProps = {
  isLoading: boolean,
  isProcessing: boolean,
  // call onBeginInteraction method when interaction begins
  onBeginInteraction?: Function, // eslint-disable-line react/no-unused-prop-types
  // call onEndInteraction method when interaction ends
  onEndInteraction?: Function // eslint-disable-line react/no-unused-prop-types
}

function ProcessingPage (props: ProcessingPageProps) {
  const { isLoading = false, isProcessing = false, onBeginInteraction, onEndInteraction } = props
  const message = isLoading ? 'Loading...' : isProcessing ? 'Processing...' : 'Processing complete. Ready when you are!'
  const [isInteracting, setIsInteracting] = useState(false)

  return (
    <div className='JSFCommon__band JSFCommon__band--pad'>
      <div className='JSFCommon__content JSFCommon__content--centered JSFCommon__text'>
        <CircleLoader />
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

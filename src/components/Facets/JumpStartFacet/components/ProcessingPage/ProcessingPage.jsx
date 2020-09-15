// @flow
import React, { useState, useEffect, useRef } from 'react'
// import CircleLoader from 'src/components/Loaders/CircleLoader/CircleLoader'

import './ProcessingPage.scss'
// import ObjectLoader from '../ObjectLoader/ObjectLoader'
import type { SegmentationResults } from '../../../../../shared/hooks/useDeepLabModelForSegmentation'

type ProcessingPageProps = {
  roomData: object,
  isProcessingDone: Function,
  imageSrc: string,
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
  const { isLoading = false, isProcessing = false, onBeginInteraction, onEndInteraction, roomData, imageSrc, isProcessingDone } = props
  const message = isLoading || isProcessing ? 'Loading image...' : 'Processing image...'
  const [isInteracting, setIsInteracting] = useState(false)
  const [processingContent, setProcessingContent] = useState([])
  let count = useRef(0)
  useEffect(() => {
    if (roomData && roomData.pieces) {
      if (processingContent.length !== roomData.pieces.length) {
        const timer = setTimeout(() => {
          setProcessingContent([...processingContent, roomData.pieces[count.current++]])
        }, 2000)
        return () => clearTimeout(timer)
      } else {
        const timer = setTimeout(() => {
          isProcessingDone()
        }, 2000)
        return () => clearTimeout(timer)
      }
    }
  }, [processingContent])

  return (
    <div className='JSFCommon__band JSFCommon__band--pad'>
      <div className='JSFCommon__content JSFCommon__content--centered JSFCommon__text'>

        {!isLoading && <div className='JSFProcessingPage__loading-details'>
          <div className='JSFProcessingPage__loading-details__left' >
            {!processingContent.length && <img src={imageSrc} alt='' />}
            {processingContent.length > 0 && <img className='JSFProcessingPage__loading-details__img' src={processingContent[processingContent.length - 1].img} alt='' />}
          </div>
          <div className='JSFProcessingPage__loading-details__right'>
            <div className='JSFProcessingPage__loading-details__right__label'>Read your space...</div>
            {processingContent.length > 0 && processingContent.map((pieces, key) => {
              return <span key={key} className='JSFProcessingPage__loading-details__right__label'> we found your {pieces.label}</span>
            })}
          </div>
        </div>}
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

// @flow
import React, { useState, useEffect, useRef } from 'react'

import './ProcessingPage.scss'
import ObjectLoader from '../ObjectLoader/ObjectLoader'

type ProcessingPageProps = {
  roomData: object,
  isProcessingDone: Function,
  imageSrc: string,
  isLoading: boolean
}

function ProcessingPage (props: ProcessingPageProps) {
  const { isLoading = false, roomData, imageSrc, isProcessingDone } = props
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
        <div className={'jumpstart__logo'}><img src={require('src/images/jumpstart/jumpstartlogo.png')} alt='jumpstart logo' /></div>
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
        <ObjectLoader roomData={roomData} imgSrc={imageSrc} />
      </div>
    </div>
  )
}

export default ProcessingPage

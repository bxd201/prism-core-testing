// @flow
import React, { useEffect, useRef,useState } from 'react'
import ObjectLoader from '../ObjectLoader/ObjectLoader'
import './ProcessingPage.scss'

type ProcessingPageProps = {
  roomData: object,
  isProcessingDone: Function,
  imageSrc: string,
  isLoading: boolean
}

function ProcessingPage (props: ProcessingPageProps) {
  const { isLoading = false, roomData, imageSrc, isProcessingDone } = props
  const [processingContent, setProcessingContent] = useState([])
  const count = useRef(0)
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
        <ObjectLoader roomData={roomData} imgSrc={imageSrc} />
        {!isLoading && <div className='JSFProcessingPage__loading-details'>
          <div className='JSFProcessingPage__loading-details__left' >
            {!processingContent.length && <img src={imageSrc} alt='' />}
            {processingContent.length > 0 && <img className='JSFProcessingPage__loading-details__img' src={processingContent[processingContent.length - 1].img} alt='' />}
          </div>
          <div className='JSFProcessingPage__loading-details__right'>
            <div className={`${processingContent.length > 0 ? 'JSFProcessingPage__loading-details__right__label--light' : 'JSFProcessingPage__loading-details__right__label'}`}>Reading your space...</div>
            {processingContent.length > 0 && processingContent.map((pieces, key) => {
              return <span key={key} className={`${processingContent.length - 1 !== key ? 'JSFProcessingPage__loading-details__right__label--light' : 'JSFProcessingPage__loading-details__right__label'}`}> we found your {pieces.label}</span>
            })}
          </div>
        </div>}
      </div>
    </div>
  )
}

export default ProcessingPage

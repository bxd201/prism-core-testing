/**
 * This component is the heir to the ImageRotateContainer.  Unlike its predecessor it does not try to render the image
 * destination component, it instead sets data and trigger the app to route to a component that can react to the set data.
 */
// @flow

import React, { useContext, useEffect, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { FormattedMessage, useIntl } from 'react-intl'
import { Link, useHistory } from 'react-router-dom'
import { AutoSizer } from 'react-virtualized'
import Prism, { ImageRotator } from '@prism/toolkit'
import PrismImage from '../PrismImage/PrismImage'
import Iconography from '../Iconography/Iconography'
import { calcOrientationDimensions } from '../../shared/utils/scale.util'
import ConfigurationContext, { type ConfigurationContextType } from '../../contexts/ConfigurationContext/ConfigurationContext'
import { LiveMessage } from 'react-aria-live'
import { KEY_CODES } from '../../constants/globals'
import './ImageIngestView.scss'

type ImageIngestViewProps = {
  cleanupCallback?: Function,
  imageUrl: string,
  maxSceneHeight: number,
  handleDismissCallback: Function,
  closeLink: string
}

const baseClassName = 'image-ingest-view'

const ImageIngestView = (props: ImageIngestViewProps) => {
  const { imageUrl, maxSceneHeight, handleDismissCallback, cleanupCallback, closeLink } = props
  const imageRef = useRef<?HTMLImageElement>(null)
  const wrapperRef = useRef<?HTMLDivElement>(null)
  const wrapperDims = wrapperRef.current?.getBoundingClientRect()
  const { cvw = {} } = useContext<ConfigurationContextType>(ConfigurationContext)
  const { backBtn, closeBtn = {}, termsOfUseLink = 'https://www.sherwin-williams.com/terms-of-use' } = cvw
  const { showArrow: closeBtnShowArrow = true, text: closeBtnText = <FormattedMessage id='CLOSE' /> } = closeBtn
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [rotateLiveMessage, setRotateLiveMessage] = useState('')
  const [mouseDown, setMouseDown] = useState(false)
  const [orientationDimensions, setOrientationDimensions] = useState({
    portraitWidth: 0,
    portraitHeight: 0,
    landscapeWidth: 0,
    landscapeHeight: 0,
    originalImageWidth: 0,
    originalImageHeight: 0
  })
  const [scalingWidth, setScalingWidth] = useState(0)
  const { formatMessage } = useIntl()
  const history = useHistory()

  useEffect(() => {
    setScalingWidth(wrapperDims?.width)

    return () => {
      if (cleanupCallback) {
        cleanupCallback()
      }
    }
  }, [])

  const focusHandler = e => {
    mouseDown && e.target.blur()
  }

  const handleCloseButton = e => {
    e.preventDefault()
    handleDismissCallback()
  }

  const handleImageLoaded = payload => {
    const image = imageRef.current
    if (image && wrapperDims) {
      const dimensions = calcOrientationDimensions(image.width, image.height, payload.isPortrait, wrapperDims.width, maxSceneHeight)
      // This hasLoaded flag stops the prismimage comp from continually resampling the image
      setHasLoaded(true)
      setOrientationDimensions(dimensions)
    }
  }

  const handleLiveMessage = (direction: string) => {
    setRotateLiveMessage(`Image rotated 90 degree ${direction}`)
    const startOverLM = setTimeout(() => { setRotateLiveMessage('') }, 250)

    return () => clearTimeout(startOverLM)
  }

  return (
    <div className={`${baseClassName}__wrapper`} ref={wrapperRef}>
      {imageUrl ? <PrismImage ref={imageRef} source={imageUrl} loadedCallback={handleImageLoaded} shouldResample={hasLoaded} scalingWidth={scalingWidth} /> : null}
      <div className={`${baseClassName}__container`} style={{ maxHeight: maxSceneHeight }}>
        <div className={`${baseClassName}__header`}>
          <button className={`${baseClassName}__button ${baseClassName}__button--left`} onClick={() => history.goBack()}>
            {backBtn?.icon ? <Iconography name={backBtn?.icon} style={{ width: '.85rem', height: '.85rem' }} /> : <FontAwesomeIcon icon={['fa', 'angle-left']} />}
            <span className={`${baseClassName}__button-left-text`}><FormattedMessage id='BACK' /></span>
          </button>
          <Link to={closeLink} tabIndex='-1'>
            <button onClick={handleCloseButton} className={`${baseClassName}__button ${baseClassName}__button--right dark-button`}>
              <div className={`${baseClassName}__close`}>{closeBtnText ?? <FormattedMessage id='CLOSE' />}{closeBtnShowArrow && <FontAwesomeIcon className={`${baseClassName}__close--icon`} icon={['fa', 'chevron-up']} />}</div>
              <div className={`${baseClassName}__cancel`}><FontAwesomeIcon icon={['fa', 'times']} /></div>
            </button>
          </Link>
        </div>
        <AutoSizer disableHeight style={{ width: '100%' }}>
          {({ width }) => {
            const smallScreen = width <= 576

            return hasLoaded && (
              <Prism>
                <ImageRotator className={`${baseClassName}__image-rotator`} imageMetadata={{ ...orientationDimensions, url: imageUrl }}>
                  {!smallScreen && <ImageRotator.Image />}
                  <div className={`${baseClassName}__modal ${!smallScreen ? ' absolute' : ''}`}>
                    {smallScreen && <div className='m-7 mb-0'><ImageRotator.Image fitContainer /></div>}
                    <p className='m-5'><FormattedMessage id='PREVIEW_ROTATE_SCALE' /></p>
                    <ImageRotator.RotateControls className={`${baseClassName}__controls`}>
                      {(onRotateLeftClick, onRotateRightClick) => (
                        <>
                          <button
                            aria-label='rotate image 90 degree anticlockwise'
                            className={`${baseClassName}__rotate-arrow`}
                            onClick={() => {
                              onRotateLeftClick()
                              handleLiveMessage('anticlockwise')
                            }}
                            onFocus={focusHandler}
                            onMouseDown={() => setMouseDown(true)}
                            onMouseUp={() => setMouseDown(false)}
                          >
                            <FontAwesomeIcon icon={['fal', 'undo']} />
                          </button>
                          <button
                            aria-label='rotate image 90 degree clockwise'
                            className={`${baseClassName}__rotate-arrow`}
                            onClick={() => {
                              onRotateRightClick()
                              handleLiveMessage('clockwise')
                            }}
                            onFocus={focusHandler}
                            onMouseDown={() => setMouseDown(true)}
                            onMouseUp={() => setMouseDown(false)}
                          >
                            <FontAwesomeIcon icon={['fal', 'redo']} />
                          </button>
                        </>
                      )}
                    </ImageRotator.RotateControls>
                    <div className={`${baseClassName}__agree-terms`}>
                      <label
                        aria-label={formatMessage({ id: 'ACCEPT_TERM' })}
                        className={`${baseClassName}__agree-terms--checkbox-label`}
                        onFocus={focusHandler}
                        onMouseDown={() => setMouseDown(true)}
                        onMouseUp={() => setMouseDown(false)}
                        onKeyDown={e => {
                          if (e.keyCode && (e.keyCode === KEY_CODES.KEY_CODE_ENTER || e.keyCode === KEY_CODES.KEY_CODE_SPACE)) {
                            e.preventDefault()
                          }
                        }}
                        tabIndex={0}
                      >
                        <FontAwesomeIcon icon={['fa', 'dot-circle']} style={{ color: acceptTerms ? '#2cabe1' : '#e5e5e5' }} size='lg' />
                        <input className='visually-hidden' checked={acceptTerms} onChange={() => setAcceptTerms(prev => !prev)} tabIndex={-1} type='checkbox' />
                      </label>
                      <span className={`${baseClassName}__agree-terms--text`}>
                        <FormattedMessage id='I_ACCEPT' /> <a href={termsOfUseLink} target='_blank'><FormattedMessage id='TERMS_OF_USE' /></a>
                      </span>
                    </div>
                    <ImageRotator.Button
                      className={`${baseClassName}--done ${baseClassName}--done${acceptTerms ? '-active' : ''}`}
                      disabled={!acceptTerms}
                      onClick={({ imageHeight, imageWidth, url, ...otherDims }) => handleDismissCallback(url, imageWidth, imageHeight, otherDims)}
                    >
                      <FormattedMessage id='DONE' />
                    </ImageRotator.Button>
                  </div>
                </ImageRotator>
                <LiveMessage message={rotateLiveMessage} aria-live='assertive' clearOnUnmount='true' />
              </Prism>
            )
          }}
        </AutoSizer>
      </div>
    </div>
  )
}

export default ImageIngestView

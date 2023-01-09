/**
 * This component is the heir to the ImageRotateContainer.  Unlike its predecessor it does not try to render the image
 * destination component, it instead sets data and trigger the app to route to a component that can react to the set data.
 */
// @flow

import React, { useContext, useEffect, useState } from 'react'
import { LiveMessage } from 'react-aria-live'
import { FormattedMessage, useIntl } from 'react-intl'
import { Link, useHistory } from 'react-router-dom'
import { AutoSizer } from 'react-virtualized'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Prism, { ImageRotator } from '@prism/toolkit'
import 'src/providers/fontawesome/fontawesome'
import {
  ANALYTICS_EVENTS,
  ANALYTICS_INTERACTIONS_TYPE,
  createGTMData,
  pushToDataLayer
} from '../../analytics/analyticsUtils'
import { KEY_CODES } from '../../constants/globals'
import ConfigurationContext, {
  type ConfigurationContextType
} from '../../contexts/ConfigurationContext/ConfigurationContext'
import { type ProcessedImageMetadata } from '../../shared/types/Scene.js.flow'
import Iconography from '../Iconography/Iconography'
import './ImageIngestView.scss'

type ImageIngestViewProps = {
  cleanupCallback?: Function,
  closeLink: string,
  handleDismissCallback: Function,
  imageMetadata: ProcessedImageMetadata,
  maxSceneHeight: number
}

const baseClassName = 'image-ingest-view'

const ImageIngestView = (props: ImageIngestViewProps) => {
  const { cleanupCallback, closeLink, handleDismissCallback, imageMetadata, maxSceneHeight } = props
  const { cvw = {}, allowedAnalytics } = useContext<ConfigurationContextType>(ConfigurationContext)
  const { backBtn, closeBtn = {}, termsOfUseLink = 'https://www.sherwin-williams.com/terms-of-use' } = cvw
  const { showArrow: closeBtnShowArrow = true, text: closeBtnText = <FormattedMessage id='CLOSE' /> } = closeBtn
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [rotateLiveMessage, setRotateLiveMessage] = useState('')
  const [mouseDown, setMouseDown] = useState(false)
  const { formatMessage } = useIntl()
  const history = useHistory()

  useEffect(() => {
    return () => {
      cleanupCallback?.()
    }
  }, [])

  const focusHandler = (e) => {
    mouseDown && e.target.blur()
  }

  const handleCloseButton = (e) => {
    e.preventDefault()
    handleDismissCallback()
  }

  const handleLiveMessage = (direction: string) => {
    setRotateLiveMessage(`Image rotated 90 degree ${direction}`)
    const startOverLM = setTimeout(() => {
      setRotateLiveMessage('')
    }, 250)

    return () => clearTimeout(startOverLM)
  }

  return (
    <div className={`${baseClassName}__wrapper`}>
      <div className={`${baseClassName}__container`} style={{ maxHeight: maxSceneHeight }}>
        <div className={`${baseClassName}__header`}>
          <button
            className={`text-xs ${baseClassName}__button ${baseClassName}__button--left`}
            onClick={() => history.goBack()}
          >
            {backBtn?.icon ? (
              <Iconography name={backBtn?.icon} style={{ width: '.85rem', height: '.75rem' }} />
            ) : (
              <FontAwesomeIcon icon={['fa', 'angle-left']} />
            )}
            <span className={`${baseClassName}__button-left-text`}>
              <FormattedMessage id='BACK' />
            </span>
          </button>
          <Link to={closeLink} tabIndex='-1'>
            <button
              onClick={handleCloseButton}
              className={`text-xs ${baseClassName}__button ${baseClassName}__button--right dark-button`}
            >
              <div className={`${baseClassName}__close`}>
                {closeBtnText ?? <FormattedMessage id='CLOSE' />}
                {closeBtnShowArrow && (
                  <FontAwesomeIcon className={`${baseClassName}__close--icon`} icon={['fa', 'chevron-up']} />
                )}
              </div>
              <div className={`${baseClassName}__cancel`}>
                <FontAwesomeIcon icon={['fa', 'times']} />
              </div>
            </button>
          </Link>
        </div>
        <AutoSizer disableHeight style={{ width: '100%' }}>
          {({ width }) => {
            const smallScreen = width <= 576

            return (
              imageMetadata && (
                <Prism>
                  <ImageRotator className={`${baseClassName}__image-rotator`} imageMetadata={imageMetadata}>
                    {!smallScreen && <ImageRotator.Image />}
                    <div className={`${baseClassName}__modal ${!smallScreen ? ' absolute' : ''}`}>
                      {smallScreen && (
                        <div className='m-7 mb-0'>
                          <ImageRotator.Image fitContainer />
                        </div>
                      )}
                      <p className='m-5'>
                        <FormattedMessage id='PREVIEW_ROTATE_SCALE' />
                      </p>
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
                          onKeyDown={(e) => {
                            if (
                              e.keyCode &&
                              (e.keyCode === KEY_CODES.KEY_CODE_ENTER || e.keyCode === KEY_CODES.KEY_CODE_SPACE)
                            ) {
                              e.preventDefault()
                            }
                          }}
                          tabIndex={0}
                        >
                          {acceptTerms ? (
                            <FontAwesomeIcon icon={['fa', 'check-square']} size='lg' style={{ color: '#081329' }} />
                          ) : (
                            <FontAwesomeIcon icon={['fal', 'square']} size='lg' sytle={{ color: '#D8DCE8' }} />
                          )}
                          <input
                            className='visually-hidden'
                            checked={acceptTerms}
                            onChange={() => setAcceptTerms((prev) => !prev)}
                            tabIndex={-1}
                            type='checkbox'
                          />
                        </label>
                        <span className={`${baseClassName}__agree-terms--text`}>
                          <FormattedMessage id='I_ACCEPT' />{' '}
                          <a href={termsOfUseLink} target='_blank'>
                            <FormattedMessage id='TERMS_OF_USE' />
                          </a>
                        </span>
                      </div>
                      <ImageRotator.Button
                        className={`${baseClassName}--done ${baseClassName}--done${acceptTerms ? '-active' : ''}`}
                        disabled={!acceptTerms}
                        onClick={({ imageHeight, imageWidth, url, ...otherDims }) => {
                          handleDismissCallback(url, imageWidth, imageHeight, otherDims)

                          pushToDataLayer(
                            createGTMData(
                              ANALYTICS_EVENTS.NOTIFICATION,
                              ANALYTICS_INTERACTIONS_TYPE.NOTIFICATION,
                              null,
                              'successful upload'
                            ),
                            allowedAnalytics
                          )
                        }}
                      >
                        <FormattedMessage id='DONE' />
                      </ImageRotator.Button>
                    </div>
                  </ImageRotator>
                  <LiveMessage message={rotateLiveMessage} aria-live='assertive' clearOnUnmount='true' />
                </Prism>
              )
            )
          }}
        </AutoSizer>
      </div>
    </div>
  )
}

export default ImageIngestView

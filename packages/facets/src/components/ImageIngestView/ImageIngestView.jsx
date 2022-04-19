/**
 * This component is the heir to the ImageRotateContainer.  Unlike its predecessor it does not try to render the image
 * destination component, it instead sets data and trigger the app to route to a component that can react to the set data.
 */
// @flow

import React, { useContext, useEffect, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { FormattedMessage, useIntl } from 'react-intl'
import { Link, useHistory } from 'react-router-dom'
import ImageRotateTerms from './ImageRotateTerms'
import PrismImage from '../PrismImage/PrismImage'
import Iconography from '../Iconography/Iconography'
import { calcOrientationDimensions } from '../../shared/utils/scale.util'
import ConfigurationContext, { type ConfigurationContextType } from '../../contexts/ConfigurationContext/ConfigurationContext'
import './ImageIngestView.scss'
import { getTransformParams } from '../../shared/utils/rotationUtil'
import { LiveMessage } from 'react-aria-live'

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
  const blobUrl = imageUrl
  const history = useHistory()
  const wrapperRef = useRef()
  const canvasRef = useRef()
  const { cvw = {} } = useContext<ConfigurationContextType>(ConfigurationContext)
  const { backBtn, closeBtn = {} } = cvw
  const { showArrow: closeBtnShowArrow = true, text: closeBtnText = <FormattedMessage id='CLOSE' /> } = closeBtn
  // eslint-disable-next-line no-unused-vars
  const [imageData, setImageData] = useState(null)
  // eslint-disable-next-line no-unused-vars
  const [imageAngle, setImageAngle] = useState(0)
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null)
  const imageRef = useRef()
  const [hasLoaded, setHasLoaded] = useState(false)
  const [orientationDimensions, setOrientationDimensions] = useState({
    portraitWidth: 0,
    portraitHeight: 0,
    landscapeWidth: 0,
    landscapeHeight: 0,
    originalImageWidth: 0,
    originalImageHeight: 0
  })
  const [imageDims, setImageDims] = useState({ width: 0, height: 0 })
  const [isPortrait, setIsPortrait] = useState(false)
  const [scalingWidth, setScalingWidth] = useState(0)
  const [imageRotationAngle, setImageRotationAngle] = useState(0)
  const prevOrientationRef = useRef()
  const prevRotationRef = useRef()
  const previousIsPortraitRef = useRef()
  const { formatMessage } = useIntl()

  useEffect(() => {
    prevOrientationRef.current = orientationDimensions
    prevRotationRef.current = imageRotationAngle
    previousIsPortraitRef.current = isPortrait
  })

  useEffect(() => {
    setUploadedImageUrl(imageUrl)
  }, [imageUrl])

  useEffect(() => {
    const { width } = wrapperRef.current.getBoundingClientRect()
    setScalingWidth(width)

    return () => {
      if (cleanupCallback) {
        cleanupCallback()
      }
    }
  }, [])

  useEffect(() => {
    if (!canvasRef.current || !imageRef.current) {
      return
    }
    const { portraitWidth, portraitHeight, landscapeWidth, landscapeHeight, originalIsPortrait, originalImageWidth, originalImageHeight } = prevOrientationRef.current
    const currentDims = wrapperRef.current.getBoundingClientRect()
    const newOrientationDims = calcOrientationDimensions(originalImageWidth, originalImageHeight, originalIsPortrait, currentDims.width, maxSceneHeight)

    const oldWidth = isPortrait ? landscapeWidth : portraitWidth
    const oldHeight = isPortrait ? landscapeHeight : portraitHeight
    let newWidth = isPortrait ? portraitWidth : landscapeWidth
    let newHeight = isPortrait ? portraitHeight : landscapeHeight

    if (newOrientationDims.landscapeWidth !== landscapeWidth) {
      newWidth = isPortrait ? newOrientationDims.portraitWidth : newOrientationDims.landscapeWidth
      newHeight = isPortrait ? newOrientationDims.portraitHeight : newOrientationDims.landscapeHeight
    }

    const {
      canvasWidth,
      canvasHeight,
      vScale,
      hScale,
      vSkew,
      hSkew,
      hTrans,
      vTrans,
      rotation
    } = getTransformParams(imageRotationAngle, newWidth, newHeight)

    const ctx = canvasRef.current.getContext('2d')

    const [relWidth, relHeight] = swapWidthAndHeight(canvasWidth, canvasHeight, originalIsPortrait, isPortrait)

    canvasRef.current.width = relWidth
    canvasRef.current.height = relHeight

    ctx.clearRect(0, 0, oldWidth, oldHeight)
    ctx.save()
    ctx.setTransform(hScale, vSkew, hSkew, vScale, hTrans, vTrans)
    ctx.rotate(rotation)
    ctx.drawImage(imageRef.current, 0, 0, canvasWidth, canvasHeight)
    ctx.restore()

    setUploadedImageUrl(canvasRef.current.toDataURL())
    // Set the image data used by the match color component
    const newImageData = canvasWidth && ctx.getImageData(0, 0, canvasWidth, canvasHeight)
    setImageData(newImageData)
  }, [imageRotationAngle])

  const swapWidthAndHeight = (width, height, originalImageIsPortrait, currentlyIsPortrait) => {
    let relWidth = width
    let relHeight = height

    if (originalImageIsPortrait) {
      if (isPortrait) {
        relWidth = width
        relHeight = height
      } else {
        relWidth = height
        relHeight = width
      }
    } else {
      if (currentlyIsPortrait) {
        relWidth = height
        relHeight = width
      } else {
        relWidth = width
        relHeight = height
      }
    }

    return [relWidth, relHeight]
  }

  const handleCloseButton = (e: SyntheticEvent) => {
    e.preventDefault()
    handleDismissCallback()
  }

  const handleDismissTerms = (e: SyntheticEvent) => {
    e.preventDefault()

    const rotatedImageUrl = canvasRef.current.toDataURL()
    const { width, height } = canvasRef.current
    const dims = { ...orientationDimensions, isPortrait }
    handleDismissCallback(rotatedImageUrl, width, height, dims)
  }

  const drawToCanvas = (image, width, height) => {
    if (!canvasRef.current) {
      return
    }

    canvasRef.current.width = width
    canvasRef.current.height = height
    const ctx = canvasRef.current.getContext('2d')
    ctx.drawImage(image, 0, 0, width, height)
    const newImageData = width && ctx.getImageData(0, 0, width, height)
    setImageData(newImageData)
  }

  const initCanvas = (image: Object, dimensions: Object, orientationIsPortrait: booelan) => {
    const { portraitWidth, portraitHeight, landscapeWidth, landscapeHeight } = dimensions
    const width = orientationIsPortrait ? portraitWidth : landscapeWidth
    const height = orientationIsPortrait ? portraitHeight : landscapeHeight

    drawToCanvas(image, width, height)
  }

  const handleImageLoaded = (payload) => {
    const image = imageRef.current
    const currentDims = wrapperRef.current.getBoundingClientRect()
    const dimensions = calcOrientationDimensions(image.width, image.height, payload.isPortrait, currentDims.width, maxSceneHeight)
    const width = dimensions.originalIsPortrait ? dimensions.portraitWidth : dimensions.landscapeWidth
    const height = dimensions.originalIsPortrait ? dimensions.portraitHeight : dimensions.landscapeHeight

    const imageDims = {
      originalImageWidth: dimensions.originalImageWidth,
      originalImageHeight: dimensions.originalImageHeight,
      imageWidth: width,
      imageHeight: height,
      isPortrait: dimensions.originalIsPortrait,
      originalIsPortrait: dimensions.originalIsPortrait
    }
    // This hasLoaded flag stops the prismimage comp from continually resampling the image
    setHasLoaded(true)
    setOrientationDimensions(dimensions)
    setIsPortrait(dimensions.originalIsPortrait)
    setImageDims(imageDims)
    setIsPortrait(height > width)
    initCanvas(image, dimensions, dimensions.originalIsPortrait)
  }

  function rotateImage (isRightRotation: boolean) {
    const orientation = !isPortrait
    const { portraitWidth, portraitHeight, landscapeWidth, landscapeHeight } = orientationDimensions
    const width = orientation ? portraitWidth : landscapeWidth
    const height = orientation ? portraitHeight : landscapeHeight
    setIsPortrait(orientation)

    if (isRightRotation) {
      if (imageRotationAngle === 270) {
        setImageRotationAngle(0)
      } else if (imageRotationAngle < 270) {
        setImageRotationAngle(imageRotationAngle + 90)
      }
    } else {
      if (imageRotationAngle === -270) {
        setImageRotationAngle(0)
      } else if (imageRotationAngle > -270) {
        setImageRotationAngle(imageRotationAngle - 90)
      }
    }

    const newDims = { ...imageDims, imageWidth: width, imageHeight: height, isPortrait: orientation }
    setImageDims(newDims)
  }

  return (
    <>
      <div className={`${baseClassName}__wrapper`} ref={wrapperRef}>
        {uploadedImageUrl ? <PrismImage ref={imageRef} source={blobUrl} loadedCallback={handleImageLoaded} shouldResample={hasLoaded} scalingWidth={scalingWidth} /> : null}
        <div className={`${baseClassName}__container`}>
          {hasLoaded ? <div className={`${baseClassName}__header`}>
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
          </div> : null}
          <canvas className={`${baseClassName}__canvas`} name='canvas' ref={canvasRef} />
          {hasLoaded ? <ImageRotateTerms rotateImage={rotateImage} imageData={imageData} handleDismiss={handleDismissTerms} /> : null}
        </div>
      </div>
      <LiveMessage message={formatMessage({ id: 'LIVE_MESSAGE_IMAGE_ANGLE' }, { imageRotationAngle: imageRotationAngle })} aria-live='assertive' clearOnUnmount='true' />
    </>
  )
}

export default ImageIngestView

/**
 * This component is the heir to the ImageRotateContainer.  Unlike its predecessor it does not try to render the image
 * destination component, it instead sets data and trigger the app to route to a component that can react to the set data.
 */
// @flow

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { FormattedMessage } from 'react-intl'
import { Link, useHistory } from 'react-router-dom'
import ImageRotateTerms from './ImageRotateTerms'
import React, { useEffect, useRef, useState } from 'react'
import PrismImage from '../PrismImage/PrismImage'
import { calcOrientationDimensions } from '../../shared/utils/scale.util'

import './ImageIngestView.scss'
import { getTransformParams } from '../../shared/utils/rotationUtil'

type ImageIngestViewProps = {
  imageUrl: string,
  maxSceneHeight: number
}

const baseClassName = 'image-ingest-view'

const ImageIngestView = (props: ImageIngestViewProps) => {
  const { imageUrl, maxSceneHeight } = props
  const blobUrl = imageUrl
  const history = useHistory()
  const wrapperRef = useRef()
  const canvasRef = useRef()
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
  // eslint-disable-next-line no-unused-vars
  const [imageWidth, setImageWidth] = useState(0)
  // eslint-disable-next-line no-unused-vars
  const [imageHeight, setImageHeight] = useState(0)
  // this represents a value related to the wrapper width that an image width will be based on.
  // eslint-disable-next-line no-unused-vars
  const [baseWidth, setBaseWidth] = useState(0)
  // Pure wrapper width, only updated by resize after initialized with the rendered wrapper value.
  // eslint-disable-next-line no-unused-vars
  const [wrapperWidth, setWrapperWidth] = useState(0)
  const [scalingWidth, setScalingWidth] = useState(0)
  // eslint-disable-next-line no-unused-vars
  const [imageRotationAngle, setImageRotationAngle] = useState(0)
  // eslint-disable-next-line no-unused-vars
  const [isImageRotated, setIsImageRotated] = useState(false)
  const [resized, setResized] = useState(0)
  // @todo I think we should be able to safely use state for these -RS
  const prevOrientationRef = useRef()
  const prevRotationRef = useRef()
  const previousIsPortraitRef = useRef()

  // I don't think we need this approach to set these values like this anymore -RS
  useEffect(() => {
    prevOrientationRef.current = orientationDimensions
    prevRotationRef.current = imageRotationAngle
    previousIsPortraitRef.current = isPortrait
    // prevBlobUrlRef.current = blobUrl
    // hasLoadedRef.current = hasLoaded
  })

  useEffect(() => {
    setUploadedImageUrl(imageUrl)
  }, [imageUrl])

  useEffect(() => {
    const { width } = wrapperRef.current.getBoundingClientRect()
    setWrapperWidth(width)
    setScalingWidth(width)
    setBaseWidth(width)
    window.addEventListener('resize', resizeHandler)
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
  }, [resized, imageRotationAngle])

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

  const resizeHandler = (e: Event) => {
    setResized(Date.now())
    const { width } = wrapperRef.current.getBoundingClientRect()
    setWrapperWidth(width)
    setBaseWidth(width)
  }

  const handleCloseButton = (e: SyntheticEvent) => {
    history.push('/active')
  }

  const handleDismissTerms = (e: SyntheticEvent) => {
    // @tod implement -RS
    e.preventDefault()
    console.log('Dismissing terms:', e)
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
    setBaseWidth(dimensions.landscapeWidth)
    setImageWidth(width)
    setImageHeight(height)
    setIsPortrait(height > width)
    initCanvas(image, dimensions, dimensions.originalIsPortrait)
  }

  function rotateImage (isRightRotation: boolean) {
    const orientation = !isPortrait
    const { portraitWidth, portraitHeight, landscapeWidth, landscapeHeight } = orientationDimensions
    const width = orientation ? portraitWidth : landscapeWidth
    const height = orientation ? portraitHeight : landscapeHeight
    setIsPortrait(orientation)
    setImageHeight(height)
    setImageWidth(width)

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
    setIsImageRotated(true)
  }

  return (
    <>
      <div className={`${baseClassName}__wrapper`} ref={wrapperRef}>
        {uploadedImageUrl ? <PrismImage ref={imageRef} source={blobUrl} loadedCallback={handleImageLoaded} shouldResample={hasLoaded} scalingWidth={scalingWidth} /> : null}
        <div className={`${baseClassName}__container`}>
          {hasLoaded ? <div className={`${baseClassName}__header`}>
            <button className={`${baseClassName}__button ${baseClassName}__button--left`} onClick={() => history.goBack()}>
              <div><FontAwesomeIcon className={``} icon={['fa', 'angle-left']} />&nbsp;<span className={`${baseClassName}__button-left-text`}><FormattedMessage id='BACK' /></span></div>
            </button>
            <Link to={`/active`} tabIndex='-1'>
              <button onClick={handleCloseButton} className={`${baseClassName}__button ${baseClassName}__button--right dark-button`}>
                <div className={`${baseClassName}__close`}><span><FormattedMessage id='CLOSE' /></span>&nbsp;<FontAwesomeIcon className={``} icon={['fa', 'chevron-up']} /></div>
                {/* @todo I have no idea why this is here, but I will leave it here for a little while, bc I have a feeling it has a purpose... -RS */}
                {/* <div className={`${baseClassName}__cancel`}><FontAwesomeIcon className={``} icon={['fa', 'times']} /></div> */}
              </button>
            </Link>
          </div> : null}
          <canvas className={`${baseClassName}__canvas`} name='canvas' ref={canvasRef} />
          {hasLoaded ? <ImageRotateTerms rotateImage={rotateImage} imageData={imageData} handleDismiss={handleDismissTerms} /> : null}
        </div>
      </div>
    </>
  )
}

export default ImageIngestView

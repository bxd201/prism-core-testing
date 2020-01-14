// @flow
import React, { useState, useEffect, useRef } from 'react'
import ImageRotateTerms from './ImageRotateTerms.jsx'
import { Link, withRouter, type RouterHistory } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import 'src/providers/fontawesome/fontawesome'
import ConfirmationModal from './ConfirmationModal'
import ColorPinsGenerationByHue from './workers/colorPinsGenerationByHue.worker'
import useEffectAfterMount from '../../shared/hooks/useEffectAfterMount'
import PaintScene from '../PaintScene/PaintScene'
import { getScaledPortraitHeight } from '../../shared/helpers/ImageUtils'
import PrismImage from '../PrismImage/PrismImage'
import DynamicColorFromImage from '../InspirationPhotos/DynamicColorFromImage'
import { useSelector } from 'react-redux'

import './MatchPhoto.scss'

const baseClass = 'match-photo'
const wrapperClass = `${baseClass}__wrapper`
const previewClass = `${wrapperClass}--preview`
const containerClass = `${baseClass}__container`
const headerClass = `${baseClass}__header`
const buttonClass = `${baseClass}__button`
const buttonLeftClass = `${buttonClass}--left`
const buttonLeftTextClass = `${buttonClass}-left-text`
const canvasClass = `${baseClass}__canvas`
const buttonRightClass = `${buttonClass}--right`
const closeClass = `${baseClass}__close`
const cancelClass = `${baseClass}__cancel`

const getWrapperClassName = (imageUrl, pins, hasPaintSceneWorkspace) => {
  if (hasPaintSceneWorkspace) {
    return wrapperClass
  } else if (imageUrl && pins.length === 0) {
    return previewClass
  }

  return wrapperClass
}

let colorPinsGenerationByHueWorker: Object

type Props = {
  history: RouterHistory,
  isPaintScene: boolean,
  imgUrl: string
}

type OrientationDimension = {
  portraitWidth: number,
  portraitHeight: number,
  landscapeWidth: number,
  landscapeHeight: number,
  originalImageWidth: number,
  originalImageHeight: number
}

export function MatchPhoto ({ history, isPaintScene, imgUrl }: Props) {
  const canvasRef: RefObject = useRef()
  const wrapperRef: RefObject = useRef()
  const [imageUrl, setImageUrl] = useState(imgUrl)
  const [pins, generatePins] = useState([])
  const [imageData, setImageData] = useState([])
  const [imageRotationAngle, setImageRotationAngle] = useState(0)
  const [isConfirmationModalActive, setConfirmationModalActive] = useState(false)
  const [imageDims, setImageDims] = useState({ width: 0, height: 0 })
  const [isPortrait, setIsPortrait] = useState(false)
  const [imageWidth, setImageWidth] = useState(0)
  const [imageHeight, setImageHeight] = useState(0)
  const [orientationDimensions, setOrientationDimensions] = useState({
    portraitWidth: 0,
    portraitHeight: 0,
    landscapeWidth: 0,
    landscapeHeight: 0,
    originalImageWidth: 0,
    originalImageHeight: 0
  })
  const blobUrl = imgUrl
  const [resized, setResized] = useState(0)
  // Create ref to dimensions so that resize can use them
  const prevOrientationRef = useRef()
  const prevRotationRef = useRef()
  const previousIsPortraitRef = useRef()
  const imageRef = useRef()
  const prevBlobUrlRef = useRef()
  const [scalingWidth, setScalingWidth] = useState(0)
  const [wrapperWidth, setWrapperWidth] = useState(0)
  const [hasLoaded, setHasLoaded] = useState(false)
  const hasLoadedRef = useRef()

  const paintSceneWorkspace = useSelector(state => state.paintSceneWorkspace)

  useEffect(() => {
    prevOrientationRef.current = orientationDimensions
    prevRotationRef.current = imageRotationAngle
    previousIsPortraitRef.current = isPortrait
    prevBlobUrlRef.current = blobUrl
    hasLoadedRef.current = hasLoaded
  })

  useEffectAfterMount(() => {
    if (!canvasRef.current) {
      return
    }
    const { portraitWidth, portraitHeight, landscapeWidth, landscapeHeight, originalIsPortrait, originalImageWidth, originalImageHeight } = prevOrientationRef.current
    const newOrientationDims = calcOrientationDimensions(originalImageWidth, originalImageHeight, originalIsPortrait)

    const oldWidth = isPortrait ? landscapeWidth : portraitWidth
    const oldHeight = isPortrait ? landscapeHeight : portraitHeight
    let newWidth = isPortrait ? portraitWidth : landscapeWidth
    let newHeight = isPortrait ? portraitHeight : landscapeHeight

    if (newOrientationDims.landscapeWidth !== landscapeWidth) {
      newWidth = isPortrait ? newOrientationDims.portraitWidth : newOrientationDims.landscapeWidth
      newHeight = isPortrait ? newOrientationDims.portraitHeight : newOrientationDims.landscapeHeight
    }

    const TAU = 2 * Math.PI
    let rotation = (imageRotationAngle * TAU) / 360

    let hScale = 1
    let vScale = 1
    let vSkew = 0
    let hSkew = 0
    let hTrans = 0
    let vTrans = 0

    let canvasWidth = 0
    let canvasHeight = 0

    switch (imageRotationAngle) {
      case 90:
      case -270:
        hTrans = newWidth
        canvasWidth = newHeight
        canvasHeight = newWidth
        break
      case 180:
      case -180:
        vTrans = newHeight
        hTrans = newWidth
        canvasWidth = newWidth
        canvasHeight = newHeight
        break
      case 270:
      case -90:
        vTrans = newHeight
        canvasWidth = newHeight
        canvasHeight = newWidth
        break
      default:
        // 0 degrees
        rotation = 0
        canvasWidth = newWidth
        canvasHeight = newHeight
    }

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

    // set to pass to PaintScene
    const imageDims = {
      originalImageWidth: originalImageWidth,
      originalImageHeight: originalImageHeight,
      imageWidth: canvasWidth,
      imageHeight: canvasHeight,
      isPortrait,
      originalIsPortrait
    }

    setImageDims(imageDims)
    setImageUrl(canvasRef.current.toDataURL())
    // Set the image data used by the match color component
    const newImageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight)
    setImageData(newImageData)
  }, [resized, imageRotationAngle])

  useEffect(() => {
    const wrapperWidth = wrapperRef.current.getBoundingClientRect().width
    setScalingWidth(wrapperWidth)
    window.addEventListener('resize', resizeHandler)

    return function cleanup () {
      window.removeEventListener('resize', resizeHandler)
      if (colorPinsGenerationByHueWorker) {
        colorPinsGenerationByHueWorker.removeEventListener('message', messageHandler)
        colorPinsGenerationByHueWorker.terminate()
      }
    }
  }, [])

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
    setWrapperWidth(wrapperRef.current.getBoundingClientRect().width)
  }

  const calcOrientationDimensions = (width: number, height: number, orientationIsPortrait: boolean): OrientationDimension => {
    const currentWrapperDims = wrapperRef.current.getBoundingClientRect()
    const wrapperWidth = currentWrapperDims.width
    const dimensions = {}
    let fixedHeight = 0

    if (orientationIsPortrait) {
      // Height should not change on rotate, so use the portrait height as the fixed height
      fixedHeight = Math.round(getScaledPortraitHeight(width, height)(wrapperWidth / 2))

      dimensions.portraitWidth = Math.round(wrapperWidth / 2)
      dimensions.portraitHeight = fixedHeight

      dimensions.landscapeWidth = Math.round(height / width * fixedHeight)
      dimensions.landscapeHeight = fixedHeight
    } else {
      fixedHeight = Math.round(height / width * wrapperWidth)
      dimensions.landscapeWidth = wrapperWidth
      dimensions.landscapeHeight = fixedHeight

      dimensions.portraitHeight = fixedHeight
      dimensions.portraitWidth = Math.round(fixedHeight * height / width)
    }

    dimensions.originalImageWidth = width
    dimensions.originalImageHeight = height
    dimensions.originalIsPortrait = orientationIsPortrait

    return dimensions
  }
  const initCanvas = (image: Object, dimensions: Object, orientationIsPortrait: booelan) => {
    const { portraitWidth, portraitHeight, landscapeWidth, landscapeHeight } = dimensions
    const width = orientationIsPortrait ? portraitWidth : landscapeWidth
    const height = orientationIsPortrait ? portraitHeight : landscapeHeight

    drawToCanvas(image, width, height)
  }

  const drawToCanvas = (image, width, height) => {
    if (!canvasRef.current) {
      return
    }

    canvasRef.current.width = width
    canvasRef.current.height = height
    const ctx = canvasRef.current.getContext('2d')
    ctx.drawImage(image, 0, 0, width, height)
    const newImageData = ctx.getImageData(0, 0, width, height)
    setImageData(newImageData)
  }

  function createColorPins (imageData: Object) {
    if (isPaintScene) {
      generatePins([{ isPaintScene: isPaintScene }])
    } else {
      // get the image data from the current canvas
      const imageData = canvasRef.current.getContext('2d').getImageData(0, 0, imageWidth, imageHeight)
      // $FlowIgnore - flow can't understand how the worker is being used since it's not exporting anything
      colorPinsGenerationByHueWorker = new ColorPinsGenerationByHue()
      colorPinsGenerationByHueWorker.addEventListener('message', messageHandler)
      colorPinsGenerationByHueWorker.postMessage({ imageData: imageData, imageDimensions: { width: imageWidth, height: imageHeight } })
    }
  }

  function messageHandler (e: Object) {
    const { pinsRandom } = e.data
    generatePins(pinsRandom)
    if (colorPinsGenerationByHueWorker) {
      colorPinsGenerationByHueWorker.removeEventListener('message', messageHandler)
      colorPinsGenerationByHueWorker.terminate()
    }
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
  }

  const handleImageLoaded = (payload) => {
    const image = imageRef.current
    const dimensions = calcOrientationDimensions(image.width, image.height, payload.isPortrait)
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

    setWrapperWidth(dimensions.landscapeWidth)
    setImageWidth(width)
    setImageHeight(height)
    setIsPortrait(height > width)
    initCanvas(image, dimensions, dimensions.originalIsPortrait)
  }

  const closeButton = <button onClick={() => (imageUrl && pins.length > 0) && setConfirmationModalActive(!isConfirmationModalActive)} className={`${buttonClass} ${buttonRightClass}`}>
    <div className={`${closeClass}`}><span>CLOSE</span>&nbsp;<FontAwesomeIcon className={``} icon={['fa', 'chevron-up']} /></div>
    <div className={`${cancelClass}`}><FontAwesomeIcon className={``} icon={['fa', 'times']} /></div>
  </button>

  return (
    <React.Fragment>
      <PrismImage ref={imageRef} source={blobUrl} loadedCallback={handleImageLoaded} shouldResample={hasLoaded} scalingWidth={scalingWidth} />
      <div className={`${getWrapperClassName(imageUrl, pins, !!paintSceneWorkspace)}`} ref={wrapperRef}>
        <div className={`${containerClass}`}>

          <div className={`${headerClass}`}>
            {(imageUrl && pins.length === 0 && !paintSceneWorkspace) ? <button className={`${buttonClass} ${buttonLeftClass}`} onClick={() => history.goBack()}>
              <div><FontAwesomeIcon className={``} icon={['fa', 'angle-left']} />&nbsp;<span className={`${buttonLeftTextClass}`}>BACK</span></div>
            </button> : ''}
            {
              (imageUrl && pins.length === 0 && !paintSceneWorkspace) ? <Link to={`/active`}>
                {closeButton}
              </Link> : (imageUrl && pins.length > 0 && !isPaintScene && !paintSceneWorkspace) ? closeButton : ''
            }
          </div>
          {
            (imageUrl && pins.length > 0 && !isPaintScene && !paintSceneWorkspace)
              ? (<React.Fragment>
                <DynamicColorFromImage
                  originalImageWidth={imageDims.originalImageWidth}
                  originalImageHeight={imageDims.originalImageHeight}
                  originalIsPortrait={imageDims.originalIsPortrait}
                  imageUrl={imageUrl}
                  width={wrapperWidth}
                  isPortrait={isPortrait}
                  pins={pins}
                  createColorPins={createColorPins}
                  isActive />
                <ConfirmationModal isActive={isConfirmationModalActive} onClickNo={() => setConfirmationModalActive(!isConfirmationModalActive)} />
              </React.Fragment>)
              : ''
          }
          {
            (imageUrl && pins.length === 0 && !paintSceneWorkspace)
              ? (<React.Fragment>
                <canvas className={canvasClass} name='canvas' ref={canvasRef} />
                <ImageRotateTerms rotateImage={rotateImage} createColorPins={createColorPins} imageData={imageData} />
              </React.Fragment>)
              : ''
          }
          {
            ((imageUrl && isPaintScene && pins.length > 0) || paintSceneWorkspace)
              ? (<React.Fragment>
                <PaintScene imageUrl={imageUrl} workspace={paintSceneWorkspace} imageRotationAngle={imageRotationAngle} referenceDimensions={imageDims} width={wrapperWidth} />
              </React.Fragment>)
              : ''
          }
        </div>
      </div>
      <hr />
    </React.Fragment>
  )
}

export default withRouter(MatchPhoto)

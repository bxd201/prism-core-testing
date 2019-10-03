// @flow
import React, { useState, useEffect, useRef } from 'react'
import FileInput from '../FileInput/FileInput'
import ColorsFromImage from '../ColorsFromImage/ColorsFromImage'
import './MatchPhoto.scss'
import ImageRotateTerms from './ImageRotateTerms.jsx'
import { Link, withRouter, type RouterHistory } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import ConfirmationModal from './ConfirmationModal'
import ColorPinsGenerationByHue from './workers/colorPinsGenerationByHue.worker'
import useEffectAfterMount from '../../shared/hooks/useEffectAfterMount'
import PaintScene from '../PaintScene/PaintScene'
import { loadImage, scaleImage, getScaledPortraitHeight, getScaledLandscapeHeight } from '../../shared/helpers/ImageUtils'

const baseClass = 'match-photo'
const wrapperClass = `${baseClass}__wrapper`
const containerClass = `${baseClass}__container`
const headerClass = `${baseClass}__header`
const buttonClass = `${baseClass}__button`
const buttonLeftClass = `${buttonClass}--left`
const buttonLeftTextClass = `${buttonClass}-left-text`
const canvasClass = `${baseClass}__canvas`
const portraitOrientation = `${canvasClass}--portrait`
const buttonRightClass = `${buttonClass}--right`
const closeClass = `${baseClass}__close`
const cancelClass = `${baseClass}__cancel`

let colorPinsGenerationByHueWorker: Object

type Props = {
  history: RouterHistory,
  isPaintScene: boolean
}

type OrientationDimension = {
  portraitWidth: number,
  portraitHeight: number,
  landscapeWidth: number,
  landscapeHeight: number,
  originalImageWidth: number,
  originalImageHeight: number
}

export function MatchPhoto ({ history, isPaintScene }: Props) {
  const canvasRef: RefObject = useRef()
  const wrapperRef: RefObject = useRef()
  const [imageUrl, setImageUrl] = useState()
  const [pins, generatePins] = useState([])
  // eslint-disable-next-line no-unused-vars
  const [imageData, setImageData] = useState([])
  const [imageRotationAngle, setImageRotationAngle] = useState(0)
  const [isConfirmationModalActive, setConfirmationModalActive] = useState(false)
  const [imageDims, setImageDims] = useState({ width: 0, height: 0 })
  const [isPortrait, setIsPortrait] = useState(false)
  // @todo - clean up backing image -RS
  const [backingImage, setBackingImage] = useState(null)
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

  const [resized, setResized] = useState(0)
  // Create ref to dimensions so that resize can use them
  const prevOrientationRef = useRef()
  const prevRotationRef = useRef()
  const previousIsPortraitRef = useRef()
  useEffect(() => {
    prevOrientationRef.current = orientationDimensions
    prevRotationRef.current = imageRotationAngle
    previousIsPortraitRef.current = isPortrait
  })

  useEffectAfterMount(() => {
    const { portraitWidth, portraitHeight, landscapeWidth, landscapeHeight, originalIsPortrait } = prevOrientationRef.current
    const oldWidth = isPortrait ? landscapeWidth : portraitWidth
    const oldHeight = isPortrait ? landscapeHeight : portraitHeight
    const newWidth = isPortrait ? portraitWidth : landscapeWidth
    const newHeight = isPortrait ? portraitHeight : landscapeHeight

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

    if (originalIsPortrait) {
      if (isPortrait) {
        canvasRef.current.width = canvasWidth
        canvasRef.current.height = canvasHeight
      } else {
        canvasRef.current.width = canvasHeight
        canvasRef.current.height = canvasWidth
      }
    } else {
      if (isPortrait) {
        canvasRef.current.width = canvasHeight
        canvasRef.current.height = canvasWidth
      } else {
        canvasRef.current.width = canvasWidth
        canvasRef.current.height = canvasHeight
      }
    }

    ctx.clearRect(0, 0, oldWidth, oldHeight)
    ctx.save()
    ctx.setTransform(hScale, vSkew, hSkew, vScale, hTrans, vTrans)
    ctx.rotate(rotation)
    ctx.drawImage(backingImage, 0, 0, canvasWidth, canvasHeight)
    ctx.restore()
    // @todo - is this still needed?
    // setImageData(imageData)
  }, [resized, imageRotationAngle])

  useEffect(() => {
    window.addEventListener('resize', resizeHandler)

    return function cleanup () {
      window.removeEventListener('resize', resizeHandler)
      if (colorPinsGenerationByHueWorker) {
        colorPinsGenerationByHueWorker.removeEventListener('message', messageHandler)
        colorPinsGenerationByHueWorker.terminate()
      }
    }
  }, [])

  const resizeHandler = (e: Event) => {
    const wrapper = wrapperRef.current
    const wrapperDims = wrapper.getBoundingClientRect()
    const orientationDims = prevOrientationRef.current
    const width = orientationDims.originalImageWidth
    const height = orientationDims.originalImageHeight
    const imgWidth = isPortrait ? Math.floor(wrapperDims.width / 2) : wrapperDims.width
    const imgHeight = isPortrait ? Math.floor(getScaledPortraitHeight(width, height)(imgWidth)) : Math.floor(getScaledLandscapeHeight(width, height)(imgWidth))
    const newOrientationDims = calcOrientationDimensions(orientationDims.originalImageWidth, orientationDims.originalImageHeight)
    setOrientationDimensions(newOrientationDims)
    setImageWidth(imgWidth)
    setImageHeight(imgHeight)
    setResized(Date.now())
  }

  const calcOrientationDimensions = (width: number, height: number): OrientationDimension => {
    const wrapperWidth = wrapperRef.current.getBoundingClientRect().width

    const orientationIsPortrait = height > width

    const dimensions = {}

    if (orientationIsPortrait) {
      dimensions.portraitWidth = Math.round(wrapperWidth / 2)
      dimensions.portraitHeight = Math.round(getScaledPortraitHeight(width, height)(wrapperWidth / 2))

      dimensions.landscapeWidth = wrapperWidth
      dimensions.landscapeHeight = Math.round(getScaledLandscapeHeight(width, height)(wrapperWidth))
    } else {
      dimensions.landscapeWidth = wrapperWidth
      dimensions.landscapeHeight = Math.round(getScaledPortraitHeight(width, height)(wrapperWidth))

      dimensions.portraitWidth = Math.round(wrapperWidth / 2)
      dimensions.portraitHeight = Math.round(getScaledLandscapeHeight(width, height)(wrapperWidth / 2))
    }

    dimensions.originalImageWidth = width
    dimensions.originalImageHeight = height
    dimensions.originalIsPortrait = orientationIsPortrait

    return dimensions
  }

  function handleChange (e: Event) {
    const imgUrl = URL.createObjectURL(e.target.files[0])
    const imagePromise = loadImage(imgUrl)
    imagePromise.then((imageEvent) => {
      const image = imageEvent.target
      const wrapperSize = wrapperRef.current.getBoundingClientRect()
      const dimensions = calcOrientationDimensions(image.width, image.height)
      const width = dimensions.originalIsPortrait ? dimensions.portraitWidth : dimensions.landscapeWidth
      const height = dimensions.originalIsPortrait ? dimensions.portraitHeight : dimensions.landscapeHeight

      const imageDims = {
        originalImageWidth: dimensions.originalImageWidth,
        originalImageHeight: dimensions.originalImageHeight,
        imageWidth: width,
        imageHeight: height,
        isPortrait: dimensions.originalIsPortrait
      }

      setBackingImage(image)
      setOrientationDimensions(dimensions)
      setIsPortrait(dimensions.originalIsPortrait)
      setImageDims(imageDims)

      // This will scale the image data to no more that 2x the width
      const scalingWidth = width >= wrapperSize * 2 ? 2 * wrapperSize : width
      scaleImage(image, scalingWidth).then(imageData => {
        // This is a canvas render dependency
        setImageUrl(imageData.dataUrl)
        setImageWidth(width)
        setImageHeight(height)
        setIsPortrait(height > width)
        initCanvas(image, dimensions, dimensions.originalIsPortrait)
      })

      // @todo - this image might be a good candidate for putting in redux.
      // @todo - We may not need the imageURL, and may just be able to reference it from the backing image... -RS
    }, err => console.log(err))
  }

  const initCanvas = (image: Object, dimensions: Object, orientationIsPortrait: booelan) => {
    const { portraitWidth, portraitHeight, landscapeWidth, landscapeHeight } = dimensions
    const width = orientationIsPortrait ? portraitWidth : landscapeWidth
    const height = orientationIsPortrait ? portraitHeight : landscapeHeight

    canvasRef.current.width = width
    canvasRef.current.height = height
    const ctx = canvasRef.current.getContext('2d')
    ctx.drawImage(image, 0, 0, width, height)
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

  const getCurrentImageData = () => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')
      if (ctx) {
        return ctx.getImageData(0, 0, imageWidth, imageHeight)
      }
    }

    return null
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

  const closeButton = <button onClick={() => (imageUrl && pins.length > 0) && setConfirmationModalActive(!isConfirmationModalActive)} className={`${buttonClass} ${buttonRightClass}`}>
    <div className={`${closeClass}`}><span>CLOSE</span>&nbsp;<FontAwesomeIcon className={``} icon={['fa', 'chevron-up']} /></div>
    <div className={`${cancelClass}`}><FontAwesomeIcon className={``} icon={['fa', 'times']} /></div>
  </button>

  return (
    <React.Fragment>
      <div className={`${wrapperClass}`} ref={wrapperRef}>
        <div className={`${containerClass}`}>
          { (!imageUrl) &&
          <FileInput onChange={handleChange} id={'photoInput'} disabled={false} placeholder={'Select image'} />
          }
          <div className={`${headerClass}`}>
            {(imageUrl && pins.length === 0) ? <button className={`${buttonClass} ${buttonLeftClass}`} onClick={() => history.goBack()}>
              <div><FontAwesomeIcon className={``} icon={['fa', 'angle-left']} />&nbsp;<span className={`${buttonLeftTextClass}`}>BACK</span></div>
            </button> : ''}
            {
              (imageUrl && pins.length === 0) ? <Link to={`/active`}>
                {closeButton}
              </Link> : (imageUrl && pins.length > 0 && !isPaintScene) ? closeButton : ''
            }
          </div>
          {
            (imageUrl && pins.length > 0 && !isPaintScene)
              ? (<React.Fragment>
                <ColorsFromImage data={{ initPins: pins, imageData: getCurrentImageData(), img: imageUrl, isPortrait: isPortrait }} isActivedPage />
                <ConfirmationModal isActive={isConfirmationModalActive} onClickNo={() => setConfirmationModalActive(!isConfirmationModalActive)} />
              </React.Fragment>)
              : ''
          }
          {
            (imageUrl && pins.length === 0)
              ? (<React.Fragment>
                <canvas className={`${isPortrait ? portraitOrientation : canvasClass}`} name='canvas' ref={canvasRef} width={imageWidth} height={imageHeight} />
                <ImageRotateTerms rotateImage={rotateImage} createColorPins={createColorPins} imageData={imageData} />
              </React.Fragment>)
              : ''
          }
          {
            (imageUrl && isPaintScene && pins.length > 0)
              ? (<React.Fragment>
                <PaintScene imageUrl={imageUrl} imageRotationAngle={imageRotationAngle} referenceDimensions={imageDims} />
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

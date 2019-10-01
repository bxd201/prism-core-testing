// @flow
import React, { useState, useEffect, useRef } from 'react'
import FileInput from '../FileInput/FileInput'
import ColorsFromImage from '../InspirationPhotos/ColorsFromImage'
import './MatchPhoto.scss'
import ImageRotateTerms from './ImageRotateTerms.jsx'
import { Link, withRouter, type RouterHistory } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import ConfirmationModal from './ConfirmationModal'
import ColorPinsGenerationByHue from './workers/colorPinsGenerationByHue.worker'
import useEffectAfterMount from '../../shared/hooks/useEffectAfterMount'
import PaintScene from '../PaintScene/PaintScene'
import { loadImage, scaleImage } from '../../shared/helpers/ImageUtils'

const baseClass = 'match-photo'
const wrapperClass = `${baseClass}__wrapper`
const containerClass = `${baseClass}__container`
const headerClass = `${baseClass}__header`
const buttonClass = `${baseClass}__button`
const buttonLeftClass = `${buttonClass}--left`
const buttonLeftTextClass = `${buttonClass}-left-text`
const canvasClass = `${baseClass}__canvas`
const portraitOrientation = `${canvasClass}--portrait`
const imageClass = `${baseClass}__image`
const buttonRightClass = `${buttonClass}--right`
const closeClass = `${baseClass}__close`
const cancelClass = `${baseClass}__cancel`

let canvasContext: any
let colorPinsGenerationByHueWorker: Object

type Props = {
  history: RouterHistory,
  isPaintScene: boolean
}

export function MatchPhoto ({ history, isPaintScene }: Props) {
  const canvasRef: RefObject = useRef()
  const imageRef: RefObject = useRef()
  const wrapperRef: RefObject = useRef()
  const [imageUrl, setImageUrl] = useState()
  const [pins, generatePins] = useState([])
  const [imageData, setImageData] = useState([])
  const [imageRotationAngle, setImageRotationAngle] = useState(0)
  const [isConfirmationModalActive, setConfirmationModalActive] = useState(false)
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 })
  // eslint-disable-next-line no-unused-vars
  const [imageDims, setImageDims] = useState({ width: 0, height: 0 })
  // default to landscape until image is loaded or rotated
  const [isPortrait, setIsPortrait] = useState(false)

  useEffectAfterMount(() => {
    canvasContext.clearRect(0, 0, imageDims.imageWidth, imageDims.imageHeight)
    canvasContext.save()
    canvasContext.translate(imageDims.imageWidth / 2, imageDims.imageHeight / 2)
    canvasContext.rotate(imageRotationAngle * Math.PI / 180)

    canvasContext.drawImage(0, 0, imageDims.width, imageDims.height)

    canvasContext.restore()
    const imageData = canvasContext.getImageData(0, 0, imageDimensions.width, imageDimensions.height)
    setImageData(imageData)
  }, [imageRotationAngle])

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

  function resizeHandler () {
    if (canvasRef.current) {
      // @todo Revisit -RS
      // initCanvas()
    }
  }

  function handleChange (e: Object) {
    const imgUrl = URL.createObjectURL(e.target.files[0])
    const imagePromise = loadImage(imgUrl)
    imagePromise.then((imageEvent) => {
      const image = imageEvent.target
      image.removeEventListener('load', imagePromise, false)
      const wrapperSize = wrapperRef.current.getBoundingClientRect()
      console.log(`wrapper width: ${wrapperSize.width} | height: ${wrapperSize.height}`)

      const isPortrait = image.height > image.width
      const width = isPortrait ? Math.floor(wrapperSize.width / 2) : wrapperSize.width
      // @todo remember that if rotated update isPortrait!!! -RS
      scaleImage(image, width).then((imageData) => {
        const imageDims = {
          originalImageWidth: image.width,
          originalImageHeight: image.height,
          imageWidth: imageData.width,
          imageHeight: imageData.height,
          isPortrait: imageData.isPortrait
        }
        setIsPortrait(isPortrait)
        setImageDims(imageDims)
        setImageUrl(imageData.dataUrl)
        updateCanvas(image, imageDims)
      }, err => console.log(err))
    }, err => console.log(err))
  }

  const updateCanvas = (image, dimensions) => {
    canvasRef.current.width = dimensions.imageWidth
    canvasRef.current.height = dimensions.imageHeight
    const ctx = canvasRef.current.getContext('2d')
    ctx.drawImage(image, 0, 0, dimensions.imageWidth, dimensions.imageHeight)
  }

  // function handleImageLoaded () {
  //   // @todo revisit
  //   console.log('handleImageLoaded()', imageDims)
  //   // initCanvas()
  // }
  //
  // function handleImageErrored () {
  //   setImageUrl()
  // }

  // eslint-disable-next-line no-unused-vars
  function initCanvas () {
    canvasContext = canvasRef.current.getContext('2d')
    const canvasOffset = canvasRef.current.getBoundingClientRect()
    const canvasOffsetWidth = parseInt(canvasOffset.width, 10)
    const canvasOffsetHeight = parseInt(canvasOffset.height, 10)
    canvasRef.current.height = canvasOffsetHeight
    canvasRef.current.width = canvasOffsetWidth
    canvasContext.drawImage(imageRef.current, 0, 0, canvasOffsetWidth, canvasOffsetHeight)
    const imageData = canvasContext.getImageData(0, 0, canvasOffsetWidth, canvasOffsetHeight)
    setImageData(imageData)
    setImageDimensions({ width: canvasOffsetWidth, height: canvasOffsetHeight })
  }

  function createColorPins (imageData: Object) {
    if (isPaintScene) {
      generatePins([{ isPaintScene: isPaintScene }])
    } else {
      // $FlowIgnore - flow can't understand how the worker is being used since it's not exporting anything
      colorPinsGenerationByHueWorker = new ColorPinsGenerationByHue()
      colorPinsGenerationByHueWorker.addEventListener('message', messageHandler)
      colorPinsGenerationByHueWorker.postMessage({ imageData: imageData, imageDimensions: imageDimensions })
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
                <ColorsFromImage data={{ initPins: pins, img: imageUrl, imageRotationAngle: imageRotationAngle }} isActivedPage />
                <ConfirmationModal isActive={isConfirmationModalActive} onClickNo={() => setConfirmationModalActive(!isConfirmationModalActive)} />
              </React.Fragment>)
              : ''
          }
          {
            (imageUrl && pins.length === 0)
              ? (<React.Fragment>
                <canvas className={`${isPortrait ? portraitOrientation : canvasClass}`} name='canvas' ref={canvasRef} width={imageDims.imageWidth} height={imageDims.imageHeight} />
                <img className={`${imageClass}`} ref={imageRef} src={imageUrl} alt='' />
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

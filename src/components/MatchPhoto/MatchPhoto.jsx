// @flow
import React, { useState, useEffect, createRef } from 'react'
import FileInput from '../FileInput/FileInput'
import ColorsFromImage from '../InspirationPhotos/ColorsFromImage'
import { loadImage, createColorTallies, getPixelPosition } from './MatchPhotoUtils'
import './MatchPhoto.scss'
import ImageRotateTerms from './ImageRotateTerms.jsx'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import includes from 'lodash/includes'
import random from 'lodash/random'
import sampleSize from 'lodash/sampleSize'
import groupBy from 'lodash/groupBy'
import toArray from 'lodash/toArray'
import { findBrandColor } from '../InspirationPhotos/data'
import { brandColors } from '../InspirationPhotos/sw-colors-in-LAB.js'
import ConfirmationModal from './ConfirmationModal'

let canvasContext: any

export function MatchPhoto () {
  const canvasRef: RefObject = createRef()
  const imageRef: RefObject = createRef()
  const [imageUrl, setImageUrl] = useState()
  const [pins, generatepins] = useState([])
  const [imageData, setImageData] = useState([])
  const [imageRotationAngle, setImageRotationAngle] = useState(0)
  const [isConfirmationModalActive, setConfirmationModalActive] = useState(false)
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 })

  useEffect(() => {
    if (canvasContext && imageUrl) {
      canvasContext.clearRect(0, 0, imageDimensions.width, imageDimensions.height)
      canvasContext.save()
      canvasContext.translate(imageDimensions.width / 2, imageDimensions.height / 2)
      canvasContext.rotate(imageRotationAngle * Math.PI / 180)
      const drawWidth = imageDimensions.width / 2
      if (includes([90, -90, 270, -270], imageRotationAngle)) {
        canvasContext.drawImage(imageRef.current, -drawWidth, -imageDimensions.height, imageDimensions.width, imageDimensions.height * 2)
      } else {
        canvasContext.drawImage(imageRef.current, -drawWidth, -imageDimensions.height / 2, imageDimensions.width, imageDimensions.height)
      }
      canvasContext.restore()
      const imageData = canvasContext.getImageData(0, 0, imageDimensions.width, imageDimensions.height)
      setImageData(imageData)
    }
  }, [imageRotationAngle])

  function handleChange (e: Object) {
    const { target } = e
    Promise.all([
      loadImage(URL.createObjectURL(target.files[0]))
    ]).then(images => {
      setImageUrl(URL.createObjectURL(target.files[0]))
    })
  }

  function handleImageLoaded () {
    initCanvas()
  }

  function handleImageErrored () {
    setImageUrl()
  }

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
    const colorTally = createColorTallies(imageData.data, imageDimensions.width, imageDimensions.height)
    const colorTallyGroupByHue = toArray(groupBy(colorTally, (color) => color.hueRangeNumber))

    const colorTallyRandomEachHue = colorTallyGroupByHue.map((colorTally) => {
      let sampleSizeCount = 10
      if (colorTally.length < 10) {
        sampleSizeCount = colorTally.length
      }
      return sampleSize(colorTally, sampleSizeCount)
    })

    const colorMap = {}
    const pinsArrayByHue = colorTallyRandomEachHue.map((colors, index) => {
      const pinsArray = colors.map(color => {
        const randomByteIndex = random(0, color.byteIndices.length - 1)
        const pixelPosition = getPixelPosition(color.byteIndices[randomByteIndex], imageDimensions.width, imageDimensions.height)
        const r = color.value.r
        const g = color.value.g
        const b = color.value.b
        const arrayIndex = findBrandColor([r, g, b])
        const sherwinRgb = `rgb(${brandColors[arrayIndex + 2]})`

        const key = sherwinRgb
        if (!colorMap.hasOwnProperty(key) && pixelPosition.x >= 0.15 && pixelPosition.y >= 0.15 && pixelPosition.x <= 0.85 && pixelPosition.y <= 0.85) {
          colorMap[key] = [index]
          return {
            r: r,
            g: g,
            b: b,
            x: pixelPosition.x,
            y: pixelPosition.y
          }
        }
      })
      return pinsArray.filter(pin => pin !== undefined)
    })

    const pins = pinsArrayByHue.map(pin => (pin.length > 0) && pin[random(0, pin.length - 1)])
    const pinsReduced = pins.filter(pin => pin !== undefined && pin !== false)
    const pinsRandom = sampleSize(pinsReduced, 8)
    generatepins(pinsRandom)
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

  const closeButton = <button onClick={() => (imageUrl && pins.length > 0) && setConfirmationModalActive(!isConfirmationModalActive)} className={`match-photo__button match-photo__button--right`}>
    <div className={`match-photo__close`}><span>CLOSE</span>&nbsp;<FontAwesomeIcon className={``} icon={['fa', 'chevron-up']} /></div>
    <div className={`match-photo__cancel`}><FontAwesomeIcon className={``} icon={['fa', 'times']} /></div>
  </button>

  return (
    <React.Fragment>
      <div className={`match-photo__wrapper`}>
        <div className={`match-photo__container`}>
          { (!imageUrl) &&
          <FileInput onChange={handleChange} id={'photoInput'} disabled={false} placeholder={'Select image'} />
          }
          <div className={`match-photo__header`}>
            {(imageUrl && pins.length === 0) ? <Link to={`/active`}>
              <button className={`match-photo__button match-photo__button--left`} onClick={() => {}}>
                <div><FontAwesomeIcon className={``} icon={['fa', 'angle-left']} />&nbsp;<span className={`match-photo__button-left-text`}>BACK</span></div>
              </button></Link> : ''}
            {
              (imageUrl && pins.length === 0) ? <Link to={`/active`}>
                {closeButton}
              </Link> : closeButton
            }
          </div>
          {
            (imageUrl && pins.length > 0)
              ? (<React.Fragment>
                <ColorsFromImage data={{ initPins: pins, img: imageUrl, imageRotationAngle: imageRotationAngle }} isActivedPage />
                <ConfirmationModal isActive={isConfirmationModalActive} onClickNo={() => setConfirmationModalActive(!isConfirmationModalActive)} />
              </React.Fragment>)
              : ''
          }
          {
            (imageUrl && pins.length === 0)
              ? (<React.Fragment>
                <canvas className='match-photo__canvas' name='canvas' ref={canvasRef} />
                <img className='match-photo__image' ref={imageRef} onLoad={handleImageLoaded} onError={handleImageErrored} src={imageUrl} alt='' />
                <ImageRotateTerms rotateImage={rotateImage} createColorPins={createColorPins} imageData={imageData} />
              </React.Fragment>)
              : ''
          }
        </div>
      </div>
    </React.Fragment>
  )
}

export default MatchPhoto

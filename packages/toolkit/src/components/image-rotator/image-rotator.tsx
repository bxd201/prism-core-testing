import React, { createContext, RefObject, ReactNode, useContext, useEffect, useRef, useState } from 'react'
import { useContainerSize } from '../../hooks'
import { getCanvasTransformParams } from '../../utils/utils'
import { ProcessedImageMetadata } from '../../types'

interface ChildrenProp { children?: ReactNode }
interface ClassNameProp { className?: string }
interface IImageRotatorContext {
  angle?: number
  imageRef?: RefObject<HTMLImageElement>
  rotatedImageMetadata?: ProcessedImageMetadata
  setAngle?: (angle: number) => void
  setRotatedImageMetadata?: (cb: (imageMetadata: ProcessedImageMetadata) => ProcessedImageMetadata) => void
}
export interface ImageRotatorProps { imageMetadata: ProcessedImageMetadata }

const ImageRotatorContext = createContext<IImageRotatorContext>({})

const ImageRotator = ({ children, className, imageMetadata }: ChildrenProp & ClassNameProp & ImageRotatorProps): JSX.Element => {
  const imageRef = useRef()
  const [angle, setAngle] = useState(0)
  const [rotatedImageMetadata, setRotatedImageMetadata] = useState<ProcessedImageMetadata>({ ...imageMetadata, isPortrait: imageMetadata.originalIsPortrait })

  return (
    <ImageRotatorContext.Provider value={{ angle, imageRef, rotatedImageMetadata, setRotatedImageMetadata, setAngle }}>
      <div className={className}>
        {children}
      </div>
    </ImageRotatorContext.Provider>
  )
}

interface ButtonProps {
  disabled?: boolean
  onClick?: (imageMetadata?: ProcessedImageMetadata) => void
}

const Button = ({ children, className, disabled, onClick }: ButtonProps & ChildrenProp & ClassNameProp): JSX.Element => {
  const { angle, imageRef, rotatedImageMetadata } = useContext(ImageRotatorContext)

  const getRotatedImageMetaData = (): ProcessedImageMetadata => {
    const { isPortrait, originalImageHeight, originalImageWidth, originalIsPortrait } = rotatedImageMetadata
    const {
      landscapeHeight = originalImageHeight,
      landscapeWidth = originalImageWidth,
      portraitHeight = originalImageHeight,
      portraitWidth = originalImageWidth
    } = rotatedImageMetadata
    const rotatedPortraitHeight = Math.floor(portraitHeight / portraitWidth * portraitHeight)
    const rotatedlandscapeHeight = Math.ceil(landscapeHeight / landscapeWidth * landscapeHeight)
    const imageWidth = originalIsPortrait
      ? isPortrait ? portraitWidth : rotatedPortraitHeight
      : isPortrait ? rotatedlandscapeHeight : landscapeWidth
    const imageHeight = originalIsPortrait ? portraitHeight : landscapeHeight
    const { canvasHeight, canvasWidth, hScale, hSkew, hTrans, rotation, vScale, vSkew, vTrans } = getCanvasTransformParams(angle, imageWidth, imageHeight)
    const canvas = document.createElement('canvas')
    canvas.width = imageWidth
    canvas.height = imageHeight
    const ctx = canvas.getContext('2d')
    ctx.setTransform(hScale, vSkew, hSkew, vScale, hTrans, vTrans)
    ctx.rotate(rotation)
    ctx.drawImage(imageRef.current, 0, 0, canvasWidth, canvasHeight)

    return ({
      ...rotatedImageMetadata,
      imageHeight,
      imageWidth,
      landscapeWidth: originalIsPortrait ? rotatedPortraitHeight : landscapeWidth,
      landscapeHeight: imageHeight,
      portraitHeight: imageHeight,
      portraitWidth: originalIsPortrait ? portraitWidth : rotatedlandscapeHeight,
      url: canvas.toDataURL()
    })
  }

  return (
    <button className={className} disabled={disabled} onClick={() => onClick?.(getRotatedImageMetaData())}>
      {children}
    </button>
  )
}

interface ImageProps { fitContainer?: boolean }

const Image = ({ className, fitContainer }: ClassNameProp & ImageProps): JSX.Element => {
  const { angle, imageRef, rotatedImageMetadata } = useContext(ImageRotatorContext)
  const { height, width } = useContainerSize(imageRef)
  const [transform, setTransform] = useState<{ transform: string }>()
  const { isPortrait, originalIsPortrait, url } = rotatedImageMetadata

  useEffect(() => {
    const scale = originalIsPortrait
      ? isPortrait ? 1 : (fitContainer ? width / height : height / width)
      : isPortrait ? height / width : 1
    setTransform({ transform: `rotate(${angle}deg) scale(${scale}`})
  }, [angle])

  return (
    <img
      className={className}
      crossOrigin='anonymous'
      ref={imageRef}
      src={url}
      style={{ ...transform, maxHeight: isPortrait ? rotatedImageMetadata.portraitHeight : rotatedImageMetadata.landscapeHeight }}
    />
  )
}

interface RotateControlsProps {
  children?: (onRotateLeftClick?: () => void, onRotateRightClick?: () => void) => ReactNode
}

const RotateControls = ({ children, className }: ClassNameProp & RotateControlsProps): JSX.Element => {
  const { angle, setAngle, setRotatedImageMetadata } = useContext(ImageRotatorContext)

  const rotateImage = (direction: string): void => {
    setRotatedImageMetadata(prev => ({ ...prev, isPortrait: !prev.isPortrait }))
    let currentAngle: number = angle
    if (direction === 'right') {
      currentAngle += 90
    } else {
      currentAngle -= 90
    }
    currentAngle = Math.abs(currentAngle) === 360 ? 0 : currentAngle
    setAngle(currentAngle)
  }

  return (
    <div className={className}>{children(() => rotateImage('left'), () => rotateImage('right'))}</div>
  )
}

ImageRotator.Button = Button
ImageRotator.Image = Image
ImageRotator.RotateControls = RotateControls

export default ImageRotator

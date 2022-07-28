import React, { createContext, RefObject, ReactNode, useContext, useEffect, useRef, useState } from 'react'
import { useContainerSize } from '../../hooks'
import { getTransformParams } from '../../utils/image-rotator'
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
    const imageWidth = rotatedImageMetadata.isPortrait ? rotatedImageMetadata.portraitWidth : rotatedImageMetadata.landscapeWidth
    const imageHeight = rotatedImageMetadata.isPortrait ? rotatedImageMetadata.portraitHeight : rotatedImageMetadata.landscapeHeight
    const { canvasWidth, canvasHeight, vScale, hScale, vSkew, hSkew, hTrans, vTrans, rotation } = getTransformParams(angle, imageWidth, imageHeight)
    const canvas = document.createElement('canvas')
    canvas.width = imageWidth
    canvas.height = imageHeight
    const ctx = canvas.getContext('2d')
    ctx.setTransform(hScale, vSkew, hSkew, vScale, hTrans, vTrans)
    ctx.rotate(rotation)
    ctx.drawImage(imageRef.current, 0, 0, canvasWidth, canvasHeight)

    return ({ ...rotatedImageMetadata, imageHeight, imageWidth, url: canvas.toDataURL() })
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

  useEffect(() => {
    const scale = rotatedImageMetadata.originalIsPortrait
      ? rotatedImageMetadata.isPortrait ? 1 : (fitContainer ? width / height : height / width)
      : rotatedImageMetadata.isPortrait ? height / width : 1
    setTransform({ transform: `rotate(${angle}deg) scale(${scale}`})
  }, [angle])

  return (
    <img
      className={className}
      crossOrigin='anonymous'
      ref={imageRef}
      src={rotatedImageMetadata.url}
      style={{ ...transform, maxHeight: rotatedImageMetadata.landscapeHeight }}
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

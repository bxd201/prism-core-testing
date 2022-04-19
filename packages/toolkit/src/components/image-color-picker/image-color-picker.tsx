import React, { memo, useState, useRef, MouseEvent, TouchEvent } from 'react'
import Canvas from '../canvas/canvas'
import { findClosestColor } from '../../utils/utils'
import { Color } from '../../types'
import clamp from 'lodash/clamp'

export interface ImageColorPickerProps {
  colors: Color[]
  imgSrc: string
  initialPinLocations?: Array<{ x: number; y: number }> // as a percentage
  pinRenderer: (pin: {
    color: Color | null
    expandsLeft: boolean
    isOpen: boolean
    style: { top: string; left: string; size: string }
  }) => JSX.Element
  onColorSelected?: (color: Color | null) => void
  removeButtonContent?: JSX.Element
}

/**
 * A decorated canvas, loads a canvas from an image source and allows a user to manipulate pins to select colors from the image. (pass through props applied to inner canvas)
 * @param {string} imgSrc - src of the image to load
 * @param {Color[]} colors - available colors that a pin could be
 * @param {{ x: number, y: number }[]} initialPinLocation - array of pins to be set initially (x and y values are defined as percentages of total image width/height)
 * @param {Element} removeButtonContent - contents of the remove button, which is displayed while a pin is open or being dragged
 * @example
 * ```JSX
 *   <ImageColorPicker src='./cat.jpg' colors={colors} removeButtonContent={<FontAwesome icon={trash} />} aria-label='pick colors from an image of a cat' />
 * ```
 */
const ImageColorPicker = ({
  imgSrc,
  colors,
  initialPinLocations = [],
  pinRenderer,
  removeButtonContent,
  onColorSelected,
  ...otherProps
}: ImageColorPickerProps): JSX.Element => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [pins, setPins] = useState<Array<{ x: number; y: number; color: Color | null; isOpen: boolean }>>([])
  const [draggedPinIndex, setDraggedPinIndex] = useState<number | null>(null)

  const getColor = (x: number, y: number): Color | null => {
    const { width, height } = canvasRef.current?.getBoundingClientRect() ?? { width: 0, height: 0 }
    const targetRGB = canvasRef.current?.getContext('2d')?.getImageData(width * (x / 100), height * (y / 100), 1, 1).data
    return findClosestColor(targetRGB, colors)
  }

  const toCanvasCoords = (clientX: number, clientY: number): [number, number] => {
    const { left, top, height, width } = canvasRef.current?.getBoundingClientRect() ?? {
      left: 0,
      top: 0,
      height: 0,
      width: 0
    }
    return [
      clamp(((clientX - left) / width) * 100, 2400 / width, 100 - 2400 / width),
      clamp(((clientY - top) / height) * 100, 2400 / height, 100 - 2400 / height)
    ]
  }

  const onPinMoved = (clientX: number, clientY: number): void => {
    const [x, y] = toCanvasCoords(clientX, clientY)
    if (draggedPinIndex !== null) {
      setPins(pins.map((pin, i) => (i === draggedPinIndex ? { x, y, color: getColor(x, y), isOpen: false } : pin)))
    }
  }

  // TODO: This function should likely moved out to a utility at some point
  const getClientCoordsFromEvent = (e: MouseEvent<HTMLElement> | TouchEvent<HTMLElement>): { clientX: number, clientY: number } => {
    const isTouchEvent = (e: MouseEvent<HTMLElement> | TouchEvent<HTMLElement>): e is TouchEvent<HTMLElement> => (e as TouchEvent).touches !== undefined

    if (isTouchEvent(e)) {
      const touch = e.touches[0]
      const { clientX, clientY } = touch

      return {
        clientX,
        clientY,
      }
    } else {
      const { clientX, clientY } = e

      return {
        clientX,
        clientY,
      }
    }
  }

  const onPinReleased = (e: MouseEvent<HTMLElement> | TouchEvent<HTMLElement>): void => {
    const { clientX, clientY } = getClientCoordsFromEvent(e)

    if (draggedPinIndex !== null) {
      e.preventDefault()
      onColorSelected?.(pins[draggedPinIndex]?.color)
      setPins(pins.map((pin, i) => ({ ...pin, isOpen: i === draggedPinIndex && !pin.isOpen })))
      setDraggedPinIndex(null)
    } else if ((clientX !== 0) && (clientY !== 0)) {
      const [x, y] = toCanvasCoords(clientX, clientY)
      onColorSelected?.(getColor(x, y))
      setPins([...pins.map((pin) => ({ ...pin, isOpen: false })), { x, y, color: getColor(x, y), isOpen: true }])
    }
  }

  const onPinRemoved = (e: MouseEvent | TouchEvent): void => {
    e.preventDefault()
    e.stopPropagation()
    setPins(pins.filter((pin, i) => (draggedPinIndex === null ? !pin.isOpen : i !== draggedPinIndex)))
    setDraggedPinIndex(null)
  }

  return (
    <div
      className='bg-gray-100 relative w-auto inline-block'
      onMouseMove={(e) => onPinMoved(e.clientX, e.clientY)}
      onTouchMove={(e) => {
        const { clientX, clientY } = e.touches[0]
        // radiusX & radiusY have not been formally standardized at this time (level-2 spec).. suppressing type errors for now
        // @ts-ignore
        const { radiusX, radiusY } = e.touches[0]
        onPinMoved(clientX + radiusX / 2, clientY + radiusY / 2)
      }}
      onMouseUp={onPinReleased}
      onTouchEnd={onPinReleased}
      onMouseLeave={() => {
        draggedPinIndex !== null && setPins(pins.map((pin, i) => ({ ...pin, isOpen: i === draggedPinIndex })))
        setDraggedPinIndex(null)
      }}
    >
      <Canvas
        {...otherProps}
        src={imgSrc}
        ref={canvasRef}
        className='absolute z-10'
        onLoad={() => {
          setPins(
            initialPinLocations.map(({ x, y }, i) => {
              const dimensionLimit = (d: number = 0): any => ((d - 24) * 100) / d
              const xPoint = clamp(
                x,
                100 - dimensionLimit(canvasRef.current?.width),
                dimensionLimit(canvasRef.current?.width)
              )
              const yPoint = clamp(
                y,
                100 - dimensionLimit(canvasRef.current?.height),
                dimensionLimit(canvasRef.current?.height)
              )
              return { x: xPoint, y: yPoint, color: getColor(xPoint, yPoint), isOpen: i === 0 }
            })
          )
        }}
      />
      {pins
        .filter((pin) => pin.color)
        .map((pin, index) => {
          const pinRadius: number = pin.isOpen || draggedPinIndex === index ? 1.5 : 1
          const pinSize: number = pin.isOpen || draggedPinIndex === index ? 3 : 2
          return (
            <div
              key={index}
              onMouseDown={() => setDraggedPinIndex(index)}
              onTouchStart={() => setDraggedPinIndex(index)}
              onKeyDown={(e) => {
                if (['ArrowUp', 'ArrowDown', 'ArrowRight', 'ArrowLeft', 'Enter'].includes(e.key)) {
                  e.preventDefault()
                }
                switch (e.key) {
                  case 'ArrowUp':
                    return setPins(
                      pins.map((pin, i) => (index === i ? { ...pin, y: --pin.y, color: getColor(pin.x, pin.y) } : pin))
                    )
                  case 'ArrowDown':
                    return setPins(
                      pins.map((pin, i) => (index === i ? { ...pin, y: ++pin.y, color: getColor(pin.x, pin.y) } : pin))
                    )
                  case 'ArrowRight':
                    return setPins(
                      pins.map((pin, i) => (index === i ? { ...pin, x: ++pin.x, color: getColor(pin.x, pin.y) } : pin))
                    )
                  case 'ArrowLeft':
                    return setPins(
                      pins.map((pin, i) => (index === i ? { ...pin, x: --pin.x, color: getColor(pin.x, pin.y) } : pin))
                    )
                  case 'Enter':
                    return setPins(pins.map((p, i) => ({ ...p, isOpen: i === index && !pin.isOpen })))
                }
              }}
            >
              {pinRenderer({
                color: pin.color,
                expandsLeft: pin.x > 50,
                isOpen: pin.isOpen,
                style: {
                  top: `calc(${pin.y}% - ${pinRadius}rem`,
                  left: `calc(${pin.x}% - ${pinRadius}rem`,
                  size: `${pinSize}rem`
                }
              })}
            </div>
          )
        })}
      {(draggedPinIndex !== null || pins.some((pin) => pin.isOpen && pin.color)) && (
        <button
          className='absolute w-10 h-10 bg-white rounded-full left-2/4 bottom-5 transform transition-transform z-30 hover:scale-125 hover:bg-primary hover:text-white animate-fadeIn'
          onMouseUp={onPinRemoved}
          onTouchEnd={onPinRemoved}
        >
          {removeButtonContent}
        </button>
      )}
    </div>
  )
}

export default memo<ImageColorPickerProps>(ImageColorPicker)

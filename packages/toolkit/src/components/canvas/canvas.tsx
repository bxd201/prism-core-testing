import React, { forwardRef, HTMLAttributes, Ref,RefObject, useEffect, useRef } from 'react'

export interface CanvasPropsT extends HTMLAttributes<HTMLCanvasElement> {
  src: string
  ref: Ref<HTMLCanvasElement>
  onLoad?: () => void
}

/**
 * Takes an image src and produces a canvas with that image drawn to it. (pass through props are applied to inner canvas element)
 * @param {string} src - src of the image to load
 * @param {} ref
 * @param {function} onLoad - function called when image has finished loading
 * @example
 * ```JSX
 *   <Canvas src='/cat.jpg' ref={canvasRef} onLoad={() => ...} {...other props are passed through to the canvas} />
 * ```
 */
const Canvas = forwardRef<HTMLCanvasElement, CanvasPropsT>(({ src, onLoad, ...otherProps }, ref) => {
  const imgRef = useRef<HTMLImageElement>(null)

  const drawImageToCanvas = (): void => {
    const canvasRef = ref as RefObject<HTMLCanvasElement>
    if (canvasRef.current != null && imgRef.current != null) {
      canvasRef.current.width = imgRef.current?.width
      canvasRef.current.height = imgRef.current?.height
      canvasRef?.current
        ?.getContext('2d')
        ?.drawImage(imgRef.current, 0, 0, imgRef.current?.width, imgRef.current?.height)
    }
  }

  // redraw image to canvas when component is resized
  useEffect(() => {
    imgRef.current != null && new ResizeObserver(drawImageToCanvas).observe(imgRef.current)
  }, [])

  return (
    <>
      <canvas {...otherProps} ref={ref} />
      <img
        className='invisible'
        src={src}
        ref={imgRef}
        crossOrigin='anonymous'
        onLoad={() => {
          drawImageToCanvas()
          setTimeout(onLoad, 500)
        }}
      />
    </>
  )
})

export default Canvas

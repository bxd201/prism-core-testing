// @flow
import React, { useRef, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'

import './MergeCanvas.scss'
import compositeOperation from '../../constants/canvasCompositeOperations'

type MergeColorsProps = {
  imageDataList: string[],
  handleImagesMerged: Function,
  width: number,
  height: number,
  shouldTint: boolean,
  colors: Object[],
  ignoreColorOffset: boolean
}

const getRGBString = (c) => `rgb(${c.r}, ${c.g}, ${c.b})`

// @todo - Revisit the implementation of this, see context2d.js from prod for context -RS
const getImageDataStats = (imageData) => {
  let brightnessBucket = 0
  let brightnessMax = null
  let brightnessMin = null
  let pixelCount = 0

  for (let i = 0; i < imageData.data.length; i += 4) {
    const value = 0.2126 * imageData.data[i] + 0.7152 * imageData.data[i + 1] + 0.0722 * imageData.data[i + 2]
    if (brightnessMin === null) {
      brightnessMin = value
    }
    if (brightnessMax === null) {
      brightnessMax = value
    }
    if (imageData.data[i + 4] > 127) {
      brightnessBucket += value
      brightnessMax = Math.max(brightnessMax, value)
      brightnessMin = Math.min(brightnessMin, value)
      pixelCount++
    }
  }

  const brightnessMean = brightnessBucket / pixelCount
  const adjustmentDelta = 255 - brightnessMax
  const adjustmentMean = (brightnessMean + adjustmentDelta)

  const delta = Math.round(adjustmentDelta)

  return {
    delta,
    adjustmentMean,
    brightnessMax,
    brightnessMin,
    brightnessMean
  }
}

const manipulateLayer = (layerCtx, color, operation) => {
  layerCtx.save()
  layerCtx.globalCompositeOperation = operation
  layerCtx.fillStyle = getRGBString(color)
  layerCtx.fillRect(0, 0, layerCtx.canvas.width, layerCtx.canvas.height)
  layerCtx.restore()
}

const MergeColors = (props: MergeColorsProps) => {
  const canvasRef = useRef()
  const workCanvasRef = useRef()
  const mergeCanvasRef = useRef()
  const countRef = useRef(0)
  const imagesRef = useRef([])
  const intl = useIntl()
  const [imageUrls, setImageUrls] = useState([])

  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d')
    ctx.save()

    const imageDataUrls = props.imageDataList.map(imageData => {
      ctx.putImageData(imageData, 0, 0)

      return ctx.canvas.toDataURL()
    })

    ctx.restore()

    setImageUrls(imageDataUrls)
  }, [])

  const handleImageLoad = (e) => {
    countRef.current++
    imagesRef.current.push(e.target)

    if (countRef.current === props.imageDataList.length) {
      // This layer is where the tinted layer is drawn before being painted to the finalized canvas
      const ctx = canvasRef.current.getContext('2d')
      const mergeCtx = mergeCanvasRef.current.getContext('2d')
      const workCtx = workCanvasRef.current.getContext('2d')
      const colorIndexOffset = props.ignoreColorOffset ? 0 : 1

      const resetCanvases = () => {
        mergeCtx.clearRect(0, 0, mergeCtx.canvas.width, mergeCtx.canvas.height)
        mergeCtx.globalCompositeOperation = compositeOperation.sourceOver
        mergeCtx.save()
        workCtx.clearRect(0, 0, workCtx.canvas.width, workCtx.canvas.height)
        workCtx.globalCompositeOperation = compositeOperation.sourceOver
        workCtx.save()
      }

      imagesRef.current.forEach((img, i) => {
        if (props.shouldTint) {
          if (i === 0) {
            // Just draw the background image to to the finalizing canvas
            ctx.drawImage(img, 0, 0)
          } else {
            // Draw background to merge canvas for context
            mergeCtx.drawImage(imagesRef.current[0], 0, 0)
            workCtx.drawImage(img, 0, 0)
            workCtx.save()
            workCtx.globalCompositeOperation = compositeOperation.sourceIn
            // draw bg image into painted layer
            workCtx.drawImage(mergeCtx.canvas, 0, 0)
            workCtx.restore()

            mergeCtx.save()
            mergeCtx.globalCompositeOperation = compositeOperation.copy
            mergeCtx.drawImage(workCtx.canvas, 0, 0)

            manipulateLayer(mergeCtx, props.colors[i - colorIndexOffset], compositeOperation.color)

            const imageData = mergeCtx.getImageData(0, 0, mergeCtx.canvas.width, mergeCtx.canvas.height)
            const stats = getImageDataStats(imageData)

            if (stats.delta > 0) {
              manipulateLayer(mergeCtx, { r: stats.delta, g: stats.delta, b: stats.delta }, compositeOperation.lighter)
            } else if (stats.delta < 0) {
              // invert
              manipulateLayer(mergeCtx, { r: 255, g: 255, b: 255 }, compositeOperation.difference)
              // make lighter
              manipulateLayer(mergeCtx, { r: -stats.delta, g: -stats.delta, b: -stats.delta }, compositeOperation.lighter)
              // revert
              manipulateLayer(mergeCtx, { r: stats.delta, g: stats.delta, b: stats.delta }, compositeOperation.difference)
            }
            // boost
            const min = Math.round(255 - stats.brightnessMean)
            manipulateLayer(mergeCtx, { r: min, g: min, b: min }, compositeOperation.screen)
            manipulateLayer(mergeCtx, props.colors[i - colorIndexOffset], compositeOperation.multiply)

            mergeCtx.globalCompositeOperation = compositeOperation.destinationIn
            mergeCtx.drawImage(workCtx.canvas, 0, 0)
            // paint layer to finalize canvas
            ctx.drawImage(mergeCtx.canvas, 0, 0)

            resetCanvases()
          }
        } else {
          mergeCtx.drawImage(img, 0, 0)
          mergeCtx.globalCompositeOperation = compositeOperation.sourceIn
          mergeCtx.save()
          manipulateLayer(workCtx, props.colors[i - colorIndexOffset], compositeOperation.sourceOver)
          mergeCtx.drawImage(workCtx.canvas, 0, 0)

          ctx.drawImage(mergeCtx.canvas, 0, 0)

          resetCanvases()
        }
      })

      const mergedImage = ctx.canvas.toDataURL()

      props.handleImagesMerged(mergedImage)
      // Memory leak protection
      imagesRef.current.length = 0
    }
  }

  return (
    <>
      {imageUrls.length ? imageUrls.map((src, i) => {
        return (<img
          className={'merge-canvas-image-comp'}
          src={src}
          key={`${i}`}
          onLoad={(e) => handleImageLoad(e)}
          alt={intl.messages.IMAGE_INVISIBLE}
        />)
      }) : null}
      <canvas
        className={'merge-canvas-image-comp'}
        ref={canvasRef}
        width={props.width}
        height={props.height}>
        {intl.messages.CANVAS_UNSUPPORTED}
      </canvas>
      <canvas
        className={'merge-canvas-image-comp'}
        ref={mergeCanvasRef}
        width={props.width}
        height={props.height}>
        {intl.messages.CANVAS_UNSUPPORTED}
      </canvas>
      <canvas
        className={'merge-canvas-image-comp'}
        ref={workCanvasRef}
        width={props.width}
        height={props.height}>
        {intl.messages.CANVAS_UNSUPPORTED}
      </canvas>
    </>
  )
}

export default MergeColors

// @flow
/**
 * This component will accept a list of canvas imagedata load them and apply them in order to a canvas.  There are options to pass through the image data as well as return each layer as a base64 image instead
 */
import React, { useRef, useState, useEffect } from 'react'
import { useIntl, FormattedMessage } from 'react-intl'

import './MergeCanvas.scss'
import compositeOperation from '../../constants/canvasCompositeOperations'

type MergeColorsProps = {
  imageDataList?: string[],
  handleImagesMerged: Function,
  width: number,
  height: number,
  shouldTint?: boolean,
  colors?: Object[],
  ignoreColorOffset?: boolean,
  preserveLayers?: boolean,
  preserveLayersAsData?: boolean,
  imageUrlList?: string[],
  colorOpacity?: number
}

const getRGBString = (c) => `rgb(${c.r}, ${c.g}, ${c.b})`

const manipulateLayer = (layerCtx: any, color: Object, operation: string, opacity: number) => {
  layerCtx.save()
  layerCtx.globalCompositeOperation = operation
  layerCtx.globalAlpha = opacity
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
  const preservedLayersRef = useRef([])
  const preservedLayersDataRef = useRef([])
  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d')
    if (props.imageDataList) {
      ctx.save()

      const imageDataUrls = props.imageDataList.map(imageData => {
        ctx.putImageData(imageData, 0, 0)

        return ctx.canvas.toDataURL()
      })

      ctx.restore()
      setImageUrls(imageDataUrls)
    } else {
      setImageUrls(props.imageUrlList)
      countRef.current = 0
      preservedLayersDataRef.current = []
      preservedLayersRef.current = []
    }
  }, [props.imageUrlList, props.imageDataList])

  const handleImageLoad = (e, imageIndex) => {
    countRef.current++
    imagesRef.current[imageIndex] = e.target
    const targetCount = props.imageDataList ? props.imageDataList.length : props.imageUrlList.length
    if (countRef.current === targetCount) {
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
        const opacity = props.colorOpacity !== void (0) ? props.colorOpacity : 1
        if (props.shouldTint && i === 0) {
          // Just draw the background image to to the finalizing canvas
          ctx.drawImage(img, 0, 0, props.width, props.height)
        } else {
          mergeCtx.drawImage(img, 0, 0, props.width, props.height)
          mergeCtx.globalCompositeOperation = compositeOperation.sourceIn
          mergeCtx.save()
          manipulateLayer(workCtx, props.colors[i - colorIndexOffset], compositeOperation.sourceOver, opacity)
          mergeCtx.drawImage(workCtx.canvas, 0, 0, props.width, props.height)

          ctx.drawImage(mergeCtx.canvas, 0, 0, props.width, props.height)

          if (props.preserveLayers) {
            preservedLayersRef.current.push(mergeCtx.canvas.toDataURL())
          }

          if (props.preserveLayersAsData) {
            preservedLayersDataRef.current.push(mergeCtx.getImageData(0, 0, mergeCtx.canvas.width, mergeCtx.canvas.height))
          }
          resetCanvases()
        }
      })

      const mergedImage = ctx.canvas.toDataURL()
      const layers = [...preservedLayersRef.current]
      const layersAsData = [...preservedLayersDataRef.current]

      const payload = {
        mergedImage,
        layers,
        layersAsData
      }
      props.handleImagesMerged(payload)
      // Memory leak protection
      imagesRef.current.length = 0
    }
  }

  return (
    <>
      {imageUrls.length && (props.height && props.width) ? imageUrls.map((src, i) => {
        return (<img
          className={'merge-canvas-image-comp'}
          src={src}
          key={`${i}`}
          onLoad={(e) => handleImageLoad(e, i)}
          alt={intl.formatMessage({ id: 'IMAGE_INVISIBLE' })}
        />)
      }) : null}
      <canvas
        className={'merge-canvas-image-comp'}
        ref={canvasRef}
        width={props.width}
        height={props.height}>
        <FormattedMessage id='CANVAS_UNSUPPORTED' />
      </canvas>
      <canvas
        className={'merge-canvas-image-comp'}
        ref={mergeCanvasRef}
        width={props.width}
        height={props.height}>
        <FormattedMessage id='CANVAS_UNSUPPORTED' />
      </canvas>
      <canvas
        className={'merge-canvas-image-comp'}
        ref={workCanvasRef}
        width={props.width}
        height={props.height}>
        <FormattedMessage id='CANVAS_UNSUPPORTED' />
      </canvas>
    </>
  )
}

export default MergeColors

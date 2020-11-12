/**
 * This component when passed an array of dataUrls will load them, queue them up, and merge them into a single canvas.
 * It will do this in the order that they are specified instead of the order they load in.
 */
// @flow
import React, { useState, useEffect, forwardRef, useRef } from 'react'
import { FormattedMessage } from 'react-intl'

import './MergeCanvas.scss'
import ImageQueue from './ImageQueue'
import { getTransformParams } from '../../shared/utils/rotationUtil'
import uniqueId from 'lodash/uniqueId'

export type MergeCanvasPayload = {
  imageData: Uint8ClampedArray[],
  imageDataUrls: string[],
  width: number,
  height: number
}

type MergeCanvasProp = {
  layers: string[],
  width: number,
  height: number,
  applyZoomPan?: Function,
  hideCanvas?: boolean,
  colorOpacity?: number,
  handleLayersLoaded?: Function,
  rotationAngle?: Function
}

const MergeCanvas = (props: MergeCanvasProp, ref: RefObject) => {
  const { layers } = props
  // Creat sparse array to hold images
  const dangerousImageRefs = useRef(layers.map(x => null))
  const dangerousImageDataUrls = useRef([])
  const dangerousImageData = useRef([])
  // Use this to track and trigger state updates for when new images load.
  // Ones that have already loaded will be caused and this ensures that a full redraw will happen so long as 1 new image loads.
  const [imageRefId, setImageRefId] = useState(0)
  const opacity = props.colorOpacity !== void (0) ? props.colorOpacity : 1
  // The height  and width of the transformed input image
  const { width, height, rotationAngle } = props

  useEffect(() => {
    if (imageRefId.length && imageRefId.length === props.layers.length) {
      // This check should ensure that this fires after the images have been loaded
      dangerousImageRefs.current.forEach((img, i) => {
        const ctx = ref.current.getContext('2d')
        ctx.save()
        if (opacity && i > 0) {
          ctx.globalAlpha = opacity
        }

        let imageWidth = 0
        let imageHeight = 0

        // Check the loaded image orientation, it may not match the input width height
        if (img.height > img.width) {
          // is portrait
          imageWidth = Math.min(width, height)
          imageHeight = Math.max(width, height)
        } else {
          // is landscape
          imageWidth = Math.max(width, height)
          imageHeight = Math.min(width, height)
        }

        if (rotationAngle) {
          const {
            canvasWidth,
            canvasHeight,
            vScale,
            hScale,
            vSkew,
            hSkew,
            hTrans,
            vTrans,
            rotation
          } = getTransformParams(rotationAngle, width, height)
          // stuff needed for when there is a mismatch between the loaded image orientation and the rotation state
          imageWidth = canvasWidth
          imageHeight = canvasHeight

          ctx.setTransform(hScale, vSkew, hSkew, vScale, hTrans, vTrans)
          ctx.rotate(rotation)
        }

        ctx.drawImage(img, 0, 0, imageWidth, imageHeight)

        if (props.handleLayersLoaded) {
          const imgDatum = ctx.getImageData(0, 0, width, height)
          dangerousImageData.current.push(imgDatum)
          const imgDatumUrl = ctx.canvas.toDataURL()
          dangerousImageDataUrls.current.push(imgDatumUrl)
        }
        ctx.restore()
      })

      if (props.handleLayersLoaded) {
        const ctx = ref.current.getContext('2d')
        const { width, height } = ctx.canvas

        props.handleLayersLoaded({
          imageData: [...dangerousImageData.current],
          imageDataUrls: [...dangerousImageDataUrls.current],
          width,
          height
        })
      }

      if (props.applyZoomPan) {
        props.applyZoomPan(ref)
      }
    }
  }, [imageRefId])

  useEffect(() => {
    return () => {
      // Clean up potential memory leak
      dangerousImageRefs.current.length = 0
      dangerousImageData.current.length = 0
      dangerousImageDataUrls.current.length = 0
    }
  }, [])

  const addToQueue = (e: SyntheticEvent, i: number) => {
    e.target.onLoad = null
    dangerousImageRefs.current.splice(i, 1, e.target)
    const imageCount = dangerousImageRefs.current.filter(x => !!x).map(x => uniqueId('layer_'))
    setImageRefId(imageCount)
  }

  return (
    <>
      <ImageQueue
        dataUrls={props.layers}
        addToQueue={addToQueue}
      />
      <canvas
        width={width}
        height={height}
        ref={ref}
        className={props.hideCanvas ? 'merge-canvas-image-comp' : 'merge-canvas'}
      >
        <FormattedMessage id='CANVAS_UNSUPPORTED' />
      </canvas>
    </>
  )
}

export default forwardRef(MergeCanvas)

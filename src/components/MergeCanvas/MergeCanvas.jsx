/**
 * This component when passed an array of dataUrls will load them, queue them up, and merge them into a single canvas.
 * It will do this in the order that they are specified instead of the order they load in.
 */
// @flow
import React, { useState, useEffect, forwardRef } from 'react'
import { FormattedMessage } from 'react-intl'

import './MergeCanvas.scss'
import ImageQueue from './ImageQueue'
import { getTransformParams } from '../../shared/utils/rotationUtil'

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
  const [images, setImages] = useState([])
  const opacity = props.colorOpacity !== void (0) ? props.colorOpacity : 1
  // The height  and width of the transformed input image
  const { width, height, rotationAngle } = props

  useEffect(() => {
    const imageDataList = []
    const imageDataUrls = []
    if (images.length && images.length === props.layers.length) {
      // This check should ensure that this fires after the images have been loaded
      images.forEach((img, i) => {
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
          const imgData = ctx.getImageData(0, 0, width, height)
          imageDataList.push(imgData)
          const imgDataUrl = ctx.canvas.toDataURL()
          imageDataUrls.push(imgDataUrl)
        }
        ctx.restore()
      })

      if (props.handleLayersLoaded && imageDataList.length) {
        const ctx = ref.current.getContext('2d')
        const { width, height } = ctx.canvas

        props.handleLayersLoaded({
          imageData: [...imageDataList],
          imageDataUrls: [...imageDataUrls],
          width,
          height
        })
      }

      if (props.applyZoomPan) {
        props.applyZoomPan(ref)
      }
    }

    // Prevent memory leaks
    imageDataList.length = 0
    imageDataUrls.length = 0
    images.length = 0
  }, [images])

  const addToQueue = (e: SyntheticEvent, i: number) => {
    const queue = [...images]
    e.target.onLoad = null
    queue.splice(i, 1, e.target)

    setImages(queue)
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

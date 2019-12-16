/**
 * This component when passed an array of dataUrls will load them, queue them up, and merge them into a single canvas.
 * It will do this in the order that they are specified instead of the order they load in.
 */
// @flow
import React, { useState, useEffect, forwardRef } from 'react'
import { useIntl } from 'react-intl'

import './MergeCanvas.scss'
import ImageQueue from './ImageQueue'

type MergeCanvasProp = {
  layers: string[],
  width: number,
  height: number,
  applyZoomPan: Function
}

const MergeCanvas = (props: MergeCanvasProp, ref: RefObject) => {
  const [images, setImages] = useState([])

  useEffect(() => {
    if (images.length) {
      // This check should ensure that this fires after the images have been loaded
      const ctx = ref.current.getContext('2d')
      images.forEach((img, i) => {
        ctx.drawImage(img, 0, 0, ctx.canvas.width, ctx.canvas.height)
      })
      props.applyZoomPan(ref)
    }
  }, [images])

  useEffect(() => {
    // I found that if I do not explicitly empty the array, it will hold on to the refs of the images and leak memory
    // There is not a great way (that I could find) to get react refs for images when they must be queue and consumed in a specific order. -RS
    images.length = 0
  }, [images])

  const intl = useIntl()

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
        width={props.width}
        height={props.height}
        ref={ref}
        className='merge-canvas'
      >
        {intl.messages.CANVAS_UNSUPPORTED}
      </canvas>
    </>
  )
}

export default forwardRef(MergeCanvas)

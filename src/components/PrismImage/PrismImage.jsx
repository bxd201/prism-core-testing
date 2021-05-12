// @flow
import React, { forwardRef, useRef } from 'react'
import { useIntl } from 'react-intl'
import './PrismImage.scss'

type PrismImageProps = {
  shouldResample: boolean,
  width: number,
  height: number,
  source: string,
  scalingWidth: number
}

export type PrismImageData = {
  data: ImageData,
  width: number,
  height: number,
  isPortrait: boolean
}

const PrismImage = forwardRef((props: PrismImageProps, ref) => {
  const intl = useIntl()
  const canvasRef = useRef()
  const handleCallback = (e) => {
    // eslint-disable-next-line react/prop-types
    if (props.shouldResample) {
      console.log('Prism image has loaded.')
      return
    }
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let canvasWidth = props.width
    let canvasHeight = props.height
    const isPortrait = ref.current.height > ref.current.width
    if (props.shouldResample || (!canvasWidth && !canvasHeight)) {
      canvasWidth = props.scalingWidth
      const currentWidth = isPortrait ? Math.min(ref.current.width, ref.current.height) : Math.max(ref.current.width, ref.current.height)
      const currentHeight = isPortrait ? Math.max(ref.current.width, ref.current.height) : Math.min(ref.current.width, ref.current.height)
      canvasHeight = canvasWidth * (currentWidth / currentHeight)
    }

    canvas.width = canvasWidth
    canvas.height = canvasHeight
    ctx.drawImage(ref.current, 0, 0, canvasWidth, canvasHeight)
    const imageData = canvasWidth && ctx.getImageData(0, 0, canvasWidth, canvasHeight)

    const payload = {
      data: imageData,
      width: canvasWidth,
      height: Math.ceil(canvasHeight),
      isPortrait: ref.current.height > ref.current.width
    }
    // eslint-disable-next-line react/prop-types
    props.loadedCallback(payload)
  }
  return (
    // eslint-disable-next-line react/prop-types
    props.source ? <><img src={props.source} ref={ref} className='prism-image-comp' onLoad={handleCallback} alt={intl.formatMessage({ id: 'IMAGE_INVISIBLE' })} /><canvas className={'prism-image-comp'} ref={canvasRef} /></> : null
  )
})

export default PrismImage

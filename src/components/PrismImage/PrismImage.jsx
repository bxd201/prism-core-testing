// @flow
import React, { forwardRef, useRef } from 'react'
import './PrismImage.scss'
import { getScaledLandscapeHeight, getScaledPortraitHeight } from '../../shared/helpers/ImageUtils'

const PrismImage = forwardRef((props, ref) => {
  const canvasRef = useRef()
  const handleCallback = (e) => {
    // eslint-disable-next-line react/prop-types
    if (props.shouldResample) {
      console.log('Prism image has loaded.')
      return
    }
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    // eslint-disable-next-line react/prop-types
    const canvasWidth = props.scalingWidth
    console.log(`Scaling Width: ${canvasWidth}`)
    const canvasHeight = ref.current.height > ref.current.width ? getScaledPortraitHeight(ref.current.width, ref.current.height)(canvasWidth) : getScaledLandscapeHeight(ref.current.width, ref.current.height)(canvasWidth)
    canvas.width = canvasWidth
    canvas.height = canvasHeight
    ctx.drawImage(ref.current, 0, 0, canvasWidth, canvasHeight)
    const imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight)

    const payload = {
      dataUrl: imageData,
      width: canvasWidth,
      height: Math.ceil(canvasHeight),
      isPortrait: ref.current.height > ref.current.width
    }
    // eslint-disable-next-line react/prop-types
    props.loadedCallback(payload)
  }
  return (
    // eslint-disable-next-line react/prop-types
    props.source ? <><img src={props.source} ref={ref} className='prism-image-comp' onLoad={handleCallback} alt='invisible' /><canvas className={'prism-image-comp'} ref={canvasRef} /></> : null
  )
})

export default PrismImage

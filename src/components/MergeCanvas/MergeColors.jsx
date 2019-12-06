// @flow
import React, { useRef, useState, useEffect } from 'react'
import { imagePathListToImageData } from '../PaintScene/PaintSceneUtils'
import { useIntl } from 'react-intl'

import './MergeCanvas.scss'

type MergeColorsProps = {
  imageDataList: string[],
  handleImagesMerged: Function,
  width: number,
  height: number
}

const MergeColors = (props: MergeColorsProps) => {
  const canvasRef = useRef()
  const countRef = useRef(0)
  const imagesRef = useRef([])
  const intl = useIntl()
  const [imageUrls, setImageUrls] = useState([])

  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d')
    ctx.save()

    const imageDataUrls = props.imageDataList.map(imagePath => {
      const imageData = imagePathListToImageData(imagePath, props.width, props.height)
      ctx.putImageData(imageData, 0, 0)
      // @todo - I may need to return imagedata instead of base64 here -RS
      return ctx.canvas.toDataURL()
    })

    ctx.restore()

    setImageUrls(imageDataUrls)
  }, [])

  const handleImageLoad = (e) => {
    countRef.current++
    imagesRef.current.push(e.target)

    if (countRef.current === props.imageDataList.length) {
      const ctx = canvasRef.current.getContext('2d')

      imagesRef.current.forEach((img, i) => {
        ctx.drawImage(img, 0, 0)
      })
      const mergedImage = ctx.canvas.toDataURL('image/jpeg', 0.8)

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
      <canvas ref={canvasRef} width={props.width} height={props.height}>
        {intl.messages.CANVAS_UNSUPPORTED}
      </canvas>
    </>
  )
}

export default MergeColors

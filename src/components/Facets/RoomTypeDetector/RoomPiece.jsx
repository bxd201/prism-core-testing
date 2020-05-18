// @flow
import React, { useEffect, useState, useCallback } from 'react'
import RgbQuant from 'rgbquant'

import { loadImage, getImageRgbaData, createCanvasElementWithData } from './utils'
import CircleLoader from 'src/components/Loaders/CircleLoader/CircleLoader'
import Swatches from './Swatches'
import Card from './Card'
import { type RGBArr } from 'src/shared/types/Colors.js.flow'

import './RoomPiece.scss'

function getObjectImageUrl (imageData, width, height) {
  const elem = document.createElement('canvas')
  const ctx = elem.getContext('2d')

  elem.width = width
  elem.height = height

  ctx.putImageData(imageData, 0, 0)

  return elem.toDataURL()
}

var opts = {
  colors: 20
}

type Props = {
  label: string,
  pixels: Uint8ClampedArray,
  legendColor: RGBArr,
  width: number,
  height: number
}

const RoomPiece = (props: Props) => {
  const {
    pixels,
    width,
    legendColor,
    height,
    label
  } = props

  const [palette, setPalette] = useState()
  const [image, setImage] = useState()
  const [imageBg, setImageBg] = useState()
  const [processing, setProcessing] = useState(true)

  const handleSetColor = useCallback((color: string) => {
    if (color && color === imageBg) {
      setImageBg()
    } else if (color) {
      setImageBg(color)
    }
  }, [ imageBg ])

  useEffect(() => {
    const roomObjImageData = new ImageData(pixels, width, height)
    const roomObjImg = getObjectImageUrl(roomObjImageData, width, height)

    loadImage(roomObjImg).then(img => {
      const rgba = getImageRgbaData(img, img.naturalWidth, img.naturalHeight)
      const ctx = createCanvasElementWithData(rgba, img.naturalWidth, img.naturalWidth)
      const q = new RgbQuant(opts)

      q.sample(ctx)

      const pal = q.palette(true, true)

      setPalette(pal)
      setImage(roomObjImg)
      setProcessing(false)
    })
  }, [ pixels, width, height ])

  return (
    <>
      {!image ? <Card title={label}><CircleLoader inheritSize /></Card> : (
        <Card title={label} image={image} imageBg={imageBg} titleBg={`rgb(${legendColor[0]}, ${legendColor[1]}, ${legendColor[2]})`}>
          {processing ? (
            <CircleLoader inheritSize />
          ) : palette ? (
            <Swatches palette={palette} onSetColor={handleSetColor} />
          ) : null}
        </Card>
      )}
    </>

  )
}

export default RoomPiece

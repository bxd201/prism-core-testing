// @flow
import React, { useEffect, useState } from 'react'
import isNull from 'lodash/isNull'

import { getImageRgbaData, createCanvasElementWithData } from './FastMaskUtils'
import HueLuminosityWorker from './workers/createHueLuminosityMap.worker'

import type { Color } from '../../shared/types/Colors'

type Props = {
  width: number,
  height: number,
  maskId: string,
  filterId: string,
  color: Color,
  mask: string,
  source: Image
}

function FastMaskSVGDef ({ width, height, maskId, filterId, color, mask, source }: Props) {
  const [highlightShadowMap, setHighlightShadowMap] = useState('')

  useEffect(() => {
    if (!isNull(source) && !isNull(mask)) {
      const maskImageData = getImageRgbaData(mask, width, height)
      const userImageData = getImageRgbaData(source, width, height)

      const maskImageBinaryData = maskImageData.data
      const userImageBinaryData = userImageData.data

      const pixelCount = (width * height) * 4

      const hueLuminosityWorker = new HueLuminosityWorker()

      hueLuminosityWorker.postMessage({ imageRGBAdata: userImageBinaryData, imageMaskRgbaData: maskImageBinaryData, pixelCount })

      hueLuminosityWorker.onmessage = (e) => {
        // const { imageData } = e.data
        // const imgData = new ImageData(imageData, height, width)

        // retreive the canvas element that contains the user's image with highlights & shadows applied
        const canvasElement = createCanvasElementWithData(userImageData, width, height)

        // apply user image with highlghts & shadows to SVG filter
        setHighlightShadowMap(canvasElement.toDataURL())
      }
    }
  }, [mask, source])

  if (isNull(mask)) {
    return null
  }

  return (
    <svg className='svg-defs-wrapper' x='0' y='0' width='100%' height='100%' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlnsXlink='http://www.w3.org/1999/xlink' viewBox={`0 0 ${width * 2} ${height * 2}`}>
      <defs>
        <filter id={filterId} x='0' y='0' width='100%' height='100%' filterUnits='objectBoundingBox' primitiveUnits='objectBoundingBox' colorInterpolationFilters='sRGB'>
          <feFlood floodColor={color.hex} result='floodColor' />
          <feImage id='highlight_shadow_map' xlinkHref={highlightShadowMap} x='0' y='0' width='100%' height='100%' result='highlight_shadow_map' />
          <feColorMatrix in='highlight_shadow_map' id='highlight_shadow_map-desaturated' result='highlight_shadow_map-desaturated' type='saturate' values='0' />
          <feBlend mode='soft-light' in2='highlight_shadow_map-desaturated' in='floodColor' result='tinted-highlight_shadow_map' />
          <feImage id='tintPlaneMask' xlinkHref={mask.src} x='0' y='0' width='100%' height='100%' result='tintPlaneMask' />
          <feComposite in='tinted-highlight_shadow_map' in2='tintPlaneMask' operator='in' x='0%' y='0%' width='100%' height='100%' result='maskedFloodColor' />
        </filter>
        <mask id={maskId} x='0' y='0' width='100%' height='100%' maskUnits='objectBoundingBox'>
          <image x='0' y='0' width='100%' height='100%' xlinkHref={mask.src} />
        </mask>
      </defs>
    </svg>
  )
}

export default FastMaskSVGDef

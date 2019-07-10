// @flow
import React, { useEffect, useState } from 'react'
import isNull from 'lodash/isNull'

import { createCanvasElementWithData } from './FastMaskUtils'

import { type Color } from '../../shared/types/Colors'

/* global ImageData */

type Props = {
  width: number,
  height: number,
  maskId: string,
  filterId: string,
  color: Color,
  mask: string,
  source: Image,
  isLight: boolean,
  hasHighlight: boolean,
  highlightMap?: ArrayBuffer,
  onFinishProcessing?: Function
}

function FastMaskSVGDef (props: Props) {
  const {
    width,
    height,
    maskId,
    filterId,
    color,
    mask,
    source,
    onFinishProcessing,
    hasHighlight,
    highlightMap,
    isLight
  } = props
  const [highlightMask, setHighlightMask] = useState('')
  const [svgFilter, setSvgFilter] = useState(null)

  useEffect(() => {
    if (highlightMap && hasHighlight) {
      const highlightMapView = new Uint8ClampedArray(highlightMap)
      const highlightImage = new ImageData(highlightMapView, width, height)

      // retreive the canvas element that contains the user's image with highlights & shadows applied
      const highlightCanvas = createCanvasElementWithData(highlightImage, width, height)

      // apply user image with highlghts & shadows to SVG filter
      setHighlightMask(highlightCanvas.toDataURL())
    } else {
      setHighlightMask(void (0))
    }
    if (onFinishProcessing) {
      onFinishProcessing()
    }
  }, [highlightMap, hasHighlight])

  useEffect(() => {
    let i = 0

    if (!color || !color.hex) {
      setSvgFilter(null)
    }

    if (!source || !source.src) {
      setSvgFilter(null)
    }

    const filterArr = [
      <feFlood key={i++} floodColor={color.hex} result='floodColor' />,
      <feImage key={i++} xlinkHref={source.src} x='0' y='0' width='100%' height='100%' result='roomImage' />
    ]

    if (hasHighlight) {
      filterArr.push(<feImage key={i++} xlinkHref={highlightMask} x='0' y='0' width='100%' height='100%' result='highlightMap' />)
      filterArr.push(<feBlend key={i++} mode='lighten' in='floodColor' in2='roomImage' result='highlightedImage' />)
      filterArr.push(<feComposite key={i++} in='highlightedImage' in2='highlightMap' operator='in' x='0%' y='0%' width='100%' height='100%' result='roomHighlights' />)
      filterArr.push(<feColorMatrix key={i++} in='roomImage' result='roomImage-desat' type='saturate' values='0' />)
      filterArr.push(<feBlend key={i++} mode='multiply' in='floodColor' in2='roomImage-desat' result='shadowedImage' />)
      filterArr.push(<feComposite key={i++} in='shadowedImage' in2='highlightMap' operator='out' x='0%' y='0%' width='100%' height='100%' result='roomShadows' />)
      filterArr.push(<feComposite key={i++} in='roomHighlights' in2='roomShadows' operator='over' x='0%' y='0%' width='100%' height='100%' />)
    } else {
      filterArr.push(<feColorMatrix key={i++} in='roomImage' result='roomImage-desat' type='saturate' values='0' />)
      filterArr.push(<feBlend key={i++} mode='multiply' in='floodColor' in2='roomImage-desat' result='shadowedImage' />)
    }

    setSvgFilter(filterArr)
  }, [hasHighlight, isLight, color && color.hex, source && source.src, highlightMask])

  if (isNull(mask)) {
    return null
  }

  return (
    <React.Fragment>
      <svg className='svg-defs-wrapper' x='0' y='0' width='100%' height='100%' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlnsXlink='http://www.w3.org/1999/xlink' viewBox={`0 0 ${width * 2} ${height * 2}`}>
        <defs>
          <filter id={filterId} x='0' y='0' width='100%' height='100%' filterUnits='objectBoundingBox' primitiveUnits='objectBoundingBox' colorInterpolationFilters='sRGB'>
            {svgFilter}
          </filter>
          <mask id={maskId} x='0' y='0' width='100%' height='100%' maskUnits='objectBoundingBox'>
            <image x='0' y='0' width='100%' height='100%' xlinkHref={mask.src} />
          </mask>
        </defs>
      </svg>
    </React.Fragment>
  )
}

export default FastMaskSVGDef

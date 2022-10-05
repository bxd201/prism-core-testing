// @flow
import React, { useEffect, useState } from 'react'
import flattenDeep from 'lodash/flattenDeep'
import isNull from 'lodash/isNull'
import createCanvasElementWithData from 'src/shared/utils/createCanvasElementWithData.util'
import { type Color } from '../../shared/types/Colors.js.flow'

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
  debug?: boolean,
  highlightMap?: ArrayBuffer,
  hueMap?: ArrayBuffer,
  surfaceLighteningData?: ArrayBuffer
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
    hasHighlight,
    highlightMap,
    hueMap,
    surfaceLighteningData,
    isLight,
    debug
  } = props
  const [highlightMask, setHighlightMask] = useState('')
  const [hueMask, setHueMask] = useState('')
  const [lightenedImage, setLightenedImage] = useState('')
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
  }, [highlightMap, hasHighlight])

  useEffect(() => {
    if (surfaceLighteningData) {
      const surfaceLighteningDataView = new Uint8ClampedArray(surfaceLighteningData)
      const lightenedImage = new ImageData(surfaceLighteningDataView, width, height)

      // retreive the canvas element that contains the user's image with highlights & shadows applied
      const lightenedCanvas = createCanvasElementWithData(lightenedImage, width, height)

      // apply user image with highlghts & shadows to SVG filter
      setLightenedImage(lightenedCanvas.toDataURL())
    } else {
      setLightenedImage(void (0))
    }
  }, [surfaceLighteningData])

  useEffect(() => {
    if (hueMap) {
      const hueMapView = new Uint8ClampedArray(hueMap)
      const hueImage = new ImageData(hueMapView, width, height)

      // retreive the canvas element that contains the user's image with highlights & shadows applied
      const hueCanvas = createCanvasElementWithData(hueImage, width, height)

      // apply user image with highlghts & shadows to SVG filter
      setHueMask(hueCanvas.toDataURL())
    } else {
      setHueMask(void (0))
    }
  }, [hueMap, hasHighlight])

  useEffect(() => {
    let i = 0

    if (!color || !color.hex) {
      setSvgFilter(null)
    }

    if (!source || !source.src) {
      setSvgFilter(null)
    }

    const filterArr = [
      <feFlood key={i++} floodColor={debug ? 'magenta' : color.hex} result='surfaceColor' />,
      <feImage key={i++} xlinkHref={lightenedImage} x='0' y='0' width='100%' height='100%' result='lightenedImage' />,
      <feImage key={i++} xlinkHref={source.src} x='0' y='0' width='100%' height='100%' result='roomImageZero' />,
      // this is just to get a "working" copy of roomImage, preserving roomImageZero as the pristine version
      <feComposite key={i++} in='lightenedImage' in2='roomImageZero' operator='over' x='0%' y='0%' width='100%' height='100%' result='roomImageZero' />,
      <feComposite key={i++} in='roomImageZero' in2='roomImageZero' operator='over' x='0%' y='0%' width='100%' height='100%' result='roomImage' />,
      <feImage key={i++} xlinkHref={hueMask} x='0' y='0' width='100%' height='100%' result='desaturationMask' />,
      hasHighlight
        ? [
        <feImage key={i++} xlinkHref={highlightMask} x='0' y='0' width='100%' height='100%' result='highlightMask' />
          ]
        : void (0),

      // =========================================================================
      // BEGIN DESATURATION
      debug
        ? [
        <feFlood key={i++} floodColor={'chartreuse'} result='desatMaskColor' />,
        <feComposite key={i++} in='desatMaskColor' in2='desaturationMask' operator='in' x='0%' y='0%' width='100%' height='100%' result='desatRoomParts' />,
        <feComponentTransfer key={i++} in='desatRoomParts' result='desatRoomParts'>
          <feFuncA type='linear' slope='0.5' />
        </feComponentTransfer>,
        <feComposite key={i++} in='desatRoomParts' in2='roomImageZero' operator='over' x='0%' y='0%' width='100%' height='100%' result='roomImage' />
          ]
        : [
        <feColorMatrix key={i++} in='roomImageZero' type='saturate' values='0' result='roomImage' />,
        <feComposite key={i++} in='roomImage' in2='desaturationMask' operator='in' x='0%' y='0%' width='100%' height='100%' result='desatRoomParts' />,
        hasHighlight
          ? [
          <feComposite key={i++} in='desatRoomParts' in2='highlightMask' operator='out' x='0%' y='0%' width='100%' height='100%' result='desatRoomParts' />
            ]
          : void (0),
        <feComposite key={i++} in='desatRoomParts' in2='roomImageZero' operator='over' x='0%' y='0%' width='100%' height='100%' result='roomImage' />
          ]
    ]
    // END DESATURATION
    // =========================================================================

    if (hasHighlight) {
      if (debug) {
        // just draw highlights on top of room scene
        filterArr.push(<feComposite key={i++} in='surfaceColor' in2='highlightMask' operator='in' x='0%' y='0%' width='100%' height='100%' result='highlightRoomParts' />)
        filterArr.push(<feComponentTransfer key={i++} in='highlightRoomParts' result='highlightRoomParts'>
          <feFuncA type='linear' slope='0.5' />
        </feComponentTransfer>)
        filterArr.push(<feComposite key={i++} in='highlightRoomParts' in2='roomImage' operator='over' x='0%' y='0%' width='100%' height='100%' result='roomImage' />)
      } else {
        // =========================================================================
        // BEGIN LIGHTENING
        // QUESTION: do you want to lighten the original room image, or the hue-map-desaturated one? right now it's original
        filterArr.push(<feBlend key={i++} mode='lighten' in='surfaceColor' in2='roomImageZero' result='highlightedImage' />)
        filterArr.push(<feComposite key={i++} in='highlightedImage' in2='highlightMask' operator='in' x='0%' y='0%' width='100%' height='100%' result='highlightRoomParts' />)
        // END LIGHTENING
        // =========================================================================
        // BEGIN DARKENING
        filterArr.push(<feBlend key={i++} mode='multiply' in='surfaceColor' in2='roomImage' result='roomImage' />)
        filterArr.push(<feComposite key={i++} in='roomImage' in2='highlightMask' operator='out' x='0%' y='0%' width='100%' height='100%' result='roomImage' />)
        filterArr.push(<feComposite key={i++} in='roomImage' in2='roomImageZero' operator='over' x='0%' y='0%' width='100%' height='100%' result='roomImage' />)
        filterArr.push(<feComposite key={i++} in='highlightRoomParts' in2='roomImage' operator='over' x='0%' y='0%' width='100%' height='100%' result='roomImage' />)
        // END DARKENING
        // =========================================================================
      }
    } else {
      if (debug) {
        // don't need to do nothin' special here
      } else {
        filterArr.push(<feBlend key={i++} mode='multiply' in='surfaceColor' in2='roomImage' result='roomImage' />)
      }
    }

    setSvgFilter(flattenDeep(filterArr).filter(v => v))
  }, [hasHighlight, isLight, color && color.hex, source && source.src, highlightMask, hueMask, lightenedImage, debug])

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

import React from 'react'
import { SCENE_TYPES } from '../../constants'

export interface TintableSceneSVGDefsProps {
  maskImage: string
  maskId: string
  filterId: string
  type: string
  filterColor?: string
  highlightMap?: string
  shadowMap?: string
  filterImageValueCurve?: string
}

export const TEST_ID = {
  CONTAINER: 'DEFS_CONTAINER',
  FILTER_ROOM: 'FILTER_ROOM',
  FILTER_AUTOMOTIVE: 'FILTER_AUTOMOTIVE',
  CURVE_FUNC: 'CURVE_FUNC',
  HIGHLIGHT_MAP: 'HIGHLIGHT_MAP',
  SHADOW_MAP: 'SHADOW_MAP'
}

function TintableSceneSVGDefs(props: TintableSceneSVGDefsProps): JSX.Element {
  const { filterId, maskId, maskImage, filterColor, type, highlightMap, shadowMap, filterImageValueCurve } = props
  let content: JSX.Element = null

  switch (type) {
    case SCENE_TYPES.FAST_MASK:
    case SCENE_TYPES.ROOM: {
      content = (
        <>
          <filter
            id={filterId}
            x='0'
            y='0'
            width='100%'
            height='100%'
            filterUnits='objectBoundingBox'
            primitiveUnits='objectBoundingBox'
            colorInterpolationFilters='sRGB'
            data-testid={TEST_ID.FILTER_ROOM}
          >
            <feComponentTransfer in='SourceGraphic' result='adjustedHistogram'>
              {filterImageValueCurve ? (
                <>
                  <feFuncR type='table' tableValues={filterImageValueCurve} data-testid={TEST_ID.CURVE_FUNC} />
                  <feFuncG type='table' tableValues={filterImageValueCurve} data-testid={TEST_ID.CURVE_FUNC} />
                  <feFuncB type='table' tableValues={filterImageValueCurve} data-testid={TEST_ID.CURVE_FUNC} />
                </>
              ) : null}
            </feComponentTransfer>

            <feFlood floodColor={filterColor} result='tintHue' />
            <feBlend mode='multiply' in2='tintHue' in='adjustedHistogram' />
          </filter>
          <mask id={maskId} x='0' y='0' width='100%' height='100%' maskUnits='objectBoundingBox'>
            <image x='0' y='0' width='100%' height='100%' xlinkHref={maskImage} />
          </mask>
        </>
      )
      break
    }
    case SCENE_TYPES.AUTOMOTIVE:
    case SCENE_TYPES.OBJECT: {
      content = (
        <>
          <filter
            id={filterId}
            x='0'
            y='0'
            width='100%'
            height='100%'
            filterUnits='objectBoundingBox'
            primitiveUnits='objectBoundingBox'
            colorInterpolationFilters='sRGB'
            data-testid={TEST_ID.FILTER_AUTOMOTIVE}
          >
            <feFlood floodColor={filterColor} result='tintHue' />
            {highlightMap ? (
              <feImage
                xlinkHref={highlightMap}
                x='0'
                y='0'
                width='100%'
                height='100%'
                result='highlight-map'
                data-testid={TEST_ID.HIGHLIGHT_MAP}
              />
            ) : null}
            {shadowMap ? (
              <feImage
                xlinkHref={shadowMap}
                x='0'
                y='0'
                width='100%'
                height='100%'
                result='shadow-map'
                data-testid={TEST_ID.SHADOW_MAP}
              />
            ) : null}
            <feBlend mode='screen' in2='highlight-map' in='tintHue' result='tint-highlight-blend' />
            <feBlend mode='multiply' in='shadow-map' in2='tint-highlight-blend' result='finished-tint' />
            <feBlend mode='luminosity' in='finished-tint' in2='tintHue' result='finished-filter' />
          </filter>
          <mask id={maskId} x='0' y='0' width='100%' height='100%' maskUnits='objectBoundingBox'>
            <image x='0' y='0' width='100%' height='100%' xlinkHref={maskImage} />
          </mask>
        </>
      )
      break
    }
  }

  return <defs data-testid={TEST_ID.CONTAINER}>{content}</defs>
}

export default TintableSceneSVGDefs

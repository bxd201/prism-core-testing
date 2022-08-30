import React from 'react'

import { SCENE_TYPES } from '../../constants'
import { getBeforeHash } from '../../utils/tintable-scene'

export const getStyleValues = (
  shouldScale: boolean,
  shouldAdjustSvgHeight: boolean,
  scalingWidth: string | number,
  scalingHeight: string | number
): any => {
  if (!shouldScale && !shouldAdjustSvgHeight) {
    return null
  }

  const styles: any = {}

  if (shouldScale) {
    styles.width = scalingWidth
    styles.height = scalingHeight
  }

  if (shouldAdjustSvgHeight) {
    styles.height = 'auto'
  }

  return styles
}

export interface TintableSceneSurfaceProps {
  image: string
  maskId: string
  filterId: string
  width?: string | number
  height?: string | number
  type: string
  children: any
  // This prop will hardcode the width and height, use this when you need to programtically resize.
  scaleSvg?: boolean
  adjustSvgHeight?: boolean
}

export const TEST_ID = {
  CONTAINER: 'SCENE_SURFACE_CONTAINER',
  CONTENTS_IMAGE: 'CONTENTS_IMAGE',
  CONTENTS_RECT: 'CONTENTS_RECT'
}

function TintableSceneSurface(props: TintableSceneSurfaceProps): JSX.Element {
  const getSvgContents = (): JSX.Element => {
    const { image, maskId, filterId, type } = props
    const baseUrl = getBeforeHash(window.location.href)
    const mask = `url("${baseUrl}#${maskId}")`
    const filter = `url("${baseUrl}#${filterId}")`

    switch (type) {
      case SCENE_TYPES.FAST_MASK:
      case SCENE_TYPES.ROOM:
        return (
          <image
            xlinkHref={image}
            width='100%'
            height='100%'
            mask={mask}
            filter={filter}
            data-testid={TEST_ID.CONTENTS_IMAGE}
          />
        )
      case SCENE_TYPES.OBJECT:
      case SCENE_TYPES.AUTOMOTIVE:
        return (
          <rect
            className='rect'
            x='0'
            y='0'
            width='100%'
            height='100%'
            mask={mask}
            filter={filter}
            data-testid={TEST_ID.CONTENTS_RECT}
          />
        )
    }
  }

  const { width, height, scaleSvg, adjustSvgHeight } = props

  return (
    <svg
      style={getStyleValues(scaleSvg, adjustSvgHeight, width, height)}
      className='absolute pointer-events-none top-0 left-0 h-full w-full'
      viewBox={`0 0 ${width} ${height}`}
      version='1.1'
      xmlns='http://www.w3.org/2000/svg'
      xmlnsXlink='http://www.w3.org/1999/xlink'
      preserveAspectRatio='none'
      data-testid={TEST_ID.CONTAINER}
    >
      {props.children}
      {getSvgContents()}
    </svg>
  )
}

export default TintableSceneSurface

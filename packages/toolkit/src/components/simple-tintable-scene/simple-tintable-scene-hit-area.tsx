// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { CSSProperties, useState } from 'react'
import uniqueId from 'lodash/uniqueId'
import memoizee from 'memoizee'
import { getBeforeHash } from '../../utils/tintable-scene'
import InlineSVG from '../inline-svg/inline-svg'

export const makeHandleSvgLoaded = (success: Function, error: Function) => (failed) => {
  if (failed) {
    return error()
  }

  success()
}

export interface SimpleTintableSceneHitAreaProps {
  connectDropTarget: Function
  surfaceIndex: number
  interactionHandler: any
  onLoadingSuccess?: Function
  onLoadingError?: Function
  svgSource: string
}

const _styles: CSSProperties = {
  opacity: 0,
  pointerEvents: 'all',
  stroke: 'rgba(0, 0, 0, 1)',
  strokeWidth: '5px',
  willChange: 'opacity',
  transition: 'opacity .4s ease-out'
}

export const TEST_ID = {
  CONTAINER: 'HIT_AREA_CONTAINER',
  MOUSE_LISTENER: 'MOUSE_LISTENER'
}

const maskIdMap = memoizee((path) => uniqueId('TSHA'), { length: 1, primitive: true })
function SimpleTintableSceneHitArea({
  interactionHandler,
  onLoadingSuccess,
  onLoadingError,
  svgSource
}: SimpleTintableSceneHitAreaProps): JSX.Element {
  const maskId: string = maskIdMap(svgSource)

  const [svgStyles, setSvgStyles] = useState({ ..._styles })

  const handleSVGLoaded = makeHandleSvgLoaded(onLoadingSuccess, onLoadingError)

  const handleMouseEnter = (e): void => {
    const newStyle = { ...svgStyles, opacity: 1 }
    setSvgStyles(newStyle)
  }

  const handleMouseLeave = (e): void => {
    const newStyle = { ...svgStyles, opacity: 0 }
    setSvgStyles(newStyle)
  }

  const hitAreaSelector = `${getBeforeHash(window.location.href)}#mask__${maskId}`

  return (
    <div className={`absolute pointer-events-none left-0 top-0 h-full w-full`} data-testid={TEST_ID.CONTAINER}>
      <InlineSVG url={svgSource} svgId={maskId} loadedCallback={handleSVGLoaded} />
      <svg className={`absolute top-0 left-0 h-full w-full pointer-events-none`}>
        <use
          className={`cursor-pointer fill-transparent opacity-0 hover:opacity-100`}
          style={svgStyles}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          xlinkHref={hitAreaSelector}
          onClick={interactionHandler}
          onTouchStart={interactionHandler}
          data-testid={TEST_ID.MOUSE_LISTENER}
        />
      </svg>
    </div>
  )
}

export default SimpleTintableSceneHitArea

import React, { CSSProperties } from 'react'
import memoizee from 'memoizee'
import uniqueId from 'lodash/uniqueId'
import SVG from 'react-inlinesvg'
import { useDrop } from 'react-dnd'

import { DRAG_TYPES } from '../../constants'
import { getBeforeHash } from '../../utils/tintable-scene'

export interface SimpleTintableSceneHitAreaProps {
    connectDropTarget: Function,
    surfaceIndex: number,
    onDrop: Function,
    interactionHandler: any,
    onLoadingSuccess?: Function,
    onLoadingError?: Function,
    svgSource: string,
}

const maskIdMap = memoizee(path => uniqueId('TSHA'), { length: 1, primitive: true })
const SimpleTintableSceneHitArea = ({ onDrop, interactionHandler, onLoadingSuccess, onLoadingError, svgSource, surfaceIndex }: SimpleTintableSceneHitAreaProps): JSX.Element => {
  const maskId: string = maskIdMap(svgSource)
  const useStyle: CSSProperties = {
    pointerEvents: 'all',
    stroke: 'rgba(magenta, .5)',
    strokeWidth: '5px',
    willChange: 'opacity',
    transition: 'opacity .4s ease-out',
  }

  const [{ isOver }, drop] = useDrop(() => {
    return {
      accept: DRAG_TYPES.SWATCH,
      drop: (item: any, monitor) => {
        const didDrop = monitor.didDrop()
        if (didDrop) {
          onDrop(surfaceIndex, item.color)
        }
      },
      collect: (monitor)  => {
        return {
          isOver: monitor.isOver(),
          isOverCurrent: monitor.isOver({ shallow: true })
        }
      }
    }
  })

  if (isOver)
    useStyle.opacity = 1

  return <div ref={drop} className={`absolute left-0 top-0 pointer-events-none h-full w-full`}>
      <SVG
        className={`absolute h-0 w-0 invisible`}
        style={{zIndex: -1}}
        src={svgSource}
        cacheRequests
        uniqueHash={maskId}
        onLoad={(src) => {
          if (typeof onLoadingSuccess === 'function') {
            onLoadingSuccess()
          }
        }}
        onError={(err) => {
          console.warn('TintableSceneHitArea failed to load SVG', err)
          if (typeof onLoadingError === 'function') {
            onLoadingError()
          }
        }} />
      <svg className={`absolute top-0 left-0 h-full w-full pointer-events-none`}>
        <use className={`cursor-pointer fill-transparent opacity-0 hover:opacity-100`}
          style={useStyle}
          xlinkHref={`${getBeforeHash(window.location.href)}#mask___${maskId}`}
          onClick={interactionHandler} onTouchStart={interactionHandler} />
      </svg>
    </div>
}

export default SimpleTintableSceneHitArea
// DropTarget(DRAG_TYPES.SWATCH, SimpleTintableSceneHitAreaSpec, collect)

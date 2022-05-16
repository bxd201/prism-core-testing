import React, { CSSProperties } from 'react'
import memoizee from 'memoizee'
import uniqueId from 'lodash/uniqueId'
import SVG from 'react-inlinesvg'
import { DropTarget } from 'react-dnd-cjs'

import { DRAG_TYPES } from '../../constants'
import { getBeforeHash } from '../../utils/tintable-scene'

export interface SimpleTintableSceneHitAreaProps {
    connectDropTarget: Function,
  // isOver is provided by dnd
    isOver: any,
    surfaceIndex: number,
    onDrop: Function,
    interactionHandler: any,
    onOver: Function,
    onOut: Function,
    onLoadingSuccess?: Function,
    onLoadingError?: Function,
    svgSource: string,
}

const SimpleTintableSceneHitAreaSpec = {
  drop (props: SimpleTintableSceneHitAreaProps, monitor) {
    const droppedItem = monitor.getItem()

    if (droppedItem?.color) {
      props.onDrop(props.surfaceIndex, droppedItem.color)
    }
  }
}

function collect (connect, monitor): any {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver()
  }
}

const maskIdMap = memoizee(path => uniqueId('TSHA'), { length: 1, primitive: true })
const SimpleTintableSceneHitArea = ({ connectDropTarget, isOver, onDrop, interactionHandler, onOver, onOut, onLoadingSuccess, onLoadingError, svgSource }: SimpleTintableSceneHitAreaProps): JSX.Element => {
  const maskId: string = maskIdMap(svgSource)
  const useStyle: CSSProperties = {
    pointerEvents: 'all',
    stroke: 'rgba(magenta, .5)',
    strokeWidth: '5px',
    willChange: 'opacity',
    transition: 'opacity .4s ease-out',
  }

  if (isOver)
    useStyle.opacity = 1

  return connectDropTarget?.(
    <div className={`absolute left-0 top-0 pointer-events-none h-full w-full`}>
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
  )
}

export default DropTarget(DRAG_TYPES.SWATCH, SimpleTintableSceneHitAreaSpec, collect)(SimpleTintableSceneHitArea)

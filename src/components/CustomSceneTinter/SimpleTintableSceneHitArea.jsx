// @flow
import React, { useEffect } from 'react'
import memoizee from 'memoizee'
import uniqueId from 'lodash/uniqueId'

import SVG from 'react-inlinesvg'
import { DRAG_TYPES } from 'constants/globals'
import { DropTarget } from 'react-dnd-cjs'

import ensureFullyQualifiedAssetUrl from 'src/shared/utils/ensureFullyQualifiedAssetUrl.util'
import getBeforeHash from 'src/shared/utils/getBeforeHash.util'
type Props = {
    connectDropTarget: Function,
    isOver: any,
    id: string,
    onDrop: Function,
    interactionHandler: Function,
    onOver: Function,
    onOut: Function,
    onLoadingSuccess?: Function,
    onLoadingError?: Function,
    svgSource: string
}

const classNames = {
  hitArea: 'prism-scene-manager__scene__hit-area',
  hitAreaWrapper: 'prism-scene-manager__scene__hit-area-wrapper',
  hitAreaMask: 'prism-scene-manager__scene__hit-area__mask',
  hitAreaMaskLoader: 'prism-scene-manager__scene__hit-area__mask-loader'
}

const SimpleTintableSceneHitAreaSpec = {
  drop (props: Props, monitor) {
    const droppedItem = monitor.getItem()

    if (droppedItem && droppedItem.color) {
      props.onDrop(props.id, droppedItem.color)
    }
  }
}

function collect (connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver()
  }
}

const SimpleTintableSceneHitArea = ({ connectDropTarget, isOver, id, onDrop, interactionHandler, onOver, onOut, onLoadingSuccess, onLoadingError, svgSource }: Props) => {
  useEffect(() => isOver ? onOver(id) : onOut(id), isOver)
  const maskIdMap = memoizee(path => uniqueId('TSHA'), { length: 1, primitive: true })
  const maskId = maskIdMap(ensureFullyQualifiedAssetUrl(svgSource))
  return connectDropTarget && connectDropTarget(
    <div className={classNames.hitAreaWrapper}>
      <SVG
        className={classNames.hitAreaMaskLoader}
        src={ensureFullyQualifiedAssetUrl(svgSource)}
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
      <svg className={classNames.hitArea}>
        <use className={`${classNames.hitAreaMask} ${isOver ? `${classNames.hitAreaMask}--hover` : ''}`}
          xlinkHref={`${getBeforeHash(window.location.href)}#mask___${maskId}`}
          onClick={interactionHandler} onTouchStart={interactionHandler} />
      </svg>
    </div>
  )
}

export default DropTarget(DRAG_TYPES.SWATCH, SimpleTintableSceneHitAreaSpec, collect)(SimpleTintableSceneHitArea)

// @flow
import React, { PureComponent } from 'react'
import memoizee from 'memoizee'
import uniqueId from 'lodash/uniqueId'

import SVG from 'react-inlinesvg'
import { DRAG_TYPES } from 'constants/globals'
import { DropTarget } from 'react-dnd-cjs'

import ensureFullyQualifiedAssetUrl from 'src/shared/utils/ensureFullyQualifiedAssetUrl.util'
import getBeforeHash from 'src/shared/utils/getBeforeHash.util'

type Props = {
  connectDropTarget: Function,
  isOver: Boolean,
  id: string,
  onDrop: Function, // eslint-disable-line
  interactionHandler: Function,
  onOver: Function,
  onOut: Function,
  onLoadingSuccess?: Function,
  onLoadingError?: Function,
  svgSource: string,
  surfaceIndex: number
}

const TintableSceneHitAreaSpec = {
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

export class TintableSceneHitArea extends PureComponent<Props> {
  static defaultProps = {}
  static classNames = {
    hitArea: 'prism-scene-manager__scene__hit-area',
    hitAreaWrapper: 'prism-scene-manager__scene__hit-area-wrapper',
    hitAreaMask: 'prism-scene-manager__scene__hit-area__mask',
    hitAreaMaskLoader: 'prism-scene-manager__scene__hit-area__mask-loader'
  }
  static maskIdMap = memoizee(path => uniqueId('TSHA'), { length: 1, primitive: true })
  // $FlowIgnore
  constructor (props) {
    super(props)

    this.handleInteraction = this.handleInteraction.bind(this)
  }
  // $FlowIgnore
  componentDidUpdate (prevProps, prevState) {
    if (prevProps.isOver !== this.props.isOver) {
      if (this.props.isOver) {
        this.props.onOver(this.props.id)
      } else {
        this.props.onOut(this.props.id)
      }
    }
  }

  handleInteraction = (e: any) => {
    this.props.interactionHandler(this.props.id, this.props.surfaceIndex)
  }

  render () {
    const { connectDropTarget, svgSource, isOver, onLoadingError, onLoadingSuccess } = this.props

    const maskId = TintableSceneHitArea.maskIdMap(ensureFullyQualifiedAssetUrl(svgSource))

    return connectDropTarget && connectDropTarget(
      <div className={TintableSceneHitArea.classNames.hitAreaWrapper}>
        <SVG
          className={TintableSceneHitArea.classNames.hitAreaMaskLoader}
          src={ensureFullyQualifiedAssetUrl(svgSource)}
          cacheRequests
          uniqueHash={maskId}
          onLoad={(src) => {
            if (typeof onLoadingSuccess === 'function') {
              onLoadingSuccess()
            }
          }}
          onError={(err) => {
            // failure
            console.warn('TintableSceneHitArea failed to load SVG', err)
            if (typeof onLoadingError === 'function') {
              onLoadingError()
            }
          }} />
        <svg className={TintableSceneHitArea.classNames.hitArea}>
          <use className={`${TintableSceneHitArea.classNames.hitAreaMask} ${isOver ? `${TintableSceneHitArea.classNames.hitAreaMask}--hover` : ''}`}
            xlinkHref={`${getBeforeHash(window.location.href)}#mask___${maskId}`}
            onClick={this.handleInteraction} onTouchStart={this.handleInteraction} />
        </svg>
      </div>
    )
  }
}

export default DropTarget(DRAG_TYPES.SWATCH, TintableSceneHitAreaSpec, collect)(TintableSceneHitArea)

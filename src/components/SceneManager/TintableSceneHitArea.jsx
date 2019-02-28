// @flow
import React, { PureComponent } from 'react'
import memoizee from 'memoizee'
import uniqueId from 'lodash/uniqueId'

import SVG from 'react-inlinesvg'
import { DRAG_TYPES } from 'constants/globals'
import { DropTarget } from 'react-dnd'

import { ensureFullyQualifiedAssetUrl } from '../../shared/helpers/DataUtils'

type Props = {
  connectDropTarget: Function,
  isOver: Boolean,
  id: string,
  onDrop: Function, // eslint-disable-line
  onClick: Function,
  onOver: Function,
  onOut: Function,
  onLoadingSuccess?: Function,
  onLoadingError?: Function,
  svgSource: string
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

class TintableSceneHitArea extends PureComponent<Props> {
  static defaultProps = {}
  static classNames = {
    hitArea: 'prism-scene-manager__scene__hit-area',
    hitAreaWrapper: 'prism-scene-manager__scene__hit-area-wrapper',
    hitAreaMask: 'prism-scene-manager__scene__hit-area__mask',
    hitAreaMaskLoader: 'prism-scene-manager__scene__hit-area__mask-loader'
  }
  static maskIdMap = memoizee(path => uniqueId('TSHA'), { length: 1, primitive: true })

  constructor (props) {
    super(props)

    this.handleClick = this.handleClick.bind(this)
  }

  componentDidUpdate (prevProps, prevState) {
    if (prevProps.isOver !== this.props.isOver) {
      if (this.props.isOver) {
        this.props.onOver(this.props.id)
      } else {
        this.props.onOut(this.props.id)
      }
    }
  }

  handleClick = function handleClick (e: any) {
    this.props.onClick(this.props.id)
  }

  render () {
    const { connectDropTarget, svgSource, isOver, onLoadingError, onLoadingSuccess } = this.props

    const maskId = TintableSceneHitArea.maskIdMap(ensureFullyQualifiedAssetUrl(svgSource))

    return connectDropTarget && connectDropTarget(
      <div className={TintableSceneHitArea.classNames.hitAreaWrapper}>
        <SVG
          className={TintableSceneHitArea.classNames.hitAreaMaskLoader}
          src={ensureFullyQualifiedAssetUrl(svgSource)}
          cacheGetRequests
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
            xlinkHref={`#mask___${maskId}`}
            onClick={this.handleClick} />
        </svg>
      </div>
    )
  }
}

export default DropTarget(DRAG_TYPES.SWATCH, TintableSceneHitAreaSpec, collect)(TintableSceneHitArea)

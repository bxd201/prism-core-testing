// @flow
import React, { PureComponent } from 'react'
import _ from 'lodash'
// $FlowIgnore
import SVG from 'react-inlinesvg'
import { DRAG_TYPES } from 'constants/globals'
import { DropTarget } from 'react-dnd'

type Props = {
  connectDropTarget: Function,
  isOver: Boolean,
  id: string, // eslint-disable-line
  onDrop: Function, // eslint-disable-line
  onClick: Function, // eslint-disable-line
  onOver: Function,
  onOut: Function,
  svgSource: string
}

const TintableSceneHitAreaSpec = {
  drop (props: Props, monitor) {
    const droppedItem = monitor.getItem()

    if (droppedItem && droppedItem.color && droppedItem.color.hex) {
      props.onDrop(props.id, droppedItem.color.hex)
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
  static maskIdMap = _.memoize(path => _.uniqueId('TSHA'))

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
    const { connectDropTarget, svgSource, isOver } = this.props

    const maskId = TintableSceneHitArea.maskIdMap(svgSource)

    return connectDropTarget && connectDropTarget(
      <div className={TintableSceneHitArea.classNames.hitAreaWrapper}>
        <SVG
          className={TintableSceneHitArea.classNames.hitAreaMaskLoader}
          src={svgSource}
          cacheGetRequests
          uniqueHash={maskId}
          // onLoad={(src) => {
          // }}
          onError={(err) => {
            // failure
            console.warn('TintableSceneHitArea failed to load SVG', err)
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

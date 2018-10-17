// @flow
import React, { PureComponent } from 'react'
import { DRAG_TYPES } from 'constants/globals'
import { DropTarget } from 'react-dnd'

type Props = {
  connectDropTarget: Function,
  isOver: Boolean,
  id: string, // eslint-disable-line
  onDrop: Function, // eslint-disable-line
  onClick: Function, // eslint-disable-line
  color: string,
  svgSource: string
}

const DeadSimpleSceneSurfaceHitAreaSpec = {
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
    isOver: monitor.isOver(),
    canDrop: monitor.canDrop()
  }
}

class DeadSimpleSceneSurfaceHitArea extends PureComponent<Props> {
  static defaultProps = {}
  static baseClass = 'SimpleScene__hit-area'
  static baseClassMask = `${DeadSimpleSceneSurfaceHitArea.baseClass}__mask`

  constructor (props) {
    super(props)

    this.handleClick = this.handleClick.bind(this)
  }

  handleClick = function handleClick (e: any) {
    this.props.onClick(this.props.id)
  }

  render () {
    const { connectDropTarget, isOver, color, svgSource } = this.props
    return connectDropTarget && connectDropTarget(
      <svg className={DeadSimpleSceneSurfaceHitArea.baseClass} style={{ fill: color }}>
        <use className={`${DeadSimpleSceneSurfaceHitArea.baseClassMask} ${isOver ? `${DeadSimpleSceneSurfaceHitArea.baseClassMask}--hover` : ''}`}
          xlinkHref={`${svgSource}#mask`}
          onClick={this.handleClick} />
      </svg>
    )
  }
}

export default DropTarget(DRAG_TYPES.SWATCH, DeadSimpleSceneSurfaceHitAreaSpec, collect)(DeadSimpleSceneSurfaceHitArea)

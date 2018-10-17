import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import PropTypes from 'prop-types'
import flow from 'lodash/flow'
import { DragSource, DropTarget } from 'react-dnd'

import { remove } from '../../actions/live-palette'

import { DRAG_TYPES } from 'constants/globals'

class ActiveSlot extends PureComponent<Props> {
  ACTIVE_CLASS = 'prism-live-palette__slot--active'
  REMOVAL_CLASS = 'prism-live-palette__slot--removing'

  state = {
    isDeleting: false
  }

  constructor (props) {
    super(props)

    this.onClick = this.onClick.bind(this)
    this.remove = this.remove.bind(this)
  }

  render () {
    const { color, active, connectDragSource, connectDropTarget, isDragging } = this.props
    const { isDeleting } = this.state
    const opacity = isDragging ? 0 : 1

    return connectDragSource && connectDropTarget && connectDragSource(
      connectDropTarget(
        <div className={`prism-live-palette__slot ${(active ? this.ACTIVE_CLASS : '')} ${(isDeleting ? this.REMOVAL_CLASS : '')}`} style={{ backgroundColor: color.hex, opacity: opacity }} onClick={this.onClick}>
          <div className='prism-live-palette__color-details'>
            <span className='prism-live-palette__color-number'>{ color.colorNumber } - { color.id }</span>
            <span className='prism-live-palette__color-name'>{ color.name }</span>
            <button className='prism-live-palette__trash' onClick={this.remove}><FontAwesomeIcon icon='trash' size='1x' /></button>
          </div>
        </div>
      )
    )
  }

  onClick () {
    // only trigger the onClick and activating the swatch if it's not already active.
    // this should prevent an additional re-render since clicking on the move icon also triggers the click
    // on the swatch itself
    if (!this.props.active) {
      this.props.onClick(this.props.color)
    }
  }

  remove () {
    const { color } = this.props

    this.setState({ isDeleting: true })

    setTimeout(() => {
      this.props.remove(color.id)
    }, 200)
  }
}

ActiveSlot.propTypes = {
  color: PropTypes.object,
  isDragging: PropTypes.bool,
  remove: PropTypes.func,
  onClick: PropTypes.func,
  moveColor: PropTypes.func,
  connectDragSource: PropTypes.func,
  connectDropTarget: PropTypes.func
}

const swatchSource = {
  beginDrag (props) {
    return {
      color: props.color
    }
  }
}

const swatchTarget = {
  hover (props, monitor) {
    const activelyDraggingColorId = monitor.getItem().color.id

    if (activelyDraggingColorId !== props.color.id) {
      props.moveColor(activelyDraggingColorId, props.color.id)
    }
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    remove: (colorId) => {
      dispatch(remove(colorId))
    }
  }
}

export default flow([
  DropTarget(DRAG_TYPES.SWATCH, swatchTarget, connect => ({
    connectDropTarget: connect.dropTarget()
  })),
  DragSource(DRAG_TYPES.SWATCH, swatchSource, (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
  })),
  connect(null, mapDispatchToProps)
])(ActiveSlot)

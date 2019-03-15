// @flow
import React, { useState } from 'react'
import { findDOMNode } from 'react-dom'
import { connect } from 'react-redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import flow from 'lodash/flow'
import { DragSource, DropTarget } from 'react-dnd'
import { fullColorNumber } from '../../shared/helpers/ColorUtils'
import { type Color } from '../../shared/types/Colors'

import { remove, activatePreview } from '../../store/actions/live-palette'

import { DRAG_TYPES } from 'constants/globals'

type Props = {
  active: boolean,
  color: Color,
  isDragging: boolean,
  remove: Function,
  onClick: Function,
  connectDragSource: Function,
  connectDropTarget: Function
}

function ActiveSlot (props: Props) {
  const ACTIVE_CLASS = 'prism-live-palette__slot--active'
  const REMOVAL_CLASS = 'prism-live-palette__slot--removing'

  const { color, active, connectDragSource, connectDropTarget, isDragging } = props
  const [isDeleting, setDeletingStatus] = useState(false)

  const opacity = isDragging ? 0.33 : 1
  const LIGHT_DARK_CLASS = color.isDark ? 'prism-live-palette__color-details--dark' : 'prism-live-palette__color-details--dark-color'

  const activateSlot = () => {
    // only trigger the onClick and activating the swatch if it's not already active.
    // this should prevent an additional re-render since clicking on the move icon also triggers the click
    // on the swatch itself
    if (!props.active) {
      props.onClick(color)
    }
  }

  const remove = () => {
    setDeletingStatus(true)
    setTimeout(() => {
      props.remove(color.id)
    }, 200)
  }

  return connectDragSource && connectDropTarget && connectDragSource(
    connectDropTarget(
      <div className={`prism-live-palette__slot ${(active ? ACTIVE_CLASS : '')} ${(isDeleting ? REMOVAL_CLASS : '')}`} style={{ backgroundColor: color.hex, opacity }} onClick={activateSlot} onKeyDown={activateSlot} role='button' tabIndex='-1'>
        <div className={`prism-live-palette__color-details ${LIGHT_DARK_CLASS}`}>
          <span className='prism-live-palette__color-number'>{fullColorNumber(color.brandKey, color.colorNumber)}</span>
          <span className='prism-live-palette__color-name'>{ color.name }</span>
          <span className='prism-live-palette__color-description'>{ color.description.join(', ') }</span>
          <button className='prism-live-palette__trash' onClick={remove}><FontAwesomeIcon icon='trash' size='1x' /></button>
        </div>
      </div>
    )
  )
}

const swatchSource = {
  beginDrag (props) {
    // as soon as a swatch begins dragging, set it as the current surface preview color in redux
    props.activatePreviewColor(props.color)

    return {
      color: props.color,
      index: props.index
    }
  }
}

const swatchTarget = {
  hover (props, monitor) {
    const activelyDraggingColorId = monitor.getItem().color.id
    const targetColorId = props.color.id

    const dragIndex = monitor.getItem().index
    const hoverIndex = props.index

    // don't replace swatches with themselves
    if (dragIndex === hoverIndex) {
      return
    }

    // get target swatch
    const tgtSwatch = findDOMNode(props.node.current)

    if (!tgtSwatch || typeof tgtSwatch.getBoundingClientRect !== 'function') {
      return
    }

    // $FlowIgnore -- Flow isn't aware of getBoundingClientRect so it doesn't know what to make of it
    const hoverBoundingRect = tgtSwatch.getBoundingClientRect()

    // get horizontal middle
    const hoverMiddleX = (hoverBoundingRect.right - hoverBoundingRect.left) / 2

    // determine mouse position
    const clientOffset = monitor.getClientOffset()

    // get pixels to the left
    const hoverClientX = clientOffset.x - hoverBoundingRect.left

    // only perform the move when the mouse has crossed half of the items height
    if (dragIndex < hoverIndex && hoverClientX < hoverMiddleX) {
      return
    }
    if (dragIndex > hoverIndex && hoverClientX > hoverMiddleX) {
      return
    }

    // perform the move action
    props.moveColor(activelyDraggingColorId, targetColorId)

    // mutating monitor.. not ideal but this is required for the above 50%
    // logic to actually work. This is the recommended approach per the examples
    // provided by DnD.
    monitor.getItem().index = hoverIndex
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    remove: (colorId) => {
      dispatch(remove(colorId))
    },
    activatePreviewColor: (color) => {
      dispatch(activatePreview(color))
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

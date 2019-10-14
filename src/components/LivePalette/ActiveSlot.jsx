// @flow
import React, { useState, useRef } from 'react'
import { connect } from 'react-redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useDrag, useDrop } from 'react-dnd'
import { fullColorNumber } from '../../shared/helpers/ColorUtils'
import { type Color } from '../../shared/types/Colors'

import { remove, activatePreview } from '../../store/actions/live-palette'

import { DRAG_TYPES } from 'constants/globals'

type Props = {
  active: boolean,
  color: Color,
  index: Number,
  remove: Function,
  onClick: Function,
  moveColor: Function
}

export function ActiveSlot (props: Props) {
  const ref = useRef(null)
  const { color, active, index } = props
  const [isDeleting, setDeletingStatus] = useState(false)

  const ACTIVE_CLASS = 'prism-live-palette__slot--active'
  const REMOVAL_CLASS = 'prism-live-palette__slot--removing'

  const LIGHT_DARK_CLASS = color.isDark ? 'prism-live-palette__color-details--dark' : 'prism-live-palette__color-details--dark-color'

  const [, drop] = useDrop({
    accept: DRAG_TYPES.SWATCH,
    hover (item, monitor) {
      if (!ref.current) {
        return
      }

      const dragIndex = item.index
      const hoverIndex = index

      // prevent items from replacing themself
      if (dragIndex === hoverIndex) {
        return
      }

      // determine rectangle on screen
      const hoverBoundingRect = ref.current.getBoundingClientRect()

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
      props.moveColor(dragIndex, hoverIndex)

      item.index = hoverIndex
    }
  })

  const activateSlot = () => {
    // only trigger the onClick and activating the swatch if it's not already active.
    // this should prevent an additional re-render since clicking on the move icon also triggers the click
    // on the swatch itself
    if (!props.active && props.onClick) {
      props.onClick(color)
    }
  }

  const remove = () => {
    setDeletingStatus(true)
    setTimeout(() => {
      props.remove(color.id)
    }, 200)
  }

  const [{ isDragging }, drag] = useDrag({
    item: { type: DRAG_TYPES.SWATCH, color, index },
    collect: monitor => ({
      isDragging: monitor.isDragging()
    })
  })
  const opacity = isDragging ? 0.33 : 1

  drag(drop(ref))

  return (
    <div ref={ref} className={`prism-live-palette__slot ${(active ? ACTIVE_CLASS : '')} ${(isDeleting ? REMOVAL_CLASS : '')}`} style={{ backgroundColor: color.hex, opacity }} onClick={activateSlot} onKeyDown={activateSlot} role='button' tabIndex='-1'>
      <div className={`prism-live-palette__color-details ${LIGHT_DARK_CLASS}`}>
        <span className='prism-live-palette__color-number'>{fullColorNumber(color.brandKey, color.colorNumber)}</span>
        <span className='prism-live-palette__color-name'>{ color.name }</span>
        <span className='prism-live-palette__color-description'>{ color.description.join(', ') }</span>
        <button className='prism-live-palette__trash' onClick={remove}><FontAwesomeIcon icon={['fa', 'trash']} size='1x' /></button>
      </div>
    </div>
  )
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

export default connect(null, mapDispatchToProps)(ActiveSlot)

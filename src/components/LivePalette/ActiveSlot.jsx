// @flow
import React, { useState, useRef } from 'react'
import { connect } from 'react-redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useDrag, useDrop } from 'react-dnd'
import { fullColorNumber, getContrastYIQ } from '../../shared/helpers/ColorUtils'
import { type Color } from '../../shared/types/Colors'
import { remove, activatePreview, editCompareColor } from '../../store/actions/live-palette'

import { DRAG_TYPES } from 'constants/globals'

type Props = {
  active: boolean,
  color: Color,
  index: Number,
  remove: Function,
  onClick: Function,
  moveColor: Function,
  toggleCompareColor: boolean,
  handleCompareColor: Function
}
const baseClass = 'prism-live-palette__slot'

export function ActiveSlot (props: Props) {
  const { color, active, index, toggleCompareColor } = props

  const activeSlotRef = useRef(null)
  const [isDeleting, setDeletingStatus] = useState(false)
  const [isColorAdded, setToggleAddedColor] = useState(true)
  const [isToggleCompareColor, setPrevToggle] = useState(null)

  const ACTIVE_CLASS = 'prism-live-palette__slot--active'
  const REMOVAL_CLASS = 'prism-live-palette__slot--removing'
  const displayArea = 'container__color-display-area'
  const icons = 'container__toggle-check-icons'
  const LIGHT_DARK_CLASS = color.isDark ? 'prism-live-palette__color-details--dark' : 'prism-live-palette__color-details--dark-color'

  const [, drop] = useDrop({
    accept: DRAG_TYPES.SWATCH,
    hover (item, monitor) {
      if (!activeSlotRef.current) {
        return
      }

      const dragIndex = item.index
      const hoverIndex = index

      // prevent items from replacing themself
      if (dragIndex === hoverIndex) {
        return
      }

      // determine rectangle on screen
      const hoverBoundingRect = activeSlotRef.current.getBoundingClientRect()

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

  const hanleToggle = () => {
    setToggleAddedColor(!isColorAdded)
    props.handleCompareColor(color.id)
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

  drag(drop(activeSlotRef))

  if (toggleCompareColor !== isToggleCompareColor) {
    setToggleAddedColor(true)
    setPrevToggle(toggleCompareColor)
  }

  return (
    <div ref={activeSlotRef} className={`prism-live-palette__slot ${(active ? ACTIVE_CLASS : '')} ${(isDeleting ? REMOVAL_CLASS : '')}`} style={{ backgroundColor: color.hex, opacity }} onClick={activateSlot} onKeyDown={activateSlot} role='button' tabIndex='-1'>
      {!toggleCompareColor && <div className={`prism-live-palette__color-details ${LIGHT_DARK_CLASS}`}>
        <span className='prism-live-palette__color-number'>{fullColorNumber(color.brandKey, color.colorNumber)}</span>
        <span className='prism-live-palette__color-name'>{ color.name }</span>
        <span className='prism-live-palette__color-description'>{ color.description.join(', ') }</span>
        <button className='prism-live-palette__trash' onClick={remove}><FontAwesomeIcon icon={['fa', 'trash']} size='1x' /></button>
      </div>}
      {toggleCompareColor && <button style={{ color: getContrastYIQ(color.hex) }} className={`${baseClass}__button`} onClick={() => hanleToggle()}>
        <div className={`${baseClass}__${displayArea}`} style={{ backgroundColor: color.hex }}>
          { isColorAdded && <FontAwesomeIcon className={`${baseClass}__${icons} ${toggleCompareColor ? `${baseClass}__${icons}--show` : `${baseClass}__${icons}--hide`}`} icon={['fa', 'check-circle']} size='2x' /> }
          { !isColorAdded && <FontAwesomeIcon className={`${baseClass}__${icons} ${toggleCompareColor ? `${baseClass}__${icons}--show` : `${baseClass}__${icons}--hide`}`} icon={['fal', 'plus-circle']} size='2x' /> }
        </div>
      </button>}
    </div>
  )
}

const mapStateToProps = (state, props) => {
  return {
    toggleCompareColor: state.lp.toggleCompareColor
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    remove: (colorId) => {
      dispatch(remove(colorId))
    },
    activatePreviewColor: (color) => {
      dispatch(activatePreview(color))
    },
    handleCompareColor: (colorId) => {
      dispatch(editCompareColor(colorId))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ActiveSlot)

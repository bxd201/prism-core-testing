// @flow
import React, { useState, useRef } from 'react'
import { connect } from 'react-redux'
import 'src/providers/fontawesome/fontawesome'
import { useDrag, useDrop } from 'react-dnd-cjs'
import { fullColorNumber } from '../../shared/helpers/ColorUtils'
import { type Color } from '../../shared/types/Colors.js.flow'
import { remove, activatePreview, editCompareColor } from '../../store/actions/live-palette'
import { KEY_CODES } from 'src/constants/globals'
import { DRAG_TYPES } from 'constants/globals'

type Props = {
  active: boolean,
  color: Color,
  index: Number,
  onClick: Function,
  moveColor: Function,
  toggleCompareColor: boolean,
  swatchStyles: any
}

export function SimpleActiveSlot (props: Props) {
  const { color, active, index, toggleCompareColor, swatchStyles } = props

  const activeSlotRef = useRef(null)
  const dragIcon = useRef(null)
  const [isToggleCompareColor, setPrevToggle] = useState(null)

  const ACTIVE_CLASS = 'simple-prism-live-palette__slot--active'

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

  const activateSlot = (e: SyntheticEvent) => {
    // only trigger the onClick and activating the swatch if it's not already active.
    // this should prevent an additional re-render since clicking on the move icon also triggers the click
    // on the swatch itself
    if (!props.active && props.onClick && (!e.keyCode || (e.keyCode && (e.keyCode === KEY_CODES.KEY_CODE_ENTER || e.keyCode === KEY_CODES.KEY_CODE_SPACE)))) {
      props.onClick(color)
    }
  }

  const [{ isDragging }, drag] = useDrag({
    item: { type: DRAG_TYPES.SWATCH, color, index },
    collect: monitor => ({
      isDragging: monitor.isDragging()
    }),
    canDrag: (monitor) => {
      let { x: mouseX, y: mouseY } = monitor.getClientOffset()
      const dragIconBoundingRect = dragIcon.current.getBoundingClientRect()
      let { x: iconX, y: iconY, width, height } = dragIconBoundingRect
      return !((toggleCompareColor || mouseX < iconX || mouseX > (iconX + width) || mouseY < iconY || mouseY > (iconY + height)))
    }
  })
  const opacity = isDragging ? 0 : 1

  drag(drop(activeSlotRef))

  if (toggleCompareColor !== isToggleCompareColor) {
    setPrevToggle(toggleCompareColor)
  }

  const customSwatchStyles = {
    backgroundColor: color.hex,
    opacity,
    ...swatchStyles
  }

  let colorDescription = ''
  if (color && color.description) {
    colorDescription = color.description.join(', ')
  }

  return (
    <div aria-label={`Expand option for ${color.name} color`} ref={activeSlotRef} className={`simple-prism-live-palette__slot ${(active ? ACTIVE_CLASS : '')}`} onClick={activateSlot} onKeyDown={activateSlot} role='button' tabIndex={active ? '-1' : '0'}>
      <div className={`simple-prism-live-palette__color-block`} style={customSwatchStyles}>&nbsp;</div>
      <div className={`simple-prism-live-palette__color-details`}>
        <div className='simple-prism-live-palette__description'>
          <span className='simple-prism-live-palette__color-number'>{fullColorNumber(color.brandKey, color.colorNumber)}</span>
          <span className='simple-prism-live-palette__color-name'>{ color.name }</span>
          <span className='simple-prism-live-palette__color-description'>{ colorDescription}</span>
        </div>
      </div>
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

export default connect(mapStateToProps, mapDispatchToProps)(SimpleActiveSlot)

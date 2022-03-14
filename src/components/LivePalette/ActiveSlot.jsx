// @flow
import React, { useState, useRef } from 'react'
import { connect } from 'react-redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import InfoButton from 'src/components/InfoButton/InfoButton'
import 'src/providers/fontawesome/fontawesome'
import { useDrag, useDrop } from 'react-dnd-cjs'
import { fullColorNumber, getContrastYIQ } from '../../shared/helpers/ColorUtils'
import { type Color } from '../../shared/types/Colors.js.flow'
import { remove, activatePreview, editCompareColor } from '../../store/actions/live-palette'
import { KEY_CODES } from 'src/constants/globals'
import { useIntl } from 'react-intl'
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
const width = 20

export function ActiveSlot (props: Props) {
  const { color, active, index, toggleCompareColor } = props

  const activeSlotRef = useRef(null)
  const dragIcon = useRef(null)
  const [isDeleting, setDeletingStatus] = useState(false)
  const [isColorAdded, setToggleAddedColor] = useState(true)
  const [isToggleCompareColor, setPrevToggle] = useState(null)

  const ACTIVE_CLASS = 'prism-live-palette__slot--active'
  const REMOVAL_CLASS = 'prism-live-palette__slot--removing'
  const displayArea = 'container__color-display-area'
  const icons = 'container__toggle-check-icons'
  const LIGHT_DARK_CLASS = color.isDark ? 'prism-live-palette__color-details--dark' : 'prism-live-palette__color-details--dark-color'
  const intl = useIntl()

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

  const handleToggle = () => {
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
    setToggleAddedColor(true)
    setPrevToggle(toggleCompareColor)
  }
  const lineColor = getContrastYIQ(color.hex)
  return (
    <div aria-label={`Expand option for ${color.name} color`} ref={activeSlotRef} className={`prism-live-palette__slot ${(active ? ACTIVE_CLASS : '')} ${(isDeleting ? REMOVAL_CLASS : '')}`} style={{ backgroundColor: color.hex, opacity }} onClick={activateSlot} onKeyDown={activateSlot} role='button' tabIndex={active ? '-1' : '0'}>
      {!toggleCompareColor && <div className={`prism-live-palette__color-details ${LIGHT_DARK_CLASS}`}>
        <div className='prism-live-palette__description'>
          <span className='prism-live-palette__color-number'>{fullColorNumber(color.brandKey, color.colorNumber)}</span>
          <span className='prism-live-palette__color-name'>{ color.name }</span>
          <span className='prism-live-palette__color-description'>{ color.description.join(', ') }</span>
        </div>
        <div className='prism-live-palette__button-group'>
          <div className='prism-live-palette__info-button'><InfoButton color={color} /></div>
          <button aria-label={intl.formatMessage({ id: 'LIVE_PALETTE_REMOVE' }, { colorName: color.name })} className='prism-live-palette__trash' onClick={remove}><FontAwesomeIcon icon={['fa', 'trash']} size='1x' /></button>
        </div>
      </div>}
      {toggleCompareColor && <button style={{ color: getContrastYIQ(color.hex) }} className={`${baseClass}__button`} onClick={() => handleToggle()}>
        <div className={`${baseClass}__${displayArea}`} style={{ backgroundColor: color.hex }}>
          { isColorAdded && <FontAwesomeIcon className={`${baseClass}__${icons} ${toggleCompareColor ? `${baseClass}__${icons}--show` : `${baseClass}__${icons}--hide`}`} icon={['fa', 'check-circle']} size='1x' /> }
          { !isColorAdded && <FontAwesomeIcon className={`${baseClass}__${icons} ${toggleCompareColor ? `${baseClass}__${icons}--show` : `${baseClass}__${icons}--hide`}`} icon={['fal', 'plus-circle']} size='1x' /> }
        </div>
      </button>}
      <div ref={dragIcon} className={`${baseClass}__drag-icon-wrapper ${!toggleCompareColor ? `${baseClass}__drag-icon-wrapper--show` : `${baseClass}__drag-icon-wrapper--hide`}`} >
        <svg>
          <line strokeWidth='1px' stroke={lineColor} x1={width} y1='0' x2='0' y2={width} />
          <line strokeWidth='1px' stroke={lineColor} x1={width} y1={Math.floor(width / 3)} x2={Math.floor(width / 3)} y2={width} />
          <line strokeWidth='1px' stroke={lineColor} x1={width} y1={2 * Math.floor(width / 3)} x2={2 * Math.floor(width / 3)} y2={width} />
        </svg>
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

export default connect(mapStateToProps, mapDispatchToProps)(ActiveSlot)

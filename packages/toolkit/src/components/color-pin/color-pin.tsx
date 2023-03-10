import React, { memo, ReactNode, useMemo } from 'react'
import uniqueId from 'lodash/uniqueId'
import { Color } from '../../types'

export const defaultMessages = {
  ADD: 'Add',
  REMOVE: 'Remove'
}

export interface ColorPinProps {
  buttonContent?: ReactNode | ((color: Color) => ReactNode)
  addButtonMessage?: string
  color: Color | null
  expandsLeft?: boolean
  isColorAdded?: boolean | ((color: Color) => boolean)
  isOpen?: boolean
  labelContent?: ReactNode | ((color: Color) => ReactNode)
  onColorAdded?: (color: Color) => void
  style?: { top: string; left: string; size?: string }
}

const ColorPin = ({
  buttonContent,
  addButtonMessage,
  color,
  expandsLeft = false,
  isColorAdded,
  isOpen = false,
  labelContent,
  onColorAdded,
  style
}: ColorPinProps): JSX.Element => {
  const { hex } = color
  const getButtonContent = typeof buttonContent === 'function' ? buttonContent?.(color) : buttonContent
  const getIsColorAdded = typeof isColorAdded === 'function' ? isColorAdded?.(color) : isColorAdded
  const getLabelContent = typeof labelContent === 'function' ? labelContent?.(color) : labelContent

  const pinId = useMemo(() => uniqueId(color.name).replace(' ', '-').toLowerCase(), [color])
  const addId = useMemo(() => uniqueId(`add-${color.name}`).replace(' ', '-').toLowerCase(), [color])
  const defaultMessage = isColorAdded ? defaultMessages.REMOVE : defaultMessages.ADD

  return (
    <div className='flex absolute' style={style}>
      <button
        className={`${
          isOpen ? 'w-12 h-12 z-50' : 'w-8 h-8 z-10'
        } flex items-center justify-center border-2 border-white rounded-full ring-primary focus:outline-none focus-visible:ring-2`}
        style={{ background: hex, width: style?.size, height: style?.size }}
        aria-labelledby={pinId}
        data-testid='color-pin'
      >
        {!isOpen && getIsColorAdded && getButtonContent}
      </button>
      <div
        className={`${isOpen ? '' : 'invisible'} flex z-40 absolute ${
          expandsLeft ? 'right-1/2 flex-row-reverse' : 'left-1/2'
        } bg-white`}
      >
        <button
          className={`w-20 h-12 flex items-center justify-center ${
            expandsLeft ? 'pr-5' : 'pl-5'
          } border-y-2 border-white`}
          style={{ background: hex, fontSize: '2rem' }}
          onClick={() => onColorAdded?.(color)}
          onMouseDown={(e) => e.stopPropagation()}
          onMouseUp={(e) => e.stopPropagation()}
          onTouchStart={(e) => {
            e.stopPropagation()
            onColorAdded?.(color)
          }}
          onTouchEnd={(e) => e.stopPropagation()}
          aria-labelledby={`${addId} ${pinId}`}
        >
          <span id={addId} hidden>
            {addButtonMessage || defaultMessage}
          </span>
          {getButtonContent}
        </button>
        <div id={pinId} className='m-auto px-2 bg-white text-dark'>
          {getLabelContent}
        </div>
      </div>
    </div>
  )
}

export default memo<ColorPinProps>(ColorPin)

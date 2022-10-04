import React, { useEffect, useRef,useState } from 'react'
import { range,without } from 'lodash'
import { useContainerSize, useWindowSize } from '../../hooks'
import { Color } from '../../types'

export interface LivePaletteProps {
  activeIndex?: number
  addButtonRenderer?: (color: Color[]) => JSX.Element
  colors?: Color[]
  className?: string
  deleteButtonRenderer?: (color: Color, callback?: () => void) => JSX.Element
  detailsButtonRenderer?: (color: Color, callback?: () => void) => JSX.Element
  emptySlotRenderer?: () => JSX.Element
  labelRenderer?: (color: Color) => JSX.Element
  maxSlots?: number
  onColorActivated?: (color: Color) => void
  onColorsChanged?: (colors: Color[]) => void
  slotAriaLabel?: (color: Color) => string
}

const LivePalette = ({
  activeIndex = 0,
  addButtonRenderer,
  colors = [],
  deleteButtonRenderer,
  detailsButtonRenderer,
  emptySlotRenderer,
  labelRenderer,
  maxSlots = 8,
  onColorActivated,
  onColorsChanged,
  slotAriaLabel,
  ...otherProps
}: LivePaletteProps): JSX.Element => {
  const [lpColors, setLpColors] = useState(colors ?? [])
  const [lpActiveIndex, setLpActiveIndex] = useState<number>(activeIndex)

  // callbacks called on state change
  useEffect(() => onColorsChanged?.(lpColors), [lpColors])
  useEffect(() => onColorActivated?.(lpColors[lpActiveIndex]), [lpActiveIndex])

  // re-initialize state when it's initializer prop is changed
  useEffect(() => setLpColors(colors), [colors])
  useEffect(() => setLpActiveIndex(activeIndex), [activeIndex])

  // calculate slot widths from current palette's width
  const ref = useRef<HTMLDivElement>(null)
  const { width } = useContainerSize(ref)
  const { width: windowWidth } = useWindowSize()
  const widthDimension = width < 468 || windowWidth < 768

  const inactiveSlotWidth = width / maxSlots - 4 - (widthDimension ? 0 : width / maxSlots * 0.16)
  const activeSlotWidth = width / maxSlots + (widthDimension ? 0 : width / maxSlots * 0.16) * (maxSlots - 1)
  const activeColor = lpColors[lpActiveIndex] ?? lpColors[lpColors.length - 1]

  const textColor = (color): string => color?.isDark ? 'text-white' : 'text-black'

  return (
    <div {...otherProps} ref={ref} className={`w-full h-20 ${otherProps.className ?? ''}`}>
      {lpColors.length > 0 && maxSlots > 0 && (
        <div
          className={`md:hidden flex items-center justify-between flex-1 w-full mb-1 p-1.5 ${textColor(activeColor)}`}
          style={{ backgroundColor: activeColor?.hex }}
        >
          {labelRenderer?.(activeColor)}
          <div className='flex'>{detailsButtonRenderer?.(activeColor)}</div>
        </div>
      )}
      <ul className='flex gap-1 w-full h-1/2 md:h-full'>
        {lpColors.slice(0, Math.min(maxSlots, lpColors.length)).map((color, i) => {
          const isActive = activeColor.id === color.id

          return (
            <li tabIndex={-1} key={`${color.id}-${i}`}>
              <div
                role='button'
                aria-label={slotAriaLabel?.(color)}
                className='relative flex flex-wrap h-full cursor-auto transition-width duration-500 ease-out ring-secondary focus:outline-none focus-visible:ring-2'
                onClick={() => setLpActiveIndex(i)}
                onKeyDown={(e) => e.keyCode !== 9 && setLpActiveIndex(i)}
                style={{
                  backgroundColor: color.hex,
                  boxShadow: isActive && widthDimension ? `0px -6px ${color.hex}` : '',
                  width: `${isActive ? activeSlotWidth : inactiveSlotWidth}px`
                }}
                tabIndex={isActive ? -1 : 0}
              >
                {isActive && (
                  <div className='md:m-2 relative w-full overflow-hidden'>
                    <div className={`hidden md:block ${textColor(color)}`}>{labelRenderer?.(activeColor)}</div>
                    <div className={`relative md:absolute top-0 md:top-0.5 right-0 md:right-0.5 flex h-full items-center md:items-start justify-center ${textColor(color)}`}>
                      <div className='hidden md:flex'>{detailsButtonRenderer?.(color)}</div>
                      {deleteButtonRenderer?.(color, () => setLpColors(without(lpColors, color)))}
                    </div>
                  </div>
                )}
              </div>
            </li>
          )
        })}
        {range(Math.max(maxSlots - lpColors.length, 0)).map((i) => (
          <li
            aria-label='Empty slot'
            key={`${i}`}
            style={{ width: `${lpColors.length === 0 && i === 0 ? activeSlotWidth : inactiveSlotWidth}px` }}
          >
            {i === 0 ? addButtonRenderer?.(lpColors) : emptySlotRenderer?.()}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default LivePalette

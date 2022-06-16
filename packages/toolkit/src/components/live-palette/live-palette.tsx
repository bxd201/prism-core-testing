import React, { useState, useEffect, useRef } from 'react'
import { Color } from '../../types'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { without, range } from 'lodash'
import { useContainerSize, useWindowSize } from '../../hooks'

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
  const widthDimension = width < 640 || windowWidth < 768

  const inActiveSlotWidth: number = width * (widthDimension ? 0.92 : maxSlots / 9.72) / maxSlots
  const activeSlotWidth: number = widthDimension ? inActiveSlotWidth : inActiveSlotWidth * 2.5
  const activeColor = lpColors[lpActiveIndex] ?? lpColors[lpColors.length - 1]

  const textColor = (color): string => color?.isDark ? 'text-white' : 'text-black'

  return (
    <div {...otherProps} ref={ref} className={`w-full h-20 ${otherProps.className ?? ''}`}>
      {lpColors.length > 0 && maxSlots > 0 && (
        <div
          className={`md:hidden flex items-center justify-between flex-1 w-full mb-1 p-1 ${textColor(activeColor)}`}
          style={{ backgroundColor: activeColor?.hex }}
        >
          {labelRenderer?.(activeColor)}
          <div className='flex mr-2'>{detailsButtonRenderer?.(activeColor)}</div>
        </div>
      )}
      <DragDropContext
        onDragEnd={({ source, destination }) => {
          const items = Array.from(lpColors)
          const [reorderedItem] = items.splice(source.index, 1)
          if (destination != null) {
            items.splice(destination.index, 0, reorderedItem)
          }
          setLpColors(items)
          // index of active color may have changed, re-calculate it's index in the new order
          setLpActiveIndex(items.findIndex(({ id }) => activeColor.id === id))
        }}
      >
        <Droppable droppableId='colorSlots' direction='horizontal'>
          {({ innerRef, droppableProps, placeholder }) => (
            <ul ref={innerRef} className='flex w-full h-1/2 md:h-full' {...droppableProps}>
              {lpColors.slice(0, Math.min(maxSlots, lpColors.length)).map((color, i) => {
                const isActive = activeColor.id === color.id

                return (
                  <Draggable key={color.id} draggableId={color.id.toString()} index={i}>
                    {({ innerRef, draggableProps, dragHandleProps }) => (
                      <li
                        ref={innerRef}
                        {...draggableProps}
                        {...dragHandleProps}
                        tabIndex={-1}
                        className={`m-0.5${i === 0 ? ' ml-0' : ''}`}
                      >
                        <div
                          role='button'
                          aria-label={slotAriaLabel?.(color)}
                          className='ring-primary focus:outline-none focus-visible:ring-2 relative flex flex-wrap h-full cursor-auto transition-width duration-500 ease-out'
                          onClick={() => setLpActiveIndex(i)}
                          onKeyDown={(e) => e.keyCode !== 9 && setLpActiveIndex(i)}
                          style={{
                            backgroundColor: color.hex,
                            boxShadow: isActive && widthDimension ? `0px -6px ${color.hex}` : '',
                            width: `${isActive ? activeSlotWidth : inActiveSlotWidth}px`
                          }}
                          tabIndex={isActive ? -1 : 0}
                        >
                          {isActive && (
                            <div className='md:m-2 relative w-full overflow-hidden'>
                              <div className={`hidden md:block ${textColor(color)}`}>
                                {labelRenderer?.(activeColor)}
                              </div>
                              <div className={`relative md:absolute top-0 md:top-0.5 right-0 md:right-0.5 flex h-full items-center md:items-start justify-center ${textColor(color)}`}>
                                <div className='hidden md:flex'>{detailsButtonRenderer?.(color)}</div>
                                {deleteButtonRenderer?.(color, () => setLpColors(without(lpColors, color)))}
                              </div>
                            </div>
                          )}
                          <svg
                            aria-label={`Drag color ${color.name}`}
                            className={`hidden md:flex absolute bottom-0 right-0 stroke-current w-5 h-5 ${textColor(color)}`}
                            style={{ margin: '5px' }}
                          >
                            <line strokeWidth='1px' x1='20' y1='0' x2='0' y2='20' />
                            <line strokeWidth='1px' x1='20' y1='6' x2='6' y2='20' />
                            <line strokeWidth='1px' x1='20' y1='12' x2='12' y2='20' />
                          </svg>
                        </div>
                      </li>
                    )}
                  </Draggable>
                )
              })}
              {placeholder}
              {range(Math.max(maxSlots - lpColors.length, 0)).map((i) => (
                <li
                  aria-label='Empty slot'
                  key={i}
                  className='m-0.5'
                  style={{ width: `${lpColors.length === 0 && i === 0 ? activeSlotWidth : inActiveSlotWidth}px` }}
                >
                  {i === 0 ? addButtonRenderer?.(lpColors) : emptySlotRenderer?.()}
                </li>
              ))}
            </ul>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  )
}

export default LivePalette

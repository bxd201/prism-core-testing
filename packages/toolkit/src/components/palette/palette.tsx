import React, { useState, useEffect, useRef } from 'react'
import { Color } from '../../types'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { without, range } from 'lodash'
import { useContainerSize } from '../../hooks'

export interface PaletteProps {
  initialActiveIndex?: number
  initialColors?: Color[]
  addButtonRenderer?: (color: Color[]) => JSX.Element
  deleteButtonRenderer?: (color: Color, callback?: () => void) => JSX.Element
  detailsButtonRenderer?: (color: Color, callback?: () => void) => JSX.Element
  emptySlotRenderer?: () => JSX.Element
  maxSlots?: number
  onColorActivated?: (color: Color) => void
  onColorsChanged?: (colors: Color[]) => void
  className?: string
}

const Palette = ({
  initialActiveIndex = 0,
  initialColors = [],
  addButtonRenderer,
  deleteButtonRenderer,
  detailsButtonRenderer,
  emptySlotRenderer,
  maxSlots = 8,
  onColorActivated,
  onColorsChanged,
  ...otherProps
}: PaletteProps): JSX.Element => {
  const [colors, setColors] = useState(initialColors ?? [])
  const [activeIndex, setActiveIndex] = useState<number>(initialActiveIndex)

  // callbacks called on state change
  useEffect(() => onColorsChanged?.(colors), [colors])
  useEffect(() => onColorActivated?.(colors[activeIndex]), [activeIndex])

  // re-initialize state when it's initializer prop is changed
  useEffect(() => setColors(initialColors), [initialColors])
  useEffect(() => setActiveIndex(initialActiveIndex), [initialActiveIndex])

  // calculate slot widths from current palette's width
  const ref = useRef<HTMLDivElement>(null)
  const { width } = useContainerSize(ref)

  const inActiveSlotWidth: number = (width * (width < 768 ? 0.92 : 0.75)) / maxSlots
  const activeSlotWidth: number = width < 768 ? inActiveSlotWidth : inActiveSlotWidth * 2.5

  const activeColor = colors[activeIndex] ?? colors[colors.length - 1]
  const textColor = activeColor.isDark ? 'text-white' : 'text-black'

  return (
    <div {...otherProps} ref={ref} className={`w-full h-20 ${otherProps.className ?? ''}`}>
      {colors.length > 0 && maxSlots > 0 && (
        <div
          className='md:hidden flex items-center justify-between flex-1 w-full mb-1 p-1'
          style={{ backgroundColor: activeColor?.hex }}
        >
          <div className={`text-xs ml-1.5 ${textColor}`} style={{ lineHeight: '.9rem' }}>
            <p>{`${activeColor.brandKey} ${activeColor.colorNumber}`}</p>
            <p>{activeColor.name}</p>
          </div>
          <div className='flex mr-2'>{detailsButtonRenderer?.(activeColor)}</div>
        </div>
      )}
      <DragDropContext
        onDragEnd={({ source, destination }) => {
          const items = Array.from(colors)
          const [reorderedItem] = items.splice(source.index, 1)
          if (destination != null) {
            items.splice(destination.index, 0, reorderedItem)
          }
          setColors(items)
          // index of active color may have changed, re-calculate it's index in the new order
          setActiveIndex(items.findIndex(({ id }) => activeColor.id === id))
        }}
      >
        <Droppable droppableId='colorSlots' direction='horizontal'>
          {({ innerRef, droppableProps, placeholder }) => (
            <ul ref={innerRef} className='flex w-full h-1/2 md:h-full' {...droppableProps}>
              {colors.slice(0, Math.min(maxSlots, colors.length)).map((color, i) => {
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
                          aria-label={`Expand option for ${color.name} color`}
                          className='ring-primary focus:outline-none focus-visible:ring-2 relative flex flex-wrap h-full cursor-auto transition-width duration-500 ease-out'
                          onClick={() => setActiveIndex(i)}
                          onKeyDown={(e) => e.keyCode !== 9 && setActiveIndex(i)}
                          style={{
                            backgroundColor: color.hex,
                            boxShadow: isActive && width <= 768 ? `0px -6px ${color.hex}` : '',
                            width: `${isActive ? activeSlotWidth : inActiveSlotWidth}px`
                          }}
                          tabIndex={isActive ? -1 : 0}
                        >
                          {isActive && (
                            <div className='md:m-2 relative w-full overflow-hidden'>
                              <div className={`hidden md:block text-xs leading-4 ${textColor}`}>
                                <p className='whitespace-nowrap'>{`${color.brandKey} ${color.colorNumber}`}</p>
                                <p className='whitespace-nowrap font-bold'>{color.name}</p>
                              </div>
                              <div className='relative md:absolute top-0 md:top-0.5 right-0 md:right-0.5 flex h-full items-center md:items-start justify-center'>
                                <div className='hidden md:flex'>{detailsButtonRenderer?.(color)}</div>
                                {deleteButtonRenderer?.(color, () => setColors(without(colors, color)))}
                              </div>
                            </div>
                          )}
                          <svg
                            aria-label={`Drag color ${color.name}`}
                            className={`hidden md:flex absolute bottom-0 right-0 stroke-current m-0.5 w-5 h-5 ${textColor}`}
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
              {range(Math.max(maxSlots - colors.length, 0)).map((i) => (
                <li
                  aria-label='Empty slot'
                  key={i}
                  className='m-0.5'
                  style={{ width: `${colors.length === 0 && i === 0 ? activeSlotWidth : inActiveSlotWidth}px` }}
                >
                  {i === 0 ? addButtonRenderer?.(colors) : emptySlotRenderer?.()}
                </li>
              ))}
            </ul>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  )
}

export default Palette

import React, { CSSProperties, forwardRef, ForwardedRef, useEffect, useState } from 'react'
import { Color } from '../../types'

export interface ColorSwatchProps {
  active?: boolean
  activeFocus?: boolean
  "aria-label"?: string
  className?: string
  color: Color
  id?: number
  onClick?: () => void
  renderer?: ({ id, ref }: { id?: number, ref?: ForwardedRef<HTMLButtonElement & HTMLDivElement> }) => JSX.Element
  style?: CSSProperties
}

/**
 * Renders swatch.
 *
 * @param {boolean} active - optional swatch active
 * @param {boolean} activeFocus - optional active swatch focus
 * @param {Color} color - swatch background color
 * @param {number} id - optional swatch id
 * @param {() => void} onClick - optional action when swatch is clicked
 * @param {(el) => void} ref - optional swatch element reference
 * @param {({ id, ref }: { id?: number, ref?: ForwardedRef<HTMLElement> }) => JSX.Element} renderer - optional callback function for rendering swatch content
 * @param {HTMLAttributes} otherProps - optional props like `aria-label`, `className`, and `style` for swatch
 * @example
 * ```JSX
 *     <ColorSwatch active style={{ height: 160, width: 160 }} />
 * ```
 */
 const ColorSwatch = forwardRef<HTMLButtonElement & HTMLDivElement, ColorSwatchProps>(
  ({ active, activeFocus = true, className, color, id, onClick, renderer, ...otherProps }, ref): JSX.Element => {
    const [fadeContent, setFadeContent] = useState(false)

    useEffect(() => {
      setFadeContent(active)
    }, [active])

    return (
      <div className='relative' tabIndex={-1} {...otherProps}>
        <button
          className={`absolute h-full w-full ${className}`}
          disabled={active}
          onClick={onClick}
          ref={!active ? ref : null}
          style={{ background: color.hex }}
        />
        {active && (
          <div
            className={
              `absolute h-full w-full p-2.5 ${color.isDark ? 'text-white' : 'text-black'}
              ${fadeContent ? 'opacity-1' : 'opacity-0'} transition-opacity duration-200
              ${className}`
            }
            ref={ref}
            style={activeFocus ? {} : { outline: 'none' }}
            tabIndex={activeFocus ? 0 : -1}
          >
            {renderer?.({ id, ref }) ?? (
              <div className='relative'>
                <p className='text-sm'>{`${color.brandKey} ${color.colorNumber}`}</p>
                <p className='font-bold'>{color.name}</p>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }
)

export default ColorSwatch

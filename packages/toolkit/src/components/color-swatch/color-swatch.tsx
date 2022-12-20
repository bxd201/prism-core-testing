import React, { CSSProperties, ForwardedRef, useEffect, useRef,useState } from 'react'
import { Color } from '../../types'
import ColorSwatchDogear from "./color-swatch-dogear"
import ColorSwatchFrame from "./color-swatch-frame"
import ColorSwatchMessage from "./color-swatch-message"
import ColorSwatchTitle from "./color-swatch-title"

export interface ColorSwatchProps {
  active?: boolean
  activeFocus?: boolean
  'aria-label'?: string
  className?: string
  color: Color
  transparentBg?: boolean
  flagged?: boolean
  id?: number | string
  onClick?: () => void
  renderer?: ({
    id,
    ref
  }: {
    id: number | string
    ref?: ForwardedRef<HTMLButtonElement & HTMLDivElement>
  }) => JSX.Element
  style?: CSSProperties
}

/**
 * Renders swatch.
 *
 * @param {boolean} active - optional swatch active
 * @param {boolean} activeFocus - optional active swatch focus
 * @param {boolean} flagged - is the inactive swatch marked
 * @param {boolean} transparentBg - is background of swatch transparent or visible (default)
 * @param {Color} color - swatch color
 * @param {number | string} id - optional swatch id
 * @param {() => void} onClick - optional action when swatch is clicked
 * @param {(el) => void} ref - optional swatch element reference
 * @param {({ id, ref }: { id?: number, ref?: ForwardedRef<HTMLElement> }) => JSX.Element} renderer - optional callback function for rendering swatch content
 * @param {HTMLAttributes} otherProps - optional props like `aria-label`, `className`, and `style` for swatch
 * @example
 * ```JSX
 *     <ColorSwatch active style={{ height: 160, width: 160 }} />
 * ```
 */

const ColorSwatch = (
  {
    'aria-label': label,
    active,
    activeFocus,
    className = '',
    color,
    flagged = false,
    id,
    onClick,
    renderer,
    style,
    transparentBg
  }: ColorSwatchProps
): JSX.Element => {
  const [fadeContent, setFadeContent] = useState(false)
  const mainBtn = useRef()

  useEffect(() => {
   setFadeContent(active)
  }, [active])

  const buttonLabel = label || color.name

  return (
    <div className='relative' tabIndex={-1} style={style}>
      <button
        className={`absolute h-full w-full ${className}`}
        disabled={active}
        data-testid={`wall-color-swatch-${id}`}
        aria-label={buttonLabel}
        onClick={() => {
          onClick()
        }}
        ref={mainBtn}
        style={{ background: transparentBg ? null : color.hex }}
      >
        {flagged ? (
          <ColorSwatchDogear data-testid={`wall-color-swatch-flag-${id}`} />
        ) : null}
      </button>
      {active && (
        <ColorSwatchFrame
          data-testid={`inner-swatch-${id}`}
          className={`${color.isDark ? 'text-white' : 'text-black'}
            ${fadeContent ? 'opacity-1' : 'opacity-0'} transition-opacity duration-200
            ${className}`}
        >
          {renderer?.({ id }) ?? (
            <ColorSwatchTitle number={`${color.brandKey} ${color.colorNumber}`} name={color.name} />
          )}
        </ColorSwatchFrame>
      )}
    </div>
  )
}

ColorSwatch.Frame = ColorSwatchFrame
ColorSwatch.Dogear = ColorSwatchDogear
ColorSwatch.Message = ColorSwatchMessage
ColorSwatch.Title = ColorSwatchTitle

export default ColorSwatch
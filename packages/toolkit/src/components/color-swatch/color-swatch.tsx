import React from 'react'
import { getLuminosity } from '../../utils/utils'
import { Color } from '../../types'

export interface ColorSwatchProps {
  color: Color
  style?: { zIndex: number; width: number; height: number; left: number; top: number }
  buttonRenderer?: () => JSX.Element
  onClick?: () => void
}

/**
 * Displays info about a color as a stylized swatch.
 *
 * @param {Color} color - color this swatch represents
 * @param {{ zIndex: number, width: number, height: number, left: number, top: number }} style - optional style information used to generate animations in the color wall
 * @param {(Color) => Element<'button' | 'div'>} buttonRenderer - optional function for rendering a cta button at the bottom of a swatch
 * @example
 * ```JSX
 *     <ColorSwatch color={{ brandKey: 'SW', hex: '#123456', colorNumber: 1234, name: 'blue' }} />
 * ```
 */
const ColorSwatch = ({ color, style, buttonRenderer, ...otherProps }: ColorSwatchProps): JSX.Element => (
  <div {...otherProps} role='button' className='relative'>
    <div
      className='absolute w-40 h-40 border-white border-1 transition-transform duration-200 focus:outline-none'
      style={{ ...style, backgroundColor: color.hex }}
      aria-label={`${color.brandKey} ${color.colorNumber} ${color.name}`}
    />
    {((style == null) || style.zIndex === 40) && (
      <section
        className={`${(style != null) ? 'absolute animate-fadeIn' : 'relative'} focus:outline-none z-50 w-40 h-40 p-3 text-left ${
          color.hex.length > 0 && getLuminosity(color.hex) < 200 ? 'text-white' : 'text-black'
        }`}
        style={
          (style != null)
            ? { width: style.width * 2.75, height: style.height * 2.75, left: style.left - 41, top: style.top - 41 }
            : {}
        }
        tabIndex={-1}
      >
        <p className='text-sm opacity-90'>{`${color.brandKey} ${color.colorNumber}`}</p>
        <p className='font-bold'>{color.name}</p>
        <div className='absolute left-0 bottom-0 w-full p-3'>{buttonRenderer?.()}</div>
      </section>
    )}
  </div>
)

export default ColorSwatch

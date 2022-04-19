import React, { useState, useEffect, CSSProperties } from 'react'
import { getLuminosity } from '../../utils/utils'

export interface ToggleProps {
  uncheckedOptionRenderer: () => JSX.Element
  checkedOptionRenderer: () => JSX.Element
  onToggle?: (boolean: boolean) => void
  initialChecked?: boolean
  style?: CSSProperties
  className?: string
}

/**
 * An accessible Toggle.
 *
 * @param {() => JSX.Element} uncheckedOptionRenderer - renderer function for the option selected when toggle is unchecked
 * @param {() => JSX.Element} checkedOptionRenderer - renderer function for the option selected when toggle is checked
 * @param {(boolean) => void} onToggle - optional callback, when defined it will be called every time the toggle gets toggled
 * @param {boolean} initialChecked - optional prop to set the initial state of the toggle
 */
const Toggle = ({
  uncheckedOptionRenderer,
  checkedOptionRenderer,
  onToggle,
  initialChecked = false,
  ...otherProps
}: ToggleProps): JSX.Element => {
  const [checked, setChecked] = useState(initialChecked)
  useEffect(() => setChecked(initialChecked), [initialChecked])

  useEffect(() => onToggle?.(checked), [checked])

  // classNames must be spelled out so that tailwind does not purge them during a production build
  const hex = otherProps?.style?.backgroundColor ?? '#ffffff'
  const backgroundColorSet: boolean = hex !== '#ffffff'
  const contrastingColor = getLuminosity(hex) < 200 ? 'white' : 'black'
  const contrastingBorder = getLuminosity(hex) < 200 ? 'border-white' : 'border-black'
  const contrastingBackground = getLuminosity(hex) < 200 ? 'bg-white' : 'bg-black'
  const contrastingText = getLuminosity(hex) < 200 ? 'text-white' : 'text-black'

  return (
    <div
      {...otherProps}
      className={`flex justify-between py-1.5 px-4 rounded-lg w-48 ${backgroundColorSet ? '' : 'border border-black'} ${
        otherProps?.className ?? ''
      }`}
    >
      <label htmlFor='variant-toggle' className={`${contrastingText}`}>
        {uncheckedOptionRenderer()}
      </label>
      <button
        id='variant-toggle'
        className={`relative flex items-center w-12 h-7 rounded-full m-auto border ${contrastingBorder} ${
          checked ? 'bg-transparent' : contrastingBackground
        }`}
        role='switch'
        aria-checked={checked}
        onClick={() => setChecked(!checked)}
      >
        <div
          className='absolute h-6 w-6 left-0.5 rounded-full transition-transform'
          style={{
            transform: checked && 'translateX(calc(100% - 0.25rem))',
            backgroundColor: checked ? contrastingColor : hex
          }}
        />
      </button>
      <label htmlFor='variant-toggle' className={`${contrastingText}`}>
        {checkedOptionRenderer()}
      </label>
    </div>
  )
}

export default Toggle

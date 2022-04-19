import React, { useState, useEffect } from 'react'
import { Button, Wrapper, Menu, MenuItem } from 'react-aria-menubutton'
import { getLuminosity } from '../../utils/utils'
import { IconDefinition } from '@fortawesome/pro-regular-svg-icons';

export interface VariantSwitcherOption {
  text: string
  icon: IconDefinition
}

export interface VariantSwitcherProps {
  options: VariantSwitcherOption[]
  optionRenderer: (option: VariantSwitcherOption) => JSX.Element
  initialOption?: number
  style?: { backgroundColor: string }
  className?: string
}

/**
 * An accessible and customizable Select.
 *
 * @param {T[]} options - an array of options data, each item is passed to the optionRenderer for it to create an option Element
 * @param {(T) => JSX.Element} optionRenderer - takes an option from the options array and renders a react Element to represent it
 * @param {number} initialOption - optional prop for setting an option other than the first one as the selected option on render
 */
const VariantSwitcher = ({
  options,
  optionRenderer,
  initialOption = 0,
  ...otherProps
}: VariantSwitcherProps): JSX.Element | null => {
  const [selectedOption, setSelectedOption] = useState(initialOption)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    setSelectedOption(initialOption)
  }, [initialOption])

  const hex = otherProps?.style?.backgroundColor ?? '#ffffff'
  const backgroundColorSet: boolean = hex !== '#ffffff'
  const contrastingColor = getLuminosity(hex) < 200 ? 'white' : 'black'
  const contrastingText = getLuminosity(hex) < 200 ? 'text-white' : 'text-black'

  if (options.length < 2) {
    return null
  }

  return (
    <Wrapper
      {...otherProps}
      className={`flex rounded-lg w-48 relative ${otherProps?.className ?? ''}`}
      onSelection={setSelectedOption}
      onMenuToggle={({ isOpen }) => setIsMenuOpen(isOpen)}
      closeOnSelection={false}
    >
      <Button
        className={`w-full rounded-lg flex ${backgroundColorSet ? '' : 'border border-black'} ${contrastingText}`}
      >
        {optionRenderer(options[selectedOption])}
        <span
          className={`absolute inset-y-0 right-0 flex items-center text-lg transform scale-x-150 scale-y-75 mr-5 ${
            isMenuOpen ? 'rotate-180' : ''
          } transition-transform`}
        >
          ^
        </span>
      </Button>
      <Menu
        className={`absolute my-11 w-full rounded-lg ${backgroundColorSet ? '' : 'border border-black'}`}
        style={{ backgroundColor: hex }}
      >
        <ul>
          {options.map((option, i) => (
            <li key={i}>
              <MenuItem className={`flex hover:opacity-50 cursor-pointer ${contrastingText}`} value={i}>
                {optionRenderer(option)}
                {selectedOption === i && (
                  <svg className='absolute right-0 m-3' width='12pt' viewBox='0 0 30 30'>
                    <path
                      fill={contrastingColor}
                      d='M24,4H6C4.895,4,4,4.895,4,6v18c0,1.105,0.895,2,2,2h18c1.105,0,2-0.895,2-2V6C26,4.895,25.104,4,24,4z M21.707,11.707l-7.56,7.56c-0.188,0.188-0.442,0.293-0.707,0.293s-0.52-0.105-0.707-0.293l-3.453-3.453c-0.391-0.391-0.391-1.023,0-1.414s1.023-0.391,1.414,0l2.746,2.746l6.853-6.853c0.391-0.391,1.023-0.391,1.414,0S22.098,11.316,21.707,11.707z'
                    />
                  </svg>
                )}
              </MenuItem>
            </li>
          ))}
        </ul>
      </Menu>
    </Wrapper>
  )
}

export default VariantSwitcher

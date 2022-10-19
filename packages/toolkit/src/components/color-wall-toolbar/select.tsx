import React from 'react'
import { Button, Menu, MenuItem, Wrapper } from 'react-aria-menubutton'
import { faAngleDown } from '@fortawesome/pro-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { omitPrefix } from '../../utils/tool-bar-utils'

interface ISelectProps {
  activeFamily?: string
  activeSection?: string
  disabled?: boolean
  options: Array<{
    label: string
  }>
  onSelectOpened?: (arg0: boolean) => void
  placeholderText: string
  onSelect: (label) => void
  uiStyle?: 'minimal' | null
}

const Select = ({
  activeFamily,
  activeSection,
  placeholderText,
  options,
  disabled = false,
  onSelectOpened,
  onSelect,
  uiStyle
}: ISelectProps): JSX.Element => (
  <Wrapper
    className={'flex cursor-default h-auto relative max-w-full m-0 sm:max-w-none'}
    onMenuToggle={({ isOpen }) => onSelectOpened?.(isOpen)}
  >
    <Button
      className={
        'flex cursor-pointer h-auto relative px-[0.8em] items-center justify-center w-[13.9em] text-tb normal-case font-semibold normal-case bg-buttonBgColor color-buttonColor disabled:opacity-20 tb:justify-center aria-disabled:opacity-20'
      }
      disabled={disabled}
      data-testid={`btn-${placeholderText}`}
    >
      <span
        className={`h-auto  normal-case font-semibold aria-disabled:opacity-20 ${
          uiStyle === 'minimal' ? 'text-tb' : 'text-[0.6875em]'
        }`}
      >
        {omitPrefix(placeholderText)}
      </span>
      <FontAwesomeIcon className='!w-[10px] text-base' icon={faAngleDown} pull='right' />
    </Button>
    <Menu
      className={`w-full h-auto z-[1002] top-12 mt-0.5 absolute shadow-[0_2px_5px_-1px_rgba(black,0.65)] shadow-black xs:top-11 xs:left-0`}
    >
      <>
        {options.map(
          ({ label }): JSX.Element => (
            <MenuItem
              className={`h-auto opacity-95 justify-start tb:justify-center active:opacity-100 active:bg-buttonActiveBgColor active:text-buttonActiveColor`}
              key={label}
              text={omitPrefix(label)}
              value={label}
            >
              <button
                className={`inline-block text-[0.6875em] font-semibold leading-normal h-auto w-full p-2 no-underline uppercase text-left bg-white hover:bg-buttonHoverBgColor hover:text-buttonHoverColor ${
                  ((activeSection ?? activeFamily) || 'All') === label
                    ? 'h-auto text-buttonActiveColor bg-buttonActiveBgColor'
                    : ''
                }`}
                onClick={() => {
                  onSelect(label)
                }}
                data-testid={`item-${label}`}
              >
                <span>{omitPrefix(label)}</span>
              </button>
            </MenuItem>
          )
        )}
      </>
    </Menu>
  </Wrapper>
)

export default Select

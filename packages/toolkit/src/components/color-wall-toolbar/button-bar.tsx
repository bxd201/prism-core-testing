import React from 'react'

interface BarProps {
  children: any
  style?: {
    borderRadius?: string
  }
}

function Bar(props: BarProps): JSX.Element {
  return (
    <div
      className={'border-[1px] border-buttonBorderColor rounded max-w-full overflow-hidden h-[44px] xs:h-[38px]'}
      style={props.style}
    >
      <ul className={'flex content-center justify-center m-0 p-0 list-none flex-auto '}>{props.children}</ul>
    </div>
  )
}

interface ButtonProps {
  onClick?: (...args: any[]) => any
  activeClassName?: string
  className?: string
  children: any
  disabled?: boolean
  style?: any
  isActive?: boolean
}

function Button(props: ButtonProps): JSX.Element {
  const { onClick, className, activeClassName, disabled, isActive, ...other } = props
  return (
    <li
      className={
        'flex content-center justify-center m-0 p-0 flex-auto list-none border-l-solid border-l border-l-buttonBorderColor first:border-l-0'
      }
    >
      {
        <button
          type='button'
          className={`${
            isActive ? 'bg-buttonActiveBgColor text-buttonActiveColor ' : 'bg-buttonBgColor '
          }flex flex-row content-between justify-center items-center py-1 px-3 m-0 min-h-[36px] rounded-none text-tb text-center font-semibold uppercase no-underline  md:text-sm xs:text-xs active:bg-buttonActiveBgColor active:text-buttonActiveColor aria-disabled:opacity-20 disabled:opacity-20`}
          onClick={onClick}
          disabled={disabled}
          aria-disabled={disabled}
          {...other}
        >
          {props.children}
        </button>
      }
    </li>
  )
}

export default Object.freeze({
  Bar: Bar,
  Button: Button
})

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
      className={'border-[1px] border-buttonBorderColor rounded max-w-full overflow-auto h-[44px] xs:h-[38px]'}
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
  isActive?: (match: { url: string }, location: { pathname: string }) => boolean
}

function Button(props: ButtonProps): JSX.Element {
  const { onClick, className, activeClassName, disabled, ...other } = props
  return (
    <li className={'flex content-center justify-center m-0 p-0 flex-auto'}>
      {!disabled && (
        <button
          type='button'
          className={
            'flex flex-row content-between justify-center items-center py-1 px-3 m-0 min-h-[36px] rounded-none text-tb text-center font-semibold uppercase no-underline bg-buttonBgColor md:text-base xs:text-sm'
          }
          onClick={onClick}
          disabled={disabled}
          {...other}
        >
          {props.children}
        </button>
      )}
    </li>
  )
}

export default Object.freeze({
  Bar: Bar,
  Button: Button
})

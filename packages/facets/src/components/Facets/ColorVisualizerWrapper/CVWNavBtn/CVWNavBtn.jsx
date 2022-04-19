// @flow
import React, { forwardRef } from 'react'
import noop from 'lodash/noop'
import './CVWNavBtn.scss'

type CVWNavBtnT = {
  onClick?: Function,
  iconRenderer?: any => any,
  textRenderer?: any => any,
  active: boolean,
  className?: string
}

export const CVWNavBtn = forwardRef<CVWNavBtnT, HTMLElement>(function CVWNavBtn (props: CVWNavBtnT, ref) {
  const { onClick, iconRenderer = noop, textRenderer = noop, className = '', active } = props

  return (
    <button ref={ref}
      className={`CVWNavBtn ${active ? 'CVWNavBtn--active' : ''} ${className}`}
      onClick={onClick}>
      {iconRenderer({ className: 'CVWNavBtn__icon' })}
      {textRenderer()}
    </button>
  )
})

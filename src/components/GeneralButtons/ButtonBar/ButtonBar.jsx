// @flow
import React from 'react'
import { NavLink } from 'react-router-dom'

import './ButtonBar.scss'

export const CLASS_NAMES = {
  OPTION_CONTAINER: 'button-bar__option-container auto-scroll',
  OPTIONS: 'button-bar__options no-list',
  OPTION: 'button-bar__options__option',
  OPTION_BUTTON: 'button-bar__options__option__btn',
  OPTION_BUTTON_ACTIVE: 'button-bar__options__option__btn--active'
}

type BarProps = {
  children: any
}

function Bar (props: BarProps) {
  return (
    <div className={CLASS_NAMES.OPTION_CONTAINER}>
      <ul className={CLASS_NAMES.OPTIONS}>
        {props.children}
      </ul>
    </div>
  )
}

type ButtonProps = {
  to?: string | {
    pathname?: string,
    search?: string,
    hash?: string,
    state?: Object
  },
  onClick?: Function,
  activeClassName?: string,
  className?: string,
  children: any
}

function Button (props: ButtonProps) {
  const { onClick, to, className, activeClassName, ...other } = props

  const _className = `${CLASS_NAMES.OPTION_BUTTON} ${className || ''}`
  const _activeClassName = `${CLASS_NAMES.OPTION_BUTTON_ACTIVE} ${activeClassName || ''}`
  return (
    <li className={CLASS_NAMES.OPTION}>
      {
        props.to ? (
          <NavLink exact className={_className} activeClassName={_activeClassName} to={props.to} onClick={onClick || null} {...other}>
            {props.children}
          </NavLink>
        ) : (
          <button type='button' className={_className} onClick={onClick} {...other}>
            {props.children}
          </button>
        )
      }
    </li>
  )
}

export default Object.freeze({
  Bar: Bar,
  Button: Button
})

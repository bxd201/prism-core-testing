// @flow
import React from 'react'
import { Link } from 'react-router-dom'

import './TextButton.scss'

export const BASE_CLASS = 'text-button'

type ButtonProps = {
  to?: Function,
  onClick?: Function,
  className?: string,
  children: any
}

function TextButton (props: ButtonProps) {
  const { onClick, to, className, ...other } = props

  const _className = `${BASE_CLASS} ${className || ''}`

  return (
    props.to
      ? (
      <Link className={_className} to={props.to} onClick={onClick || null} {...other}>
        {props.children}
      </Link>
        )
      : onClick
        ? (
      <button type='button' className={_className} onClick={onClick} {...other}>
        {props.children}
      </button>
          )
        : (
      <div className={_className} {...other}>
        {props.children}
      </div>
          )
  )
}

export default React.memo<ButtonProps>(TextButton)

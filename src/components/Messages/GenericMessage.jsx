// @flow
import React from 'react'

import './GenericMessage.scss'

type Props = {
  children: any,
  type: string,
  className?: string
}

const types = {
  ERROR: 'ERROR',
  WARNING: 'WARNING',
  NORMAL: 'NORMAL'
}

const outerClasses = {
  [types.NORMAL]: 'generic-message',
  [types.WARNING]: 'generic-message generic-message--warning',
  [types.ERROR]: 'generic-message generic-message--error'
}

const innerClasses = {
  [types.NORMAL]: 'generic-message__inner',
  [types.WARNING]: 'generic-message__inner generic-message__inner--warning',
  [types.ERROR]: 'generic-message__inner generic-message__inner--error'
}

const GenericMessage = (props: Props) => {
  const { className, children, type, ...other } = props

  return (
    <div className={`${outerClasses[type]} ${typeof className === 'string' ? className : ''}`} {...other}>
      <div className={innerClasses[type]}>
        {children}
      </div>
    </div>
  )
}

GenericMessage.defaultProps = {
  type: types.NORMAL
}

GenericMessage.TYPES = types

export default GenericMessage

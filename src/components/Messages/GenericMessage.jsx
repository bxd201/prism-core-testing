// @flow
import React, { Children } from 'react'

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

const baseClass = 'generic-message'

const outerClasses = {
  [types.NORMAL]: `${baseClass}`,
  [types.WARNING]: `${baseClass} generic-message--warning`,
  [types.ERROR]: `${baseClass} generic-message--error`
}

const innerClasses = {
  [types.NORMAL]: `${baseClass}__inner`,
  [types.WARNING]: `${baseClass}__inner ${baseClass}__inner--warning`,
  [types.ERROR]: `${baseClass}__inner ${baseClass}__inner--error`
}

const lineClasses = {
  BASE: `${baseClass}__line`,
  FIRST_LINE: `${baseClass}__line--headline`
}

const GenericMessage = (props: Props) => {
  const { className, children, type, ...other } = props
  const multiChildren = Children.toArray(children).length > 1
  const mainClasses = `${outerClasses[type]} ${typeof className === 'string' ? className : ''} ${multiChildren ? `${baseClass}--multi-line` : ''}`

  return (
    <div className={mainClasses} {...other}>
      <div className={innerClasses[type]}>
        {Children.toArray(children).map((child, i) => (
          <div key={i} className={`${lineClasses.BASE} ${i === 0 ? lineClasses.FIRST_LINE : ''}`}>{child}</div>
        ))}
      </div>
    </div>
  )
}

GenericMessage.defaultProps = {
  type: types.NORMAL
}

GenericMessage.TYPES = types

export default GenericMessage

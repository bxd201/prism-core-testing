// @flow
import React, { Children } from 'react'
import './GenericMessage.scss'

type Props = {
  children: any,
  type: string,
  className?: string,
  fillParent?: boolean
}

const types = {
  ERROR: 'ERROR',
  WARNING: 'WARNING',
  NORMAL: 'NORMAL',
  SUCCESS: 'SUCCESS'
}

const baseClass = 'generic-message'

const outerClasses = {
  [types.NORMAL]: `${baseClass}`,
  [types.WARNING]: `${baseClass} generic-message--warning`,
  [types.ERROR]: `${baseClass} generic-message--error`,
  [types.SUCCESS]: `${baseClass} generic-message--success`
}

const innerClasses = {
  [types.NORMAL]: `${baseClass}__inner`,
  [types.WARNING]: `${baseClass}__inner ${baseClass}__inner--warning`,
  [types.ERROR]: `${baseClass}__inner ${baseClass}__inner--error`,
  [types.SUCCESS]: `${baseClass}__inner ${baseClass}__inner--success`
}

const lineClasses = {
  BASE: `${baseClass}__line`,
  FIRST_LINE: `${baseClass}__line--headline`
}

const GenericMessage = (props: Props) => {
  const { className, children, type, fillParent, ...other } = props
  const multiChildren = Children.toArray(children).length > 1
  let mainClasses = `${outerClasses[type]} ${typeof className === 'string' ? className : ''} ${multiChildren ? `${baseClass}--multi-line` : ''}`.trim()

  if (fillParent) {
    mainClasses += '--fill-parent'
  }

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

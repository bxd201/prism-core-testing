import React from 'react'

export enum MessageTypes {
  ERROR = 'ERROR',
  WARNING = 'WARNING',
  NORMAL = 'NORMAL',
  SUCCESS = 'SUCCESS'
}

export interface GenericMessageProps {
  children: React.ReactNode
  type?: MessageTypes
  className?: string
  fillParent?: boolean
  center?: boolean
}

const GenericMessage = (props: GenericMessageProps): JSX.Element => {
  const { className, children, type = MessageTypes.NORMAL, fillParent, center = false } = props

  const mainClasses = `p-4 ${center ? 'text-center' : 'text-left'} ${fillParent ? 'w-full' : 'w-fit'}`

  const containerClasses = {
    [MessageTypes.NORMAL]: `bg-white`,
    [MessageTypes.WARNING]: `bg-warning`,
    [MessageTypes.ERROR]: `bg-error`,
    [MessageTypes.SUCCESS]: `bg-success`
  }

  const constructChildren = (children: React.ReactNode): React.ReactNode => {
    // if children is a string, wrap in a paragraph and style with default styles
    if (typeof children === 'string') {
      return <p className='text-base font-bold'>{children}</p>
    }
    // if children is more complex, just return children
    return children
  }

  return (
    <div className={`${mainClasses} ${className}`}>
      <div className={`p-4 ${containerClasses[type]} rounded`}>{constructChildren(children)}</div>
    </div>
  )
}

export default GenericMessage

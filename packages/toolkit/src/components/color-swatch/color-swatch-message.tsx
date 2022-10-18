import React from 'react'

export interface ColorSwatchMessageProps extends React.HTMLAttributes<HTMLDivElement> {
  children: JSX.Element | string | number
}

const ColorSwatchMessage = (props: ColorSwatchMessageProps): JSX.Element => {
  const {children, className = '', ...passThruDivProps} = props

  const combinedClassName = `${className} bg-white text-black text-xxs-tight med:text-xs-tight rounded-sm p-1 font-semibold`

  return <div
    tabIndex={0}
    className={combinedClassName}
    {...passThruDivProps}
  >
    {children}
  </div>
}

export default ColorSwatchMessage
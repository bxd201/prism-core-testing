import React from 'react'

export interface FrameProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: JSX.Element
  className?: string
}
const ColorSwatchFrame = (props: FrameProps): JSX.Element => {
  const { children, className = '', ...passThruDivProps } = props
  return <div
    {...passThruDivProps}
    className={`absolute h-full w-full p-2.5 t-0 l-0 flex flex-col ${className}`}
  >{children ?? null}</div>
}

export default ColorSwatchFrame
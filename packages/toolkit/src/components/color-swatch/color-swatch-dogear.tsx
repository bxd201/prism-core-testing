import React from 'react'

export interface FlagProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

const ColorSwatchDogear = (props: FlagProps): JSX.Element => {
  const {className = '', ...passThruDivProps} = props
  return <div
    {...passThruDivProps}
    className={
      `${className} pointer-events-none border-3 border-white border-solid border-r-transparent border-b-transparent w-0 h-0 absolute top-0 left-0`
    }
  />
}

export default ColorSwatchDogear
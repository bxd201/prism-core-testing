import React from 'react'

export interface ColorSwatchTitleProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string
  number: string | number
}

const ColorSwatchTitle = (props: ColorSwatchTitleProps): JSX.Element => {
  const {name, number, className = '', ...passThruDivProps} = props

  const combinedClassName = `${className} relative flex flex-col select-none text-current`

  return <div className={combinedClassName} {...passThruDivProps}>
    <p className='font-bold text-sm-tight sm:text-base-tight mb-1 text-current'>{name}</p>
    <p className='order-first text-xs-tight sm:text-sm-tight mb-1 text-current'>{number}</p>
  </div>
}

export default ColorSwatchTitle
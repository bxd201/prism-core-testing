import React from 'react'

export interface ColorsIconProps {
  className?: string
  hexes: string[]
}
const ColorsIcon = ({ className = '', hexes, ...otherProps }: ColorsIconProps): JSX.Element => (
  <div
    {...otherProps}
    className={
      `flex flex-col items-center justify-center border border-solid ${
        hexes.length > 0 ? 'border-black' : 'border-transparent'
      } ` + className
    }
  >
    {hexes.map((hex, i) => (
      <span
        key={i}
        className={`flex-1 w-full ${i === 0 ? '' : 'border-t'} border-solid border-black`}
        style={{ backgroundColor: hex }}
      />
    ))}
  </div>
)

export default ColorsIcon

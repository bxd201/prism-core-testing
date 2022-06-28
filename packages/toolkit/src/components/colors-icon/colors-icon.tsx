import React, { CSSProperties, ReactNode } from 'react'

export interface ColorsIconProps {
  "aria-label"?: string
  className?: string
  hexes: string[]
  infoIcon?: ReactNode
  style?: CSSProperties
}

const ColorsIcon = ({ className = '', hexes, infoIcon = 'i', ...otherProps }: ColorsIconProps): JSX.Element => (
  <div
    {...otherProps}
    className={
      `flex flex-col items-center justify-center border border-solid ${
        hexes.length > 0 ? 'border-black' : 'border-transparent'
      } ` + className
    }
  >
    {hexes.length > 0
      ? hexes.map((hex, i) => (
        <span
          key={i}
          className={`flex-1 w-full ${i === 0 ? '' : 'border-t'} border-solid border-black`}
          style={{ backgroundColor: hex }}
        />
      ))
      : infoIcon
    }
  </div>
)

export default ColorsIcon

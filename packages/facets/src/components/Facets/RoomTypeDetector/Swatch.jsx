// @flow
import React from 'react'
import { isReadable } from '@ctrl/tinycolor'

import './Swatch.scss'

type SwatchProps = {
  color: string,
  onClick?: Function,
  name: string
}

const Swatch = ({ color, onClick, name }: SwatchProps) => {
  const className = `Swatch ${isReadable(color, 'white') ? 'Swatch--light-text' : ''}`

  // if onClick present...
  if (onClick) {
    // ... return an interactive element
    return (
      <button className={className}
        style={{ background: color }}
        onClick={onClick}>
        {name}
      </button>
    )
  }

  return (
    <div className={className}
      style={{ background: color }}>
      {name}
    </div>
  )
}

export default Swatch

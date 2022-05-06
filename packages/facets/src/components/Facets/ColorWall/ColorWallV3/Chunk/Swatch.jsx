import React, { forwardRef } from 'react'
import noop from 'lodash/noop'
import './Swatch.scss'

function Swatch ({ width, height, id, active = false, renderer = noop, perimeterLevel = 0 }, ref) { // eslint-disable-line
  return <div style={{ width, height }} className={`cwv3__swatch ${active ? 'cwv3__swatch--active' : ''}`}>
    {renderer({ id, ref, active, perimeterLevel })}
  </div>
}

export default forwardRef(Swatch)

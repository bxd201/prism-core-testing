import React, { forwardRef } from 'react'
import noop from 'lodash/noop'
import './Swatch.scss'

function Swatch ({ width, height, id, active = false, renderer = noop }, ref) { // eslint-disable-line
  return <div style={{ width, height }} className={`cwv3__swatch ${active ? 'cwv3__swatch--active' : ''}`}>
    {renderer({ id, ref, active })}
  </div>
}

export default forwardRef(Swatch)

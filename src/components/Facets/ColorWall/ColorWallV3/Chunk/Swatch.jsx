import React, { forwardRef } from 'react'
import noop from 'lodash/noop'
import './Swatch.scss'

function Swatch ({ width, height, id, active = false, onClick = noop, activeRenderer = noop, inactiveRenderer = noop }, ref) { // eslint-disable-line
  return <div style={{ width, height }} className={`cwv3__swatch ${active ? 'cwv3__swatch--active' : ''}`}>
    {active ? activeRenderer({ id, ref }) : inactiveRenderer({ id, ref, onClick })}
  </div>
}

export default forwardRef(Swatch)

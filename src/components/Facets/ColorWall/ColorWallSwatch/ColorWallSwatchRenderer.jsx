// @flow
import React from 'react'

import { CLASS_NAMES } from './shared'

import './ColorWallSwatch.scss'

type Props = {
  color: string,
  disabled?: boolean,
  focus?: boolean
}

const ColorWallSwatchRenderer = ({ color, disabled, focus }: Props) => {
  return (
    <div className={CLASS_NAMES.SWATCH}
      role='presentation'>
      <div
        className={`${CLASS_NAMES.BASE} ${CLASS_NAMES.BASE_DISABLED} ${focus ? CLASS_NAMES.BASE_FOCUS : ''}`}
        style={{ background: color }}>
        {disabled ? <div className={CLASS_NAMES.FLAG} /> : null}
      </div>
    </div>
  )
}

export default ColorWallSwatchRenderer

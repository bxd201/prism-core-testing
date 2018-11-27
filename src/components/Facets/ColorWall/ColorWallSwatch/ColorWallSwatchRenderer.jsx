// @flow
import React from 'react'

import { CLASS_NAMES } from './shared'

import './ColorWallSwatch.scss'

type Props = {
  color: string
}

export default function ColorWallSwatchRenderer (props: Props) {
  const { color, ...other } = props

  return (
    <div className={CLASS_NAMES.SWATCH} {...other}>
      <div className={CLASS_NAMES.BASE} style={{ background: color }} />
    </div>
  )
}

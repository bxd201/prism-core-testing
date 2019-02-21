// @flow
import React from 'react'

import { CLASS_NAMES } from './shared'

import './ColorWallSwatch.scss'

type Props = {
  color: string,
  focus?: boolean
}

export default function ColorWallSwatchRenderer ({ color, focus }: Props) {
  return (
    <div className={CLASS_NAMES.SWATCH}
      role='presentation'>
      <div
        className={`${CLASS_NAMES.BASE} ${focus ? CLASS_NAMES.BASE_FOCUS : ''}`}
        style={{ background: color }} />
    </div>
  )
}

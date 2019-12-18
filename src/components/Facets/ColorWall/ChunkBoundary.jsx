// @flow
import React from 'react'

import { type GridBounds } from './ColorWall.flow'

import './ChunkBoundary.scss'

const CLASSES = {
  BASE: 'chunk-boundary',
  T: 'chunk-boundary--t',
  B: 'chunk-boundary--b',
  L: 'chunk-boundary--l',
  R: 'chunk-boundary--r'
}

type Props = {
  render: boolean,
  bounds: GridBounds,
  x: number,
  y: number
}

function ChunkBoundary ({ render, bounds, x, y }: Props) {
  if (render && bounds) {
    if (bounds.TL[0] <= x &&
      bounds.TL[1] <= y &&
      bounds.BR[0] >= x &&
      bounds.BR[1] >= y) {
      return (
        <React.Fragment>
          {(x === bounds.TL[0]) ? (
            <div className={`${CLASSES.BASE} ${CLASSES.L}`} />
          ) : null}
          {(x === bounds.BR[0]) ? (
            <div className={`${CLASSES.BASE} ${CLASSES.R}`} />
          ) : null}
          {(y === bounds.TL[1]) ? (
            <div className={`${CLASSES.BASE} ${CLASSES.T}`} />
          ) : null}
          {(y === bounds.BR[1]) ? (
            <div className={`${CLASSES.BASE} ${CLASSES.B}`} />
          ) : null}
        </React.Fragment>
      )
    }
  }

  return null
}

export default React.memo<Props>(ChunkBoundary)

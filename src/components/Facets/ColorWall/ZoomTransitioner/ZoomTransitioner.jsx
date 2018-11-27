// @flow
import React, { PureComponent } from 'react'

import './ZoomTransitioner.scss'

export type ZoomPositionerProps = {
  width: number,
  height: number,
  scale: number,
  translateX: number,
  translateY: number
}

export const TransitionModes = {
  ZOOM_IN: 'ZOOM_IN'
}

const CLASS_NAMES = {
  BASE: 'zoom-transitioner',
  BASE_ZOOM_IN: 'zoom-transitioner--zoom-in'
}

type Props = {
  mode: string,
  position?: ZoomPositionerProps
}

class ZoomTransitioner extends PureComponent<Props> {
  render () {
    const { position, mode } = this.props
    let style = {}

    if (position) {
      style = {
        width: `${position.width}px`,
        height: `${position.height}px`,
        WebkitTransform: `scale(${position.scale}) translateX(${position.translateX}px) translateY(${position.translateY}px)`,
        transform: `scale(${position.scale}) translateX(${position.translateX}px) translateY(${position.translateY}px)`
      }
    }

    return (
      <div
        className={`${CLASS_NAMES.BASE} ${mode === TransitionModes.ZOOM_IN ? CLASS_NAMES.BASE_ZOOM_IN : ''}`}
        style={style}
      />
    )
  }
}

export default ZoomTransitioner

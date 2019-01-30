// @flow
import React, { PureComponent } from 'react'
import CircleLoader from '../Loaders/CircleLoader/CircleLoader'

type Props = {
  type: 'LOADING' | 'ERROR' | 'MESSAGE',
  message?: string,
  color: string
}

class TintableSceneOverlay extends PureComponent<Props> {
  static TYPES = {
    LOADING: 'LOADING',
    ERROR: 'ERROR',
    MESSAGE: 'MESSAGE'
  }

  static CLASS_NAMES = {
    [TintableSceneOverlay.TYPES.MESSAGE]: {
      BASE: 'prism-scene-manager__scene__overlay prism-scene-manager__scene__overlay--message',
      CONTENT: 'prism-scene-manager__scene__overlay__content'
    },
    [TintableSceneOverlay.TYPES.LOADING]: {
      BASE: 'prism-scene-manager__scene__overlay prism-scene-manager__scene__overlay--loading',
      CONTENT: 'prism-scene-manager__scene__overlay__content'
    },
    [TintableSceneOverlay.TYPES.ERROR]: {
      BASE: 'prism-scene-manager__scene__overlay prism-scene-manager__scene__overlay--error',
      CONTENT: 'prism-scene-manager__scene__overlay__content'
    }
  }

  render () {
    const { type, message } = this.props
    let { color } = this.props

    return (
      <div className={TintableSceneOverlay.CLASS_NAMES[type].BASE}>
        <span className={TintableSceneOverlay.CLASS_NAMES[type].CONTENT}>
          {(type === TintableSceneOverlay.TYPES.LOADING) && (
            <CircleLoader color={color} />
          )}
          {!!message && message}
        </span>
      </div>
    )
  }
}

export default TintableSceneOverlay

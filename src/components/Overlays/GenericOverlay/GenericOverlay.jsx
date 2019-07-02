// @flow
import React, { PureComponent } from 'react'
import CircleLoader from '../../Loaders/CircleLoader/CircleLoader'

import './GenericOverlay.scss'

type Props = {
  type: 'LOADING' | 'ERROR' | 'MESSAGE',
  message?: string,
  loaderColor?: string,
  semitransparent?: boolean
}

class GenericOverlay extends PureComponent<Props> {
  static TYPES = {
    LOADING: 'LOADING',
    ERROR: 'ERROR',
    MESSAGE: 'MESSAGE'
  }

  static CLASS_NAMES = {
    [GenericOverlay.TYPES.MESSAGE]: {
      BASE: 'prism-generic-overlay prism-generic-overlay--message',
      CONTENT: 'prism-generic-overlay__content'
    },
    [GenericOverlay.TYPES.LOADING]: {
      BASE: 'prism-generic-overlay prism-generic-overlay--loading',
      CONTENT: 'prism-generic-overlay__content'
    },
    [GenericOverlay.TYPES.ERROR]: {
      BASE: 'prism-generic-overlay prism-generic-overlay--error',
      CONTENT: 'prism-generic-overlay__content'
    }
  }

  render () {
    const { type, message, semitransparent } = this.props
    let { loaderColor } = this.props

    return (
      <div className={`${GenericOverlay.CLASS_NAMES[type].BASE} ${semitransparent ? 'prism-generic-overlay--semitrans' : ''}`}>
        {(type === GenericOverlay.TYPES.LOADING) && (
          <span className={GenericOverlay.CLASS_NAMES[type].CONTENT}>
            <CircleLoader color={loaderColor} />
          </span>
        )}
        {message && (
          <span className={GenericOverlay.CLASS_NAMES[type].CONTENT}>
            {message}
          </span>
        )}
      </div>
    )
  }
}

export default GenericOverlay

// @flow
import React, { PureComponent } from 'react'
import CircleLoader from '../../Loaders/CircleLoader/CircleLoader'

import './GenericOverlay.scss'

type Props = {
  children: any,
  type: 'LOADING' | 'ERROR' | 'MESSAGE',
  message?: string,
  loaderColor?: string,
  fillVertical?: boolean,
  fillHorizontal?: boolean,
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

  static defaultProps = {
    fillHorizontal: true,
    fillVertical: true
  }

  render () {
    const { type, message, semitransparent, children, loaderColor, fillHorizontal, fillVertical } = this.props
    // children take precedence over any message prop
    const output = children || message || null
    const className = `
      ${GenericOverlay.CLASS_NAMES[type].BASE}
      ${semitransparent ? 'prism-generic-overlay--semitrans' : ''}
      ${!fillHorizontal ? 'prism-generic-overlay--collapse-h' : ''}
      ${!fillVertical ? 'prism-generic-overlay--collapse-v' : ''}
    `

    return (
      <div className={className}>
        {(type === GenericOverlay.TYPES.LOADING) && (
          <span className={GenericOverlay.CLASS_NAMES[type].CONTENT}>
            <CircleLoader color={loaderColor} />
          </span>
        )}
        {output && (
          <span className={GenericOverlay.CLASS_NAMES[type].CONTENT}>
            {output}
          </span>
        )}
      </div>
    )
  }
}

export default GenericOverlay

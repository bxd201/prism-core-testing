import React, { PureComponent, Fragment } from 'react'
import { PropTypes } from 'prop-types'

class ColorsFromImagePin extends PureComponent {
  state = {}

  constructor (props) {
    super(props)

    this.onClickMethod = this.props.onClickMethod

    if (this.props.pinType && this.props.pinType === 'preview') {
      this.isPreviewPin = true
      this.additionalPinClass = 'pin--preview__wrapper'
    } else {
      this.isPreviewPin = false
      this.additionalPinClass = ''
    }
  }

  render () {
    let isActiveClass = ''

    // eslint-disable-next-line one-var
    const { previewColorName, previewColorNumber, transformValue, RGBstring } = this.props

    if (this.isPreviewPin) {
      if (this.props.isActiveFlag) isActiveClass = 'pin--active__wrapper'
    } else {
      if (this.props.activePinIndex === this.key) isActiveClass = 'pin--active__wrapper'
    }

    return (
      <Fragment>
        <button onClick={this.onClickMethod} style={{ transform: transformValue }} className={this.additionalPinClass + ' pin__wrapper ' + isActiveClass}>
          <span className='pin__chip' style={{ background: RGBstring }} />
          <div className='pin__name-wrapper'>
            <span className='pin__copy pin__name'>{previewColorName}</span>
            <span className='pin__copy pin__number'>SW {previewColorNumber}</span>
          </div>
        </button>
      </Fragment>
    )
  }
}

ColorsFromImagePin.propTypes = {
  pinType: PropTypes.string,
  onClickMethod: PropTypes.func,
  activePinIndex: PropTypes.number,
  isActiveFlag: PropTypes.bool,
  transformValue: PropTypes.string,
  RGBstring: PropTypes.string,
  previewColorName: PropTypes.string,
  previewColorNumber: PropTypes.string
}

export default ColorsFromImagePin

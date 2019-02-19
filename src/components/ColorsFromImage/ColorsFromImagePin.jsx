// @flow
import React, { PureComponent, Fragment } from 'react'

type Props = {
  pinType: string,
  onClickMethod: Function,
  activePinIndex: number,
  isActiveFlag: boolean,
  transformValue: string,
  RGBstring: string,
  previewColorName: string,
  previewColorNumber: string
}

class ColorsFromImagePin extends PureComponent<Props> {
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

export default ColorsFromImagePin

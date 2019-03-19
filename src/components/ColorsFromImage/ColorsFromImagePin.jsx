// @flow
import React, { PureComponent, Fragment } from 'react'

type Props = {
  pinType: string,
  onClickMethod: Function,
  // activePinIndex: number,
  isActiveFlag: boolean,
  transformValue: string,
  RGBstring: string,
  previewColorName: string,
  previewColorNumber: string
}

class ColorsFromImagePin extends PureComponent<Props> {
  render () {
    // eslint-disable-next-line one-var
    const { previewColorName, previewColorNumber, transformValue, RGBstring, onClickMethod, isActiveFlag, pinType } = this.props

    let isPreviewPin = false
    let additionalPinClass = ''
    let isActiveClass = ''

    if (pinType === 'preview') {
      isPreviewPin = true
      additionalPinClass = 'pin--preview__wrapper'
    }

    if (isPreviewPin) {
      if (isActiveFlag) isActiveClass = 'pin--active__wrapper'
    } else {
      // TODO: fix this functionality
      // is `this.key` supposed to be a reference to the key prop? is it supposed to be internally tracked?
      // if (activePinIndex === this.key) isActiveClass = 'pin--active__wrapper'
    }

    return (
      <Fragment>
        <button onClick={onClickMethod} style={{ transform: transformValue }} className={additionalPinClass + ' pin__wrapper ' + isActiveClass}>
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

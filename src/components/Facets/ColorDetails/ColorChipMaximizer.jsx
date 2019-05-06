// @flow
import React, { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { FormattedMessage, injectIntl, type intlShape } from 'react-intl'
import { LiveMessage } from 'react-aria-live'
import ReactGA from 'react-ga'

import { type Color } from '../../../shared/types/Colors'
import { varValues } from 'variables'

const BASE_CLASS = 'color-info'

type Props = {
  color: Color,
  intl: intlShape
}

function ColorChipMaximizer ({ color, intl }: Props) {
  const [isMaximized, setMaximized] = useState(null)
  const [liveRegionMessage, setLiveRegionMessage] = useState('')

  const maximizeChipBtn = React.createRef()
  const minimizeChipBtn = React.createRef()
  const maximizeChip = e => {
    setLiveRegionMessage('')
    setMaximized(true)
  }
  const minimizeChip = e => {
    setLiveRegionMessage('')
    setMaximized(false)
  }

  const contrastingTextColor = (color.isDark) ? varValues.colors.white : varValues.colors.black

  const CHIP_CLASS = [
    `${BASE_CLASS}__max-chip`
  ]
  const SWATCH_SIZE_WRAPPER_CLASSES = [
    `${BASE_CLASS}__display-toggles-wrapper`,
    `${BASE_CLASS}__display-toggles-wrapper--swatch-size`
  ]
  const SWATCH_SIZE_TOGGLE_BUTTON_CLASSES = [
    `${BASE_CLASS}__display-toggle-button`,
    `${BASE_CLASS}__swatch-size-toggle-button`
  ]
  const ALT_SWATCH_SIZE_TOGGLE_BUTTON_CLASSES = [
    `${BASE_CLASS}__display-toggle-button`,
    `${BASE_CLASS}__swatch-size-toggle-button`,
    `${BASE_CLASS}__display-toggle-button--alt`
  ]

  if (isMaximized) {
    CHIP_CLASS.push(`${BASE_CLASS}__max-chip--maximized`)
    SWATCH_SIZE_WRAPPER_CLASSES.push(`${BASE_CLASS}__display-toggles-wrapper--chip-maximized`)
    SWATCH_SIZE_TOGGLE_BUTTON_CLASSES.push(`${BASE_CLASS}__display-toggle-button--active`)
    SWATCH_SIZE_WRAPPER_CLASSES.push(`${BASE_CLASS}__display-toggles-wrapper--chip-maximized`)
    ALT_SWATCH_SIZE_TOGGLE_BUTTON_CLASSES.push(`${BASE_CLASS}__display-toggle-button--active`)
  }

  if (color.isDark) {
    ALT_SWATCH_SIZE_TOGGLE_BUTTON_CLASSES.push(`${BASE_CLASS}__display-toggle-button--dark-color`)
    SWATCH_SIZE_TOGGLE_BUTTON_CLASSES.push(`${BASE_CLASS}__display-toggle-button--dark-color`)
    SWATCH_SIZE_WRAPPER_CLASSES.push(`${BASE_CLASS}__display-toggles-wrapper--dark-color`)
  }

  useEffect(() => {
    if (isMaximized === true) {
      minimizeChipBtn.current && minimizeChipBtn.current.focus()
      setTimeout(() => {
        setLiveRegionMessage(intl.messages.CHIP_MAXIMIZED)
      }, 500)
      ReactGA.event({
        category: 'Color Detail',
        action: 'Maximize Swatch',
        label: 'Maximize Swatch'
      }, ['GAtrackerPRISM'])
    }
    if (isMaximized === false) {
      maximizeChipBtn.current && maximizeChipBtn.current.focus()
      setTimeout(() => {
        setLiveRegionMessage(intl.messages.CHIP_MINIMIZED)
      }, 500)
    }
  }, [isMaximized])

  return (
    <React.Fragment>
      <div className={CHIP_CLASS.join(' ')} style={{ backgroundColor: color.hex }} />
      <div className={SWATCH_SIZE_WRAPPER_CLASSES.join(' ')}>
        <button className={SWATCH_SIZE_TOGGLE_BUTTON_CLASSES.join(' ')} onClick={maximizeChip} ref={maximizeChipBtn}>
          <FontAwesomeIcon className={`${BASE_CLASS}__display-toggles-icon`} icon={['fal', 'expand-alt']} color={contrastingTextColor} size={'2x'} />
          <div className={`${BASE_CLASS}__scene-toggle-copy`}>
            <FormattedMessage id='MAXIMIZE_COLOR_SWATCH' />
          </div>
        </button>
        <button className={ALT_SWATCH_SIZE_TOGGLE_BUTTON_CLASSES.join(' ')} onClick={minimizeChip} ref={minimizeChipBtn}>
          <FontAwesomeIcon className={`${BASE_CLASS}__display-toggles-icon`} icon={['fal', 'compress-alt']} color={contrastingTextColor} size={'2x'} />
          <div className={`${BASE_CLASS}__scene-toggle-copy`}>
            <FormattedMessage id='RESTORE_COLOR_SWATCH_TO_DEFAULT_SIZE' />
          </div>
        </button>
      </div>
      <LiveMessage message={liveRegionMessage} aria-live='polite' clearOnUnmount='true' />
    </React.Fragment>
  )
}

export default injectIntl(ColorChipMaximizer)

// @flow
import React, { type Element, useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import 'src/providers/fontawesome/fontawesome'
import { FormattedMessage, injectIntl } from 'react-intl'
import { LiveMessage } from 'react-aria-live'
import * as GA from 'src/analytics/GoogleAnalytics'
import { type Color } from '../../../shared/types/Colors.js.flow'
import { varValues } from 'src/shared/withBuild/variableDefs'
import 'src/scss/convenience/visually-hidden.scss'

const BASE_CLASS = 'color-info'

type Props = {
  addColorBtn: ({}) => Element<any>,
  color: Color,
  intl: any,
  onToggle?: boolean => void,
}

export function ColorChipMaximizer ({ addColorBtn, color, intl, onToggle }: Props) {
  const [isMaximized, setMaximized] = useState(false)
  const [liveRegionMessage, setLiveRegionMessage] = useState('')

  const maximizeChipBtn = React.createRef()
  const minimizeChipBtn = React.createRef()

  const toggleChipMaximized = e => {
    setLiveRegionMessage('')
    setMaximized(!isMaximized)
  }

  const contrastingTextColor = (color.isDark) ? varValues._colors.white : varValues._colors.black

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
    CHIP_CLASS.push(`${BASE_CLASS}__max-chip--dark-color`)
    ALT_SWATCH_SIZE_TOGGLE_BUTTON_CLASSES.push(`${BASE_CLASS}__display-toggle-button--dark-color`)
    SWATCH_SIZE_TOGGLE_BUTTON_CLASSES.push(`${BASE_CLASS}__display-toggle-button--dark-color`)
    SWATCH_SIZE_WRAPPER_CLASSES.push(`${BASE_CLASS}__display-toggles-wrapper--dark-color`)
  }

  useEffect(() => {
    onToggle && onToggle(isMaximized)
    if (isMaximized === true) {
      minimizeChipBtn.current && minimizeChipBtn.current.focus()
      setTimeout(() => {
        setLiveRegionMessage(intl.formatMessage({ id: 'CHIP_MAXIMIZED' }))
      }, 500)
      GA.event({
        category: 'Color Detail',
        action: 'Maximize Swatch',
        label: 'Maximize Swatch'
      })
    }
    if (isMaximized === false) {
      maximizeChipBtn.current && maximizeChipBtn.current.focus()
      setTimeout(() => {
        setLiveRegionMessage(intl.formatMessage({ id: 'CHIP_MAXIMIZED' }))
      }, 500)
    }
  }, [isMaximized])

  return (
    <>
      <div className={CHIP_CLASS.join(' ')} style={{ backgroundColor: color.hex, zIndex: isMaximized ? 3 : 2 }}>
        {addColorBtn(isMaximized ? {} : { display: 'none' })}
      </div>
      <div className={SWATCH_SIZE_WRAPPER_CLASSES.join(' ')}>
        <button className={SWATCH_SIZE_TOGGLE_BUTTON_CLASSES.join(' ')} onClick={toggleChipMaximized} ref={maximizeChipBtn}>
          <FontAwesomeIcon className={`${BASE_CLASS}__display-toggles-icon`} icon={['fal', 'expand-alt']} color={contrastingTextColor} size={'2x'} />
          <div className={`${BASE_CLASS}__scene-toggle-copy visually-hidden`}>
            <FormattedMessage id='MAXIMIZE_COLOR_SWATCH' />
          </div>
        </button>
        <button className={ALT_SWATCH_SIZE_TOGGLE_BUTTON_CLASSES.join(' ')} onClick={toggleChipMaximized} ref={minimizeChipBtn}>
          <FontAwesomeIcon className={`${BASE_CLASS}__display-toggles-icon`} icon={['fal', 'compress-alt']} color={contrastingTextColor} size={'2x'} />
          <div className={`${BASE_CLASS}__scene-toggle-copy visually-hidden`}>
            <FormattedMessage id='RESTORE_COLOR_SWATCH_TO_DEFAULT_SIZE' />
          </div>
        </button>
      </div>

      <LiveMessage message={liveRegionMessage} aria-live='polite' clearOnUnmount='true' />
    </>
  )
}

export default injectIntl(ColorChipMaximizer)

// @flow
import type { Node } from 'react'
import React, { type Element, createRef, useContext, useEffect, useState } from 'react'
import { LiveMessage } from 'react-aria-live'
import { FormattedMessage, useIntl } from 'react-intl'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import * as GA from 'src/analytics/GoogleAnalytics'
import { GA_TRACKER_NAME_BRAND } from 'src/constants/globals'
import ConfigurationContext, {
  type ConfigurationContextType
} from 'src/contexts/ConfigurationContext/ConfigurationContext'
import 'src/providers/fontawesome/fontawesome'
import useChipMaximizer, { BASE_CLASS } from '../../../hooks/useChipMaximizer'
import { type Color } from '../../../shared/types/Colors.js.flow'
import 'src/scss/convenience/visually-hidden.scss'

type Props = {
  addColorBtn: ({ style: $Shape<CSSStyleDeclaration> }) => Element<any>,
  color: Color,
  onToggle?: (boolean) => void,
  isMaximized: boolean,
  setMaximized: (boolean) => void
}

const ColorChipMaximizer = ({ addColorBtn, color, onToggle, isMaximized, setMaximized }: Props): Node => {
  const { brandId }: ConfigurationContextType = useContext(ConfigurationContext)
  const [liveRegionMessage, setLiveRegionMessage] = useState('')
  const { formatMessage, locale } = useIntl()
  const { styles, contrastingTextColor } = useChipMaximizer({ isDark: color.isDark, isMaximized })

  const toggleMaximizedBtn = createRef()

  const toggleChipMaximized = (e) => {
    setLiveRegionMessage('')
    setMaximized(!isMaximized)
  }

  useEffect(() => {
    onToggle && onToggle(isMaximized)
    if (isMaximized) {
      toggleMaximizedBtn.current && toggleMaximizedBtn.current.focus()
      setTimeout(() => {
        setLiveRegionMessage(formatMessage({ id: 'CHIP_MAXIMIZED' }))
      }, 500)
      GA.event(
        {
          category: 'Color Detail',
          action: 'Maximize Swatch',
          label: 'Maximize Swatch'
        },
        GA_TRACKER_NAME_BRAND[brandId]
      )
    }
    if (!isMaximized) {
      toggleMaximizedBtn.current && toggleMaximizedBtn.current.focus()
      setTimeout(() => {
        setLiveRegionMessage(formatMessage({ id: 'CHIP_MINIMIZED' }))
      }, 500)
    }
  }, [isMaximized])

  return (
    <>
      <div className={styles.chip} style={{ backgroundColor: color.hex, zIndex: isMaximized ? 3 : 0 }}>
        {addColorBtn(isMaximized ? {} : { style: { display: 'none' } })}
      </div>
      <div className={styles.wrapper}>
        <button
          className={isMaximized ? styles.alt : styles.swatch}
          onClick={toggleChipMaximized}
          ref={toggleMaximizedBtn}
        >
          <FontAwesomeIcon
            className={`${BASE_CLASS}__display-toggles-icon`}
            icon={isMaximized ? ['fal', 'compress-alt'] : ['fal', 'expand-alt']}
            color={contrastingTextColor}
            size={'2x'}
          />
          <div className={`${BASE_CLASS}__scene-toggle-copy visually-hidden`}>
            {isMaximized ? (
              <FormattedMessage id='RESTORE_COLOR_SWATCH_TO_DEFAULT_SIZE' />
            ) : (
              <FormattedMessage id='MAXIMIZE_COLOR_SWATCH' />
            )}
          </div>
        </button>
      </div>

      <LiveMessage message={liveRegionMessage} aria-live='polite' clearOnUnmount='true' />
    </>
  )
}

export default ColorChipMaximizer

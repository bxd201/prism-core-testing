// @flow
import React, { forwardRef,useContext } from 'react'
import { useIntl } from 'react-intl'
import { useDispatch } from 'react-redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import filter from 'lodash/filter'
import isEmpty from 'lodash/isEmpty'
import startCase from 'lodash/startCase'
import values from 'lodash/values'
import * as GA from 'src/analytics/GoogleAnalytics'
import { GA_TRACKER_NAME_BRAND, HASH_CATEGORIES } from 'src/constants/globals'
import ConfigurationContext, { type ConfigurationContextType } from 'src/contexts/ConfigurationContext/ConfigurationContext'
import { fullColorName } from 'src/shared/helpers/ColorUtils'
import useColors from 'src/shared/hooks/useColors'
import { type Color } from 'src/shared/types/Colors.js.flow'
import { showColorDetailsModal } from 'src/store/actions/loadColors'
import './InfoButton.scss'

type InfoButtonProps = { color: Color }

const InfoButton = ({ color }: InfoButtonProps, ref) => {
  const { brandId, brandKeyNumberSeparator, colorWall: { colorSwatch = {} } }: ConfigurationContextType = useContext(ConfigurationContext)
  const { infoBtn = {} } = colorSwatch
  const dispatch = useDispatch()
  const { formatMessage } = useIntl()
  const [{ colorMap = {} }] = useColors()

  const onClick = () => {
    dispatch(showColorDetailsModal(color))
    // Reset app scroll top position for hosts with big headers
    setTimeout(() => {
      const container = document.getElementById('cvw-container')
      const position = container && container.getBoundingClientRect()
      window.scroll({ top: position?.top })
    }, 150)
    GA.event({
      category: startCase(window.location.hash.split('/').filter(hash => HASH_CATEGORIES.indexOf(hash) >= 0)),
      action: 'Color Swatch Info',
      label: fullColorName(color.brandKey, color.colorNumber, color.name, brandKeyNumberSeparator)
    }, GA_TRACKER_NAME_BRAND[brandId])
  }

  if (isEmpty(colorMap)) {
    return null
  }

  const relevantColors: Color[] = filter(colorMap, c => values(color.coordinatingColors).some(id => id === c.id))

  return (
    <button
      aria-label={`${color.name} ${formatMessage({ id: 'COLOR_DETAILS' })}`}
      className={infoBtn?.icon ? '' : 'info-button' + (relevantColors.length > 0 ? '' : ' outlined')}
      onClick={onClick}
      ref={ref}>
      {infoBtn?.icon
        ? <FontAwesomeIcon className='add-icon' icon={['fal', infoBtn?.icon]} size='2x' />
        : relevantColors.length > 0
          ? relevantColors.map((color: Color, index: number) => <span key={index} className='info-button-color-strip' style={{ backgroundColor: color.hex, borderTop: index !== 0 ? 0 : '1px solid #333' }} />)
          : <FontAwesomeIcon icon={infoBtn?.icon ?? ['fas', 'info']} size='1x' />}
    </button>
  )
}

// $FlowIgnore
export default forwardRef(InfoButton)

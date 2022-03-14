// @flow
import React, { useContext } from 'react'
import { useDispatch } from 'react-redux'
import { useIntl } from 'react-intl'
import { type Color } from 'src/shared/types/Colors.js.flow'
import { showColorDetailsModal } from 'src/store/actions/loadColors'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import ConfigurationContext, { type ConfigurationContextType } from 'src/contexts/ConfigurationContext/ConfigurationContext'
import useColors from 'src/shared/hooks/useColors'
import filter from 'lodash/filter'
import values from 'lodash/values'
import isEmpty from 'lodash/isEmpty'
import './InfoButton.scss'

type InfoButtonProps = { color: Color }

export default ({ color }: InfoButtonProps) => {
  const { colorWall: { colorSwatch = {} } }: ConfigurationContextType = useContext(ConfigurationContext)
  const { infoBtn = {} } = colorSwatch
  const dispatch = useDispatch()
  const { formatMessage } = useIntl()
  const [{ colorMap = {} }] = useColors()

  const onClick = () => {
    dispatch(showColorDetailsModal(color))
  }

  if (isEmpty(colorMap)) {
    return null
  }

  const relevantColors: Color[] = filter(colorMap, c => values(color.coordinatingColors).some(id => id === c.id))

  return (
    <button aria-label={`${color.name} ${formatMessage({ id: 'COLOR_DETAILS' })}`} className={infoBtn?.icon ? '' : 'info-button' + (relevantColors.length > 0 ? '' : ' outlined')} onClick={onClick}>
      {infoBtn?.icon
        ? <FontAwesomeIcon className='add-icon' icon={['fal', infoBtn?.icon]} size='2x' />
        : relevantColors.length > 0
          ? relevantColors.map((color: Color, index: number) => <span key={index} className='info-button-color-strip' style={{ backgroundColor: color.hex, borderTop: index !== 0 ? 0 : '1px solid #333' }} />)
          : <FontAwesomeIcon icon={infoBtn?.icon ?? ['fas', 'info']} size='1x' />}
    </button>
  )
}

// @flow
import React from 'react'
import { useDispatch } from 'react-redux'
import { useIntl } from 'react-intl'
import { type Color } from 'src/shared/types/Colors.js.flow'
import { showColorDetailsModal } from 'src/store/actions/loadColors'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import useColors from 'src/shared/hooks/useColors'
import filter from 'lodash/filter'
import values from 'lodash/values'
import isEmpty from 'lodash/isEmpty'
import './InfoButton.scss'
import { activateColorDetailsScene } from 'src/store/actions/scenes'

type InfoButtonProps = { color: Color }

export default ({ color }: InfoButtonProps) => {
  const dispatch = useDispatch()
  const { formatMessage } = useIntl()
  const [{ colorMap = {} }] = useColors()

  const onClick = () => {
    dispatch(showColorDetailsModal(color))
    dispatch(activateColorDetailsScene(1))
  }

  if (isEmpty(colorMap)) {
    return null
  }

  const relevantColors: Color[] = filter(colorMap, c => values(color.coordinatingColors).some(id => id === c.id))

  return (
    <button aria-label={`${color.name} ${formatMessage({ id: 'COLOR_DETAILS' })}`} className={'info-button' + (relevantColors.length > 0 ? '' : ' outlined')} onClick={onClick}>
      {relevantColors.length > 0
        ? relevantColors.map((color: Color, index: number) => <span key={index} className='info-button-color-strip' style={{ backgroundColor: color.hex, borderTop: index !== 0 ? 0 : '1px solid #333' }} />)
        : <FontAwesomeIcon icon={['fas', 'info']} size='1x' />}
    </button>
  )
}

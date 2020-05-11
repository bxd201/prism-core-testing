// @flow
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { type Color } from 'src/shared/types/Colors.js.flow'
import { showColorDetailsModal } from 'src/store/actions/loadColors'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import filter from 'lodash/filter'
import values from 'lodash/values'
import './InfoButton.scss'

type InfoButtonProps = { color: Color }
export default ({ color }: InfoButtonProps) => {
  const colors: Color[] = useSelector(store => filter(store.colors.items.colorMap, c => values(color.coordinatingColors).some(id => id === c.id)))
  const dispatch = useDispatch()

  return (
    <button className={'info-button' + (colors.length > 0 ? '' : ' outlined')} onClick={() => dispatch(showColorDetailsModal(color))}>
      {colors.length > 0
        ? colors.map((color: Color, index: number) => <span key={index} className='info-button-color-strip' style={{ backgroundColor: color.hex, borderTop: index !== 0 ? 0 : '1px solid #333' }} />)
        : <FontAwesomeIcon icon={['fas', 'info']} size='1x' />}
    </button>
  )
}

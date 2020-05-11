// @flow
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { type Color } from 'src/shared/types/Colors.js.flow'
import { showColorDetailsModal } from 'src/store/actions/loadColors'
import filter from 'lodash/filter'
import values from 'lodash/values'
import './InfoButton.scss'

type InfoButtonProps = { color: Color }
export default ({ color }: InfoButtonProps) => {
  const colors: Color[] = useSelector(store => filter(store.colors.items.colorMap, c => values(color.coordinatingColors).some(id => id === c.id)))
  const dispatch = useDispatch()

  return colors.length > 0 && (
    <button className='info-button' onClick={() => dispatch(showColorDetailsModal(color))}>
      {colors.map((color: Color, index: number) => {
        return <span key={index} className='info-button-color-strip' style={{ backgroundColor: color.hex, borderTop: index !== 0 ? 0 : '1px solid #333' }} />
      })}
    </button>
  )
}

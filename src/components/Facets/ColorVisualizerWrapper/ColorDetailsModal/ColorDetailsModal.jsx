// @flow
import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { hideColorDetailsModal } from 'src/store/actions/loadColors'
import ColorDetails from 'src/components/Facets/ColorDetails/ColorDetails'
import './ColorDetailsModal.scss'

export default () => {
  const { showing, color } = useSelector(store => store.colors.colorDetailsModal)
  const dispatch = useDispatch()
  return showing && (
    <div className='color-details-modal'>
      <div className='color-details-modal-content'>
        <button className='color-details-modal-close' onClick={() => dispatch(hideColorDetailsModal())}>
          &times;
        </button>
        <ColorDetails initialColor={color} />
      </div>
    </div>
  )
}

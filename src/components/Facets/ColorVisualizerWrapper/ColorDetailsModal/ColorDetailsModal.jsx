// @flow
import React, { useContext, useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { hideColorDetailsModal } from 'src/store/actions/loadColors'
import ColorDetails from 'src/components/Facets/ColorDetails/ColorDetails'
import './ColorDetailsModal.scss'
import { PubSubCtx } from 'src/facetSupport/facetPubSub'

export default () => {
  const { showing, color } = useSelector(store => store.colors.colorDetailsModal)
  const dispatch = useDispatch()
  const { subscribe, publish, unsubscribe } = useContext(PubSubCtx)
  const [CTAs, setCTAs] = useState()

  const handleNewCTAs = function handleNewCTAs (newCTAs) {
    setCTAs(newCTAs)
  }

  useEffect(() => {
    subscribe('PRISM/in/update-color-ctas', handleNewCTAs)
    return () => unsubscribe('PRISM/in/update-color-ctas', handleNewCTAs)
  }, [])

  return showing && (
    <div className='color-details-modal'>
      <div className='color-details-modal-content'>
        <button className='color-details-modal-close' onClick={() => dispatch(hideColorDetailsModal())}>
          &times;
        </button>
        <ColorDetails
          initialColor={color}
          onColorChanged={newColor => {
            publish('prism-new-color', newColor)
          }}
          callsToAction={CTAs}
        />
      </div>
    </div>
  )
}

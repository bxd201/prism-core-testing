// @flow
import React, { useContext, useEffect, useRef, useState } from 'react'
import { useIntl } from 'react-intl'
import { useDispatch,useSelector } from 'react-redux'
import ColorDetails from 'src/components/Facets/ColorDetails/ColorDetails'
import { PubSubCtx } from 'src/facetSupport/facetPubSub'
import { hideColorDetailsModal } from 'src/store/actions/loadColors'
import './ColorDetailsModal.scss'

export default () => {
  const { showing, color } = useSelector(store => store.colors.colorDetailsModal)
  const dispatch = useDispatch()
  const { subscribe, publish, unsubscribe } = useContext(PubSubCtx)
  const [CTAs, setCTAs] = useState()
  const wrapper = useRef()
  const { formatMessage } = useIntl()

  const handleNewCTAs = function handleNewCTAs (newCTAs) {
    setCTAs(newCTAs)
  }

  useEffect(() => {
    subscribe('PRISM/in/update-color-ctas', handleNewCTAs)
    return () => unsubscribe('PRISM/in/update-color-ctas', handleNewCTAs)
  }, [])

  useEffect(() => {
    // resetting tab focus
    wrapper.current?.focus()
  }, [showing])

  return showing && (
    <div className='color-details-modal'>
      <div className='color-details-modal-content' ref={wrapper} tabIndex={0}>
        <button
          aria-label={formatMessage({ id:'CLOSE' })}
          className='color-details-modal-close'
          onClick={() => dispatch(hideColorDetailsModal())}
        >
          &times;
        </button>
        <ColorDetails
          colorFromParent={color}
          onColorChanged={newColor => {
            publish('prism-new-color', newColor)
          }}
          callsToAction={CTAs}
        />
      </div>
    </div>
  )
}

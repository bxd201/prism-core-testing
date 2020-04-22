// @flow
import React, { useRef, useEffect, useCallback } from 'react'
import { mouseDownPreventDefault } from 'src/shared/helpers/MiscUtils'
import { FormattedMessage } from 'react-intl'

type Props = {
    empty: Function,
    cancel: Function,
    isActive: boolean
}

const LivePaletteModal = ({ cancel, empty, isActive }: Props) => {
  const btnYesRef = useRef()
  const btnNoRef = useRef()

  useEffect(() => {
    if (btnYesRef && btnYesRef.current) btnYesRef.current.focus()
  }, [isActive])

  const blurHandler = useCallback((ref: any) => {
    if (ref.current === btnYesRef.current) {
      btnNoRef.current.focus()
    } else if (ref.current === btnNoRef.current) {
      btnYesRef.current.focus()
    }
  }, [btnYesRef, btnNoRef])

  return (
    isActive && <div className={'live-palette-modal__wrapper'} role='presentation' onMouseDown={mouseDownPreventDefault}>
      <div className={`live-palette-modal__container`}>
        <p className={`live-palette-modal__content__title`}>
          <FormattedMessage id='LIVE_PALETTE_MODAL.PALETTE_FULL' />
        </p>
        <p className={`live-palette-modal__content`}>
          <FormattedMessage id='LIVE_PALETTE_MODAL.DELETE_COLOR' />
        </p>
        <button ref={btnNoRef} onBlur={() => blurHandler(btnNoRef)} className={`live-palette-modal__button`} onClick={cancel}><FormattedMessage id='CANCEL' /></button>
        <button ref={btnYesRef} onBlur={() => blurHandler(btnYesRef)} className={`live-palette-modal__button`} onClick={empty}><FormattedMessage id='LIVE_PALETTE_MODAL.NEW_PALETTE' /></button>
      </div>
    </div>
  )
}

export default LivePaletteModal

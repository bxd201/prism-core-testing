// @flow
import React from 'react'

type Props = {
    empty: Function,
    cancel: Function,
    isActive: boolean
}

const LivePalletteModal = ({ cancel, empty, isActive }: Props) => {
  return (
    isActive && <div className={'live-palette-modal__wrapper'}>
      <div className={`live-palette-modal__container`}>
        <p className={`live-palette-modal__content__title`}>
                    This Palette is Full
        </p>
        <p className={`live-palette-modal__content`}>
                    Delete a color below before adding a new one, or create a new palette.
        </p>
        <button className={`live-palette-modal__button`} onClick={cancel}>CANCEL</button>
        <button className={`live-palette-modal__button`} onClick={empty}>NEW PLALETTE</button>
      </div>
    </div>
  )
}

export default LivePalletteModal

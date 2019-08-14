// @flow
import React from 'react'
import { Link } from 'react-router-dom'

type Props = {
  onClickNo: Function,
  isActive: boolean
}

const ConfirmationModal = ({ onClickNo, isActive }: Props) => {
  return (
    <div className={`confirmation-modal__wrapper ${isActive ? `confirmation-modal__wrapper--active` : ''}`}>
      <div className={`confirmation-modal__container`}>
        <p className={`confirmation-modal__content`}>
          The photo content will be lost if you close. Make sure the colors you want to keep have been added to your palette. Do you still want to close?
        </p>
        <Link to={`/active`}><button className={`confirmation-modal__button`}>YES</button></Link>
        <button className={`confirmation-modal__button`} onClick={onClickNo}>NO</button>
      </div>
    </div>
  )
}

export default ConfirmationModal

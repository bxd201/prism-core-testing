// @flow
import React from 'react'
import { Link } from 'react-router-dom'
import { RouteConsumer } from '../../contexts/RouteContext/RouteContext'
import { FormattedMessage } from 'react-intl'

const baseClass = 'confirmation-modal'
const wrapperClass = `${baseClass}__wrapper`
const wrapperActiveClass = `${wrapperClass}--active`
const containerClass = `${baseClass}__container`
const contentClass = `${baseClass}__content`
const buttonClass = `${baseClass}__button`

type Props = {
  onClickNo: Function,
  isActive: boolean
}

const ConfirmationModal = ({ onClickNo, isActive }: Props) => {
  return (
    <div className={`${wrapperClass} ${isActive ? `${wrapperActiveClass}` : ''}`}>
      <div className={`${containerClass}`}>
        <p className={`${contentClass}`}>
          <FormattedMessage id='CONFIRMATION_DIALOG_MATCH_A_PHOTO_EXIT' />
        </p>
        <Link to={`/active`}><RouteConsumer>{(context) => (
          <button className={`${buttonClass}`} onClick={() => context.setActiveComponent()}><FormattedMessage id='YES' /></button>
        )}</RouteConsumer></Link>
        <button className={`${buttonClass}`} onClick={onClickNo}><FormattedMessage id='NO' /></button>
      </div>
    </div>
  )
}

export {
  contentClass,
  buttonClass
}
export default ConfirmationModal

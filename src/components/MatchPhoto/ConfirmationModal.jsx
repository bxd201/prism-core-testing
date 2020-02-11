// @flow
import React from 'react'
import { Link } from 'react-router-dom'
import { RouteConsumer } from '../../contexts/RouteContext/RouteContext'

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
          The photo content will be lost if you close. Make sure the colors you want to keep have been added to your palette. Do you still want to close?
        </p>
        <Link to={`/active`}><RouteConsumer>{(context) => (
          <button className={`${buttonClass}`} onClick={() => context.setActiveComponent()}>YES</button>
        )}</RouteConsumer></Link>
        <button className={`${buttonClass}`} onClick={onClickNo}>NO</button>
      </div>
    </div>
  )
}

export {
  contentClass,
  buttonClass
}
export default ConfirmationModal

// @flow
import React, { useState } from 'react'
import './CollectionsHeaderWrapper.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Link } from 'react-router-dom'

const baseClass = 'collections-header'
const wrapper = `${baseClass}__wrapper`
const wrapperHeader = `${baseClass}__header`
export const heading = `${baseClass}__heading`
const button = `${baseClass}__button`
export const buttonLeft = `${baseClass}__button--left`
const buttonLeftText = `${baseClass}__button-left-text`
export const buttonRight = `${baseClass}__button--right`
const buttonClose = `${baseClass}__close`
const buttonCancel = `${baseClass}__cancel`
const wrapperContent = `${baseClass}__content`

export default (WrappedComponent) => (props) => {
  const [showBack, setShowBack] = useState(false)
  const [header, setHeader] = useState('')

  return (<div className={`${wrapper}`}>
    <div className={`${wrapperHeader}`}>
      <div className={`${heading}`}>{header}</div>
      {showBack && <button className={`${button} ${buttonLeft}`} onClick={() => setShowBack(false)}>
        <div>
          <FontAwesomeIcon className={``} icon={['fa', 'angle-left']} />
          &nbsp;<span className={`${buttonLeftText}`}>BACK</span>
        </div>
      </button>}
      <Link to={`/active`}>
        <button className={`${button} ${buttonRight}`}>
          <div className={`${buttonClose}`}>
            <span>CLOSE</span>&nbsp;<FontAwesomeIcon className={``} icon={['fa', 'chevron-up']} />
          </div>
          <div className={`${buttonCancel}`}>
            <FontAwesomeIcon className={``} icon={['fa', 'times']} />
          </div>
        </button>
      </Link>
    </div>
    <div className={`${wrapperContent}`}>
      <WrappedComponent
        {...props}
        showBack={() => setShowBack(true)}
        isShowBack={showBack}
        setHeader={setHeader}
      />
    </div>
  </div>)
}

// @flow
import React, { useContext, useRef, useCallback, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { RouteContext } from '../../contexts/RouteContext/RouteContext'
import { FormattedMessage } from 'react-intl'

const baseClass = 'confirmation-modal'
const wrapperClass = `${baseClass}__wrapper`
const containerClass = `${baseClass}__container`
const contentClass = `${baseClass}__content`
const buttonClass = `${baseClass}__button`

type Props = {
  onClickNo: Function
}

const ConfirmationModal = ({ onClickNo }: Props) => {
  const routeContext = useContext(RouteContext)
  const btnYesRef = useRef()
  const btnNoRef = useRef()

  useEffect(() => {
    if (btnYesRef && btnYesRef.current) btnYesRef.current.focus()
  }, [])

  const blurHandler = useCallback((ref: any) => {
    if (ref.current === btnYesRef.current) {
      btnNoRef.current.focus()
    } else if (ref.current === btnNoRef.current) {
      btnYesRef.current.focus()
    }
  }, [btnYesRef, btnNoRef])

  return (
    <div className={`${wrapperClass}`}>
      <div className={`${containerClass}`}>
        <p className={`${contentClass}`}>
          <FormattedMessage id='CONFIRMATION_DIALOG_MATCH_A_PHOTO_EXIT' />
        </p>
        <Link tabIndex='-1' to={`/active`}>
          <button ref={btnYesRef} onBlur={() => blurHandler(btnYesRef)} className={`${buttonClass}`} onClick={() => routeContext.setActiveComponent()}><FormattedMessage id='YES' /></button>
        </Link>
        <button ref={btnNoRef} onBlur={() => blurHandler(btnNoRef)} className={`${buttonClass}`} onClick={onClickNo}><FormattedMessage id='NO' /></button>
      </div>
    </div>
  )
}

export {
  contentClass,
  buttonClass
}
export default ConfirmationModal

// @flow
import React, { SyntheticEvent, useState } from 'react'
import React, { SyntheticEvent } from 'react'
import { useIntl } from 'react-intl'
import { login } from '../../store/actions/user'
import { useDispatch } from 'react-redux'

import './Login.scss'

const baseClassName = 'login-wrapper'
const sectionClassName = `${baseClassName}__section`
const userButtonClassName = `${sectionClassName}__button`
const loginFormClassName = `${baseClassName}__form`

const Login = (props: loginProps) => {
  const dispatch = useDispatch()

  const submitLogin = (e: SyntheticEvent) => {
    e.preventDefault()
    dispatch(login(null, null))
  }

  const intl = useIntl()
  // @todo - check for logged in user flow -RS
  return (
    <div className={baseClassName}>
      <div className={sectionClassName}>
        <div className={loginFormClassName}>
          <form>
            <button className={userButtonClassName} onClick={submitLogin}>{intl.messages.SIGN_IN}</button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login

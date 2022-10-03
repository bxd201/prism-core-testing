// @flow

import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import * as firebase from 'firebase/app'
import 'firebase/auth'
import { anonLogin } from '../../store/actions/user'

type AnonLoginProps = {

}

const AnonLogin = (props: AnonLoginProps) => {
  const dispatch = useDispatch()

  useEffect(() => {
    const user = firebase.auth().currentUser

    if (!user) {
      dispatch(anonLogin())
    }
  }, [])

  return (<></>)
}

export default AnonLogin

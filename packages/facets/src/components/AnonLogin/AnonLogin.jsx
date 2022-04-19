// @flow

import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { anonLogin } from '../../store/actions/user'
import * as firebase from 'firebase/app'
import 'firebase/auth'

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

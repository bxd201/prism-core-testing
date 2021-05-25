// @flow
import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import * as firebase from 'firebase/app'
import 'firebase/auth'
import { tryToFetchSaveScenesFromFirebase, tryToPersistCachedSceneData } from '../../store/actions/persistScene'
import { setUser } from '../../store/actions/user'

type authObserverProps = {

}

const AuthObserver = (props: authObserverProps) => {
  const dispatch = useDispatch()

  useEffect(() => {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        dispatch(setUser(user))
        dispatch(tryToPersistCachedSceneData())
        dispatch(tryToFetchSaveScenesFromFirebase())
      }
    })
  }, [])

  return (<></>)
}

export default AuthObserver

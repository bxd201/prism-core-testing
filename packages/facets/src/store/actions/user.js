// @flow
import * as firebase from 'firebase/app'
import 'firebase/auth'
import { addSystemMessage, SYSTEM_MESSAGE_TYPES } from './systemMessages'

export const LOGGING_IN = 'LOGGING_IN'
export const USER_LOADED = 'USER_LOADED'
export const ERROR_LOGGING_IN = 'ERROR_LOGGING_IN'

export const login = (username: string, password: string) => {
  return (dispatch, getState) => {
    dispatch({
      type: LOGGING_IN,
      payload: true
    })
  }
}

export const anonLogin = () => {
  return (dispatch, getState) => {
    dispatch({
      type: LOGGING_IN,
      payload: true
    })

    firebase.auth().signInAnonymously().catch((err) => {
      dispatch(addSystemMessage('', SYSTEM_MESSAGE_TYPES.danger, 'ERROR_ANON_LOGIN'))
      // @todo [IMPROVEMENT] Log this error -RS
      console.log(`Error logging in: ${err}`)
      dispatch({
        type: ERROR_LOGGING_IN,
        payload: null
      })
    })
  }
}

export const setUser = (user: Object) => {
  return {
    type: USER_LOADED,
    payload: { ...user }
  }
}

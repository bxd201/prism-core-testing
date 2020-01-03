// @flow
import axios from 'axios'
export const LOGGING_IN = 'LOGGING_IN'
export const USER_LOADED = 'USER_LOADED'
export const ERROR_LOGGING_IN = 'ERROR_LOGGING_IN'

export const login = (username: string, password: string) => {
  return (dispatch, getState) => {
    dispatch({
      type: LOGGING_IN,
      payload: true
    })

    // @todo - implement all of this stuff, it is just reading static files so that I can work with the shape of the data. -RS
    axios.get('/public/user.json')
      .then(response => {
        dispatch({
          type: USER_LOADED,
          payload: true
        })
      })
      .catch(err => {
        console.log(`Error logging in: ${err}`)
        dispatch({
          type: ERROR_LOGGING_IN,
          payload: null
        })
      })
  }
}

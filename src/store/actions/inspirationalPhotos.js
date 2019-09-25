// @flow
import api from './api'
import { INSPIRATIONAL_PHOTOS_ENDPOINT as IPE } from 'constants/endpoints'

export const REQUEST: string = 'REQUEST_INSPIRATIONAL_PHOTOS'
export const RECEIVED: string = 'RECEIVE_INSPIRATIONAL_PHOTOS'
export const LOAD_ERROR: string = 'LOAD_ERROR'

export const request = () => {
  return {
    type: REQUEST,
    payload: {
      loading: true
    }
  }
}

export const received = (data: any) => {
  return {
    type: RECEIVED,
    payload: {
      loading: false,
      data
    }
  }
}

export const loadError = () => {
  return {
    type: LOAD_ERROR
  }
}

export const loadInspirationalPhotos = () => {
  return (dispatch: Function) => {
    dispatch(request())

    return api.get(IPE)
      .then(response => {
        // TODO:noah.hall
        // confirm error handling
        // are we informing the user? logging? etc
        if (response.status === 200) {
          dispatch(received(response.data))
        } else dispatch(loadError())
      })
  }
}

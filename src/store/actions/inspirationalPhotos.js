// @flow
import axios from 'axios'
import { INSPIRATIONAL_PHOTOS_ENDPOINT as IPE } from 'constants/endpoints'

export const REQUEST: string = 'REQUEST_INSPIRATIONAL_PHOTOS'
export const RECEIVED: string = 'RECEIVE_INSPIRATIONAL_PHOTOS'
export const LOAD_ERROR: string = 'LOAD_ERROR'

export const received = (data: any) => {
  return {
    type: RECEIVED,
    payload: { data }
  }
}

export const loadInspirationalPhotos = () => {
  return (dispatch: Function) => axios.get(IPE).then(res => { dispatch(received(res.data)) })
}

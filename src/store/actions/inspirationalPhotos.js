// @flow
import axios from 'axios'
import { generateBrandedEndpoint } from 'src/shared/helpers/DataUtils'
import { INSPIRATIONAL_PHOTOS_ENDPOINT } from 'constants/endpoints'

export const REQUEST: string = 'REQUEST_INSPIRATIONAL_PHOTOS'
export const RECEIVED: string = 'RECEIVE_INSPIRATIONAL_PHOTOS'
export const LOAD_ERROR: string = 'LOAD_ERROR'

export const received = (data: any) => {
  return {
    type: RECEIVED,
    payload: { data }
  }
}

export const loadInspirationalPhotos = (brandId: string, options?: {}) => {
  return (dispatch: Function) => axios.get(generateBrandedEndpoint(INSPIRATIONAL_PHOTOS_ENDPOINT, brandId, options)).then(res => { dispatch(received(res.data)) })
}

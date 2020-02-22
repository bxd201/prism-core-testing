// @flow
import axios from 'axios'
import { BRAND_COLORS_ENDPOINT } from 'constants/endpoints'

export const REQUEST_BRAND_COLORS: string = 'REQUEST_BRAND_COLORS'
export const RECEIVE_BRAND_COLORS: string = 'RECEIVE_BRAND_COLORS'
export const BRAND_COLORS_LOAD_ERROR: string = 'BRAND_COLORS_LOAD_ERROR'

export const request = () => {
  return {
    type: REQUEST_BRAND_COLORS,
    payload: {
      loading: true
    }
  }
}

export const received = (data: any) => {
  return {
    type: RECEIVE_BRAND_COLORS,
    payload: {
      loading: false,
      data
    }
  }
}

export const loadError = () => {
  return {
    type: BRAND_COLORS_LOAD_ERROR
  }
}

export const loadBrandColors = () => {
  return (dispatch: Function, getState: Function) => {
    const { data } = getState().brandColors
    const cachedBrandColors = (data.length > 0) ? data : null

    if (cachedBrandColors) {
      dispatch(received(cachedBrandColors))
      return
    }

    dispatch(request())

    return axios.get(BRAND_COLORS_ENDPOINT)
      .then(response => {
        if (response && response.status === 200) {
          dispatch(received(response.data))
        } else dispatch(loadError())
      })
  }
}

import axios from 'axios'

import { SW_COLORS_BY_FAMILY_ENDPOINT } from '../constants/endpoints'

export const REQUEST_COLORS = 'REQUEST_COLORS'
const requestColors = () => {
  return {
    type: REQUEST_COLORS,
    payload: { loading: true }
  }
}

export const RECEIVE_COLORS = 'RECEIVE_COLORS'
const receiveColors = (colors) => {
  return {
    type: RECEIVE_COLORS,
    payload: { loading: false, colors: colors }
  }
}

export const loadColors = () => {
  return (dispatch) => {
    dispatch(requestColors())

    return axios.get(SW_COLORS_BY_FAMILY_ENDPOINT)
      .then(r => r.data)
      .then(data => {
        dispatch(receiveColors(data))
      })
  }
}

// @flow
import axios from 'axios'

import { SW_COLORS_BY_FAMILY_ENDPOINT } from '../constants/endpoints'
import type { ColorPayload } from '../shared/types/Colors'

export const REQUEST_COLORS = 'REQUEST_COLORS'
const requestColors = () => {
  return {
    type: REQUEST_COLORS,
    payload: { loading: true }
  }
}

export const RECEIVE_COLORS = 'RECEIVE_COLORS'
const receiveColors = (colors: ColorPayload) => {
  return {
    type: RECEIVE_COLORS,
    payload: {
      loading: false,
      colors: colors
    }
  }
}

export const FILTER_BY_FAMILY = 'FILTER_BY_FAMILY'
export const filterByFamily = (family: ColorPayload) => {
  return {
    type: FILTER_BY_FAMILY,
    payload: { family }
  }
}

export const loadColors = () => {
  return (dispatch: Function) => {
    dispatch(requestColors())

    return axios.get(SW_COLORS_BY_FAMILY_ENDPOINT)
      .then(r => r.data)
      .then(data => {
        dispatch(receiveColors(data))
      })
  }
}

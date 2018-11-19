// @flow
import axios from 'axios'

import { SW_COLORS_BY_FAMILY_ENDPOINT, SW_BRIGHTS_ENDPOINT } from '../constants/endpoints'
import type { ColorPayload } from '../shared/types/Colors'

export const REQUEST_COLORS: string = 'REQUEST_COLORS'
const requestColors = () => {
  return {
    type: REQUEST_COLORS,
    payload: { loading: true }
  }
}

export const RECEIVE_COLORS: string = 'RECEIVE_COLORS'
const receiveColors = (colorData) => {
  return {
    type: RECEIVE_COLORS,
    payload: {
      loading: false,
      colors: colorData.colors,
      brights: colorData.brights
    }
  }
}

export const FILTER_BY_FAMILY: string = 'FILTER_BY_FAMILY'
export const filterByFamily = (family: ColorPayload) => {
  return {
    type: FILTER_BY_FAMILY,
    payload: { family }
  }
}

export const loadColors = () => {
  return (dispatch: Function) => {
    dispatch(requestColors())

    return Promise
      .all([axios.get(SW_COLORS_BY_FAMILY_ENDPOINT), axios.get(SW_BRIGHTS_ENDPOINT)])
      .then(r => {
        const colors = r[0].data
        const brights = r[1].data

        dispatch(receiveColors({ colors, brights }))
      })
    // return axios.get(SW_COLORS_BY_FAMILY_ENDPOINT)
    //   .then(r => r.data)
    //   .then(data => {
    //     dispatch(receiveColors(data))
    //   })
  }
}

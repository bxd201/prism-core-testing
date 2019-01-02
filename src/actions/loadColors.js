// @flow
import axios from 'axios'

import { SW_COLORS_BY_FAMILY_ENDPOINT, SW_BRIGHTS_ENDPOINT } from '../constants/endpoints'
import type { Color } from '../shared/types/Colors'

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
      brights: colorData.brights,
      families: colorData.families,
      defaultFamily: colorData.defaultFamily
    }
  }
}

export const FILTER_BY_FAMILY: string = 'FILTER_BY_FAMILY'
export const filterByFamily = (family: string) => {
  return {
    type: FILTER_BY_FAMILY,
    payload: { family }
  }
}

export const RESET_ACTIVE_COLOR: string = 'RESET_ACTIVE_COLOR'
export const resetActiveColor = () => {
  return {
    type: RESET_ACTIVE_COLOR
  }
}

export const MAKE_ACTIVE_COLOR: string = 'MAKE_ACTIVE_COLOR'
export const makeActiveColor = (color: Color) => {
  return {
    type: MAKE_ACTIVE_COLOR,
    payload: { color }
  }
}

// TODO: Make this method configurable via options on call so specific color wall implementations can reuse it to load their colors
export const loadColors = (options?: any) => {
  // conditionally add the lng parameter if a manual language has been passed in
  const COLOR_FAMILY_ENDPOINT = (options && options.language) ? `${SW_COLORS_BY_FAMILY_ENDPOINT}?lng=${options.language}` : SW_COLORS_BY_FAMILY_ENDPOINT
  const BRIGHTS_ENDPOINT = (options && options.language) ? `${SW_BRIGHTS_ENDPOINT}?lng=${options.language}` : SW_BRIGHTS_ENDPOINT

  return (dispatch: Function) => {
    dispatch(requestColors())

    return Promise
      .all([axios.get(COLOR_FAMILY_ENDPOINT), axios.get(BRIGHTS_ENDPOINT)])
      .then(r => {
        const colors = r[0].data
        const brights = r[1].data
        // TODO: populate families with a new API call eventually
        const families = [
          'All',
          'Red',
          'Orange',
          'Yellow',
          'Green',
          'Blue',
          'Purple',
          'Neutral',
          'White & Pastel'
        ]
        // TODO: select default family based on families data or some part of the families API response
        const defaultFamily = 'All'

        dispatch(receiveColors({
          colors,
          brights,
          families,
          defaultFamily
        }))
      })
  }
}

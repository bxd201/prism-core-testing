// @flow
import axios from 'axios'

import { SW_COLORS_BY_FAMILY_ENDPOINT, SW_BRIGHTS_ENDPOINT } from '../constants/endpoints'
import type { Color, FamilyStructure } from '../shared/types/Colors'

export const REQUEST_COLORS: string = 'REQUEST_COLORS'
const requestColors = () => {
  return {
    type: REQUEST_COLORS,
    payload: {
      loading: true,
      activeRequest: true
    }
  }
}

export const RECEIVE_COLORS: string = 'RECEIVE_COLORS'
const receiveColors = (colorData: any) => {
  return {
    type: RECEIVE_COLORS,
    payload: {
      loading: false,
      activeRequest: false,
      colors: colorData.colors,
      brights: colorData.brights,
      sections: colorData.sections,
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

export const FILTER_BY_SECTION: string = 'FILTER_BY_SECTION'
export const filterBySection = (section: string) => {
  return {
    type: FILTER_BY_SECTION,
    payload: { section }
  }
}

export const REMOVE_COLOR_FILTERS: string = 'REMOVE_COLOR_FILTERS'
export const removeColorFilters = () => {
  return {
    type: REMOVE_COLOR_FILTERS
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

export const MAKE_ACTIVE_COLOR_BY_ID: string = 'MAKE_ACTIVE_COLOR_BY_ID'
export const makeActiveColorById = (id: string) => {
  return {
    type: MAKE_ACTIVE_COLOR_BY_ID,
    payload: { id }
  }
}

// TODO: Make this method configurable via options on call so specific color wall implementations can reuse it to load their colors
export const loadColors = (options?: any) => {
  // conditionally add the lng parameter if a manual language has been passed in
  const COLOR_FAMILY_ENDPOINT = (options && options.language) ? `${SW_COLORS_BY_FAMILY_ENDPOINT}?lng=${options.language}` : SW_COLORS_BY_FAMILY_ENDPOINT
  const BRIGHTS_ENDPOINT = (options && options.language) ? `${SW_BRIGHTS_ENDPOINT}?lng=${options.language}` : SW_BRIGHTS_ENDPOINT

  return (dispatch: Function, getState: Function) => {
    const { items: { colors }, status: { activeRequest } } = getState().colors

    // if a request to load is active OR we already have colors loaded...
    if (activeRequest || colors) {
      // ... return out of here, do not load anything else
      return
    }

    dispatch(requestColors())

    return Promise
      .all([axios.get(COLOR_FAMILY_ENDPOINT), axios.get(BRIGHTS_ENDPOINT)])
      .then(r => {
        const colors = r[0].data
        const brights = r[1].data

        // TODO: populate families and sections with a new API call eventually
        // this'll obvs need to change with the selected language
        const sections: FamilyStructure = [
          {
            name: 'Historic Colors',
            families: [
              'Historic Color'
            ]
          },
          {
            name: 'Sherwin-Williams Colors',
            families: [
              'Red',
              'Orange',
              'Yellow',
              'Green',
              'Blue',
              'Purple',
              'Neutral',
              'White & Pastel'
            ]
          },
          {
            name: 'Timeless Colors',
            families: [
              'Timeless Color'
            ]
          }
        ]

        dispatch(receiveColors({
          colors,
          brights,
          sections
        }))
      })
  }
}

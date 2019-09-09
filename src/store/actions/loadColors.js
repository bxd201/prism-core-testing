// @flow
import axios from 'axios'

import { generateBrandedEndpoint } from '../../shared/helpers/DataUtils'
import { type Color, type FamilyStructure } from '../../shared/types/Colors'
import {
  COLOR_BRIGHTS_ENDPOINT,
  COLOR_CHUNKS_ENDPOINT,
  COLOR_FAMILY_NAMES_ENDPOINT,
  COLORS_ENDPOINT
} from '../../constants/endpoints'

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
      unorderedColors: colorData.unorderedColors,
      colors: colorData.colors,
      brights: colorData.brights,
      sections: colorData.sections
    }
  }
}

export const LOAD_ERROR: string = 'LOAD_ERROR'
const loadError = () => {
  return {
    type: LOAD_ERROR
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
export const loadColors = (brandId: string, options?: any) => {
  return (dispatch: Function, getState: Function) => {
    const COLOR_CHUNKS = generateBrandedEndpoint(COLOR_CHUNKS_ENDPOINT, brandId, options)
    const BRIGHTS_ENDPOINT = generateBrandedEndpoint(COLOR_BRIGHTS_ENDPOINT, brandId, options)
    const FAMILY_NAMES_ENDPOINT = generateBrandedEndpoint(COLOR_FAMILY_NAMES_ENDPOINT, brandId, options)
    const ALL_COLORS_ENDPOINT = generateBrandedEndpoint(COLORS_ENDPOINT, brandId, options)

    const { items: { colors }, status: { activeRequest } } = getState().colors

    // if a request to load is active OR we already have colors loaded...
    if (activeRequest || colors) {
      // ... return out of here, do not load anything else
      return
    }

    dispatch(requestColors())

    return Promise
      .all([
        axios.get(COLOR_CHUNKS),
        axios.get(BRIGHTS_ENDPOINT),
        axios.get(FAMILY_NAMES_ENDPOINT),
        axios.get(ALL_COLORS_ENDPOINT)
      ])
      .then(r => {
        const colors = r[0].data
        const brights = r[1].data
        const sections: FamilyStructure = r[2].data
        const unorderedColors = r[3].data

        dispatch(receiveColors({
          colors,
          brights,
          sections,
          unorderedColors
        }))
      })
      .catch(r => {
        dispatch(loadError())
      })
  }
}

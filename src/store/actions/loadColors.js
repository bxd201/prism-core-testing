// @flow
import axios from 'axios'
import { generateBrandedEndpoint } from '../../shared/helpers/DataUtils'
import { type Color, type FamilyStructure, type ColorStatuses } from '../../shared/types/Colors.js.flow'
import { COLOR_CHUNKS_ENDPOINT, COLOR_BRIGHTS_ENDPOINT, COLOR_FAMILY_NAMES_ENDPOINT, COLORS_ENDPOINT } from '../../constants/endpoints'
import store from 'src/store/store'

export const REQUEST_COLORS: string = 'REQUEST_COLORS'
const requestColors = () => ({ type: REQUEST_COLORS, payload: { loading: true, activeRequest: true } })

export const RECEIVE_COLORS: string = 'RECEIVE_COLORS'
const receiveColors = (colorData: any) => ({
  type: RECEIVE_COLORS,
  payload: mapColorDataToPayload(colorData)
})

export const LOAD_ERROR: string = 'LOAD_ERROR'
const loadError = (error) => ({ type: LOAD_ERROR, payload: error })

export const FILTER_BY_FAMILY: string = 'FILTER_BY_FAMILY'
export const filterByFamily = (family: string) => ({ type: FILTER_BY_FAMILY, payload: { family } })

export const FILTER_BY_SECTION: string = 'FILTER_BY_SECTION'
export const filterBySection = (section: string) => ({ type: FILTER_BY_SECTION, payload: { section } })

export const REMOVE_COLOR_FILTERS: string = 'REMOVE_COLOR_FILTERS'
export const removeColorFilters = () => ({ type: REMOVE_COLOR_FILTERS })

export const MAKE_ACTIVE_COLOR: string = 'MAKE_ACTIVE_COLOR'
export const makeActiveColor = (color: Color) => ({ type: MAKE_ACTIVE_COLOR, payload: { color } })

export const RESET_ACTIVE_COLOR: string = 'RESET_ACTIVE_COLOR'
export const resetActiveColor = () => ({ type: RESET_ACTIVE_COLOR })

export const MAKE_ACTIVE_COLOR_BY_ID: string = 'MAKE_ACTIVE_COLOR_BY_ID'
export const makeActiveColorById = (id?: string) => id ? { type: MAKE_ACTIVE_COLOR_BY_ID, payload: { id } } : resetActiveColor()

// TODO: Make this method configurable via options on call so specific color wall implementations can reuse it to load their colors
export const loadColors = (brandId: string, options: Object = {}) => {
  return (dispatch: Function, getState: Function = store.getState) => {
    // if a request to load is active OR we already have colors loaded return out of here, do not load anything else
    const { items: { colors }, status: { activeRequest } } = getState().colors
    const { current } = getState().language

    const _options = {
      language: current,
      ...options
    }

    if (activeRequest || colors) { return }

    dispatch(requestColors())

    return Promise
      .all(getColorsRequests(brandId, _options))
      .then(responses => {
        const colorData = mapResponsesToColorData(responses)
        dispatch(receiveColors(colorData))
      })
      .catch(r => dispatch(loadError(r)))
  }
}

export const EMIT_COLOR: string = 'EMIT_COLOR'
export const emitColor = (color: Color) => ({ type: EMIT_COLOR, payload: color })

export const UPDATE_COLOR_STATUSES: string = 'UPDATE_COLOR_STATUSES'
export const updateColorStatuses = (statuses: ColorStatuses) => ({ type: UPDATE_COLOR_STATUSES, payload: statuses })

export const mapColorDataToPayload = (colorData: Object) => {
  return {
    loading: false,
    activeRequest: false,
    unorderedColors: colorData.unorderedColors,
    colors: colorData.colors.values,
    colorLabels: colorData.colors.names,
    brights: colorData.brights,
    sections: colorData.sections
  }
}

export const getColorsRequests = (brandId: string, options?: any) => {
  return [
    axios.get(generateBrandedEndpoint(COLOR_CHUNKS_ENDPOINT, brandId, options)),
    axios.get(generateBrandedEndpoint(COLOR_BRIGHTS_ENDPOINT, brandId, options)),
    axios.get(generateBrandedEndpoint(COLOR_FAMILY_NAMES_ENDPOINT, brandId, options)),
    axios.get(generateBrandedEndpoint(COLORS_ENDPOINT, brandId, options))
  ]
}

export const mapResponsesToColorData = (responses: any[]) => {
  const [colors, brights, sections, unorderedColors]: [any, any, FamilyStructure, any] = responses.map(response => response.data)

  return { colors, brights, sections, unorderedColors }
}

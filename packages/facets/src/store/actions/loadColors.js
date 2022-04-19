// @flow
// @todo merge this into useColors hook -RS
import axios from 'axios'
import { generateBrandedEndpoint } from '../../shared/helpers/DataUtils'
import { type Color, type FamilyStructure, type ColorStatuses } from '../../shared/types/Colors.js.flow'
import { COLOR_CHUNKS_ENDPOINT, COLOR_BRIGHTS_ENDPOINT, COLOR_FAMILY_NAMES_ENDPOINT, COLORS_ENDPOINT, COLOR_CHUNKS_LAYOUT_ENDPOINT, COLORS_WALL_ENDPOINT } from '../../constants/endpoints'
import store from 'src/store/store'
import once from 'lodash/once'

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
export const filterByFamily = (family: ?string) => ({ type: FILTER_BY_FAMILY, payload: { family } })

export const FILTER_BY_SECTION: string = 'FILTER_BY_SECTION'
export const filterBySection = (section: string) => ({ type: FILTER_BY_SECTION, payload: { section } })

export const REMOVE_COLOR_FILTERS: string = 'REMOVE_COLOR_FILTERS'
export const removeColorFilters = () => ({ type: REMOVE_COLOR_FILTERS })

// TODO: Make this method configurable via options on call so specific color wall implementations can reuse it to load their colors
export const loadColors = once((brandId: string, options: Object = {}) => {
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
        dispatch(receiveColors(mapResponsesToColorData(responses)))
      })
      .catch(r => dispatch(loadError(r)))
  }
})

export const EMIT_COLOR: string = 'EMIT_COLOR'
export const emitColor = (color: Color) => ({ type: EMIT_COLOR, payload: color })

export const SHOW_COLOR_DETAILS_MODAL: string = 'SHOW_COLOR_DETAILS'
export const showColorDetailsModal = (color: Color) => ({ type: SHOW_COLOR_DETAILS_MODAL, payload: color })

export const HIDE_COLOR_DETAILS_MODAL: string = 'HIDE_COLOR_DETAILS'
export const hideColorDetailsModal = () => ({ type: HIDE_COLOR_DETAILS_MODAL })

export const UPDATE_COLOR_STATUSES: string = 'UPDATE_COLOR_STATUSES'
export const updateColorStatuses = (statuses: ColorStatuses) => ({ type: UPDATE_COLOR_STATUSES, payload: statuses })

export const mapColorDataToPayload = (colorData: Object) => ({
  loading: false,
  activeRequest: false,
  unorderedColors: colorData.unorderedColors,
  colors: colorData.colors.values,
  colorLabels: colorData.colors.names,
  brights: colorData.brights,
  sections: colorData.sections,
  chunksLayout: colorData.chunksLayout,
  wall: colorData.wall
})

export const getColorsRequests = (brandId: string, options?: any) => {
  return [
    // { data: { names: { [string]: string[] }, values: { [string]: number[][] } } }
    axios.get(generateBrandedEndpoint(COLOR_CHUNKS_ENDPOINT, brandId, options)),
    // { data: { [string]: string[][] } }
    axios.get(generateBrandedEndpoint(COLOR_BRIGHTS_ENDPOINT, brandId, options)),
    // { data: { default: boolean, families: string[], name: string }[] }
    axios.get(generateBrandedEndpoint(COLOR_FAMILY_NAMES_ENDPOINT, brandId, options)),
    // { data: { archived: boolean, blue: number, brandKey: string, brandedCollectionNames: string[], colorFamilyNames: string[], colorNumber: string, coordinatingColors: {}..... }[] }
    axios.get(generateBrandedEndpoint(COLORS_ENDPOINT, brandId, options)),
    axios.get(generateBrandedEndpoint(COLOR_CHUNKS_LAYOUT_ENDPOINT, brandId, options)),
    axios.get(generateBrandedEndpoint(COLORS_WALL_ENDPOINT, brandId, options))
  ]
}

export const mapResponsesToColorData = (responses: any[]) => {
  const [colors, brights, sections, unorderedColors, chunksLayout, wall]: [any, any, FamilyStructure, any, any, any] = responses.map(response => response?.data)
  return { colors, brights, sections, unorderedColors, chunksLayout, wall }
}

import { REQUEST_BRAND_COLORS, RECEIVE_BRAND_COLORS } from '../actions/brandColors'
// @todo - Remove below line & sw-colors-in-LAB.js file once API for brandColors is added -Pravin
import brandColorsArray from '../../shared/sw-colors-in-LAB'

export const initialState = { loading: false, data: brandColorsArray }

export default function brandColors (state = initialState, action = {}) {
  switch (action.type) {
    case REQUEST_BRAND_COLORS:
      return {
        ...state,
        ...action.payload
      }
    case RECEIVE_BRAND_COLORS:
      return {
        ...state,
        ...action.payload
      }
    default:
      return state
  }
}

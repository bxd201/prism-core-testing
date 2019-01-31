import _ from 'lodash'

import { LP_MAX_COLORS_ALLOWED } from 'constants/configurations'
import {
  ADD_LP_COLOR,
  REMOVE_LP_COLOR,
  ACTIVATE_LP_COLOR,
  ACTIVATE_LP_PREVIEW_COLOR,
  REORDER_LP_COLORS
} from '../actions/live-palette'

export const initialState = {}

export const lp = (state = initialState, action) => {
  switch (action.type) {
    case ADD_LP_COLOR:
      // check if there are already 7 colors added and if the color exists already before adding
      if (state.colors && state.colors.length < LP_MAX_COLORS_ALLOWED && !_.filter(state.colors, color => color.id === action.payload.color.id).length) {
        state.colors.push(action.payload.color)
      }

      return Object.assign({}, state, {
        colors: [
          ...state.colors
        ],
        activeColor: action.payload.color, // default newly added colors as the active color
        previousActiveColor: state.activeColor
      })

    case REMOVE_LP_COLOR:
      let activeColorIndex = 0 // set a default color index to return

      // remove payload color from the colors stored in state
      const colors = _.reject(state.colors, (color, index) => {
        if ((color.id === action.payload.colorId)) {
          if (index > 0) {
            activeColorIndex = index - 1
          }
        }

        return (color.id === action.payload.colorId)
      })

      let difference = _.difference(state.colors, colors)

      return Object.assign({}, state, {
        colors: [
          ...colors
        ],
        activeColor: colors[activeColorIndex] || null,
        previousActiveColor: state.activeColor,
        removedColor: difference.length ? difference[0] : void (0)
      })

    case ACTIVATE_LP_COLOR:
      return Object.assign({}, state, {
        activeColor: action.payload.color,
        previousActiveColor: state.activeColor
      })

    case ACTIVATE_LP_PREVIEW_COLOR:
      return Object.assign({}, state, {
        activePreviewColor: action.payload.color
      })

    case REORDER_LP_COLORS:
      // no colors are in the LP, why are you calling reorder?
      if (state.colors.length === 0) {
        return state
      }

      const { colorsByIndex } = action.payload

      // reconstruct the colors array given an array of their IDs
      const reconstructedColors = []
      for (let id = 0; id < colorsByIndex.length; id++) {
        const color = _.filter(state.colors, color => (color.id === colorsByIndex[id]))[0]
        reconstructedColors.push(color)
      }

      return Object.assign({}, state, {
        colors: [
          ...reconstructedColors
        ]
      })

    default:
      return state
  }
}

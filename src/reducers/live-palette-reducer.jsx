import _ from 'lodash'

import { LP_MAX_COLORS_ALLOWED } from 'constants/configurations'

export const lp = (state = {}, action) => {
  switch (action.type) {
    case 'ADD_LP_COLOR':
      // check if there are already 7 colors added and if the color exists already before adding
      if (state.colors.length < LP_MAX_COLORS_ALLOWED && !_.filter(state.colors, color => color.id === action.payload.color.id).length) {
        state.colors.push(action.payload.color)
      }
      return Object.assign({}, state, {
        colors: [
          ...state.colors
        ],
        activeColor: action.payload.color // default newly added colors as the active color
      })

    case 'REMOVE_LP_COLOR':
      const colors = _.reject(state.colors, (color) => (color.id === action.payload.colorId))

      return Object.assign({}, state, {
        colors: [
          ...colors
        ],
        activeColor: colors[0] || null // default to 1st color in list when one is removed, if it's the last color set to null
      })

    case 'ACTIVATE_LP_COLOR':
      return Object.assign({}, state, {
        activeColor: action.payload.color
      })

    default:
      return state
  }
}

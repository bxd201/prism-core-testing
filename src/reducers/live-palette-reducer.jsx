import _ from 'lodash'
/* eslint-disable no-debugger */
export const lp = (state = {}, action) => {
  switch (action.type) {
    case 'ADD_LP_COLOR':
      return Object.assign({}, state, {
        colors: [
          ...state.colors,
          action.payload.color
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

export const lp = (state = {}, action) => {
  switch (action.type) {
    case 'ADD_LP_COLOR':
      return [
        ...state,
        action.payload.color
      ]

    case 'REMOVE_LP_COLOR':
      const colors = state.filter(color => (color.id !== action.payload.colorId))
      return [
        ...colors
      ]

    default:
      return state
  }
}

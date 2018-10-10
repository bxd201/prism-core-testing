export const lp = (state = {}, action) => {
  switch (action.type) {
    case 'ADD_LP_COLOR':
      return [
        ...state,
        action.payload.color
      ]

    default:
      return state
  }
}
